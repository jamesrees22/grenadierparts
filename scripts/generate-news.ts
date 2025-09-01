/* eslint-disable no-console */
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import * as cheerio from "cheerio";

// ---------- Types ----------
type FeedItem = { title: string; link: string; pubDate?: string };
type PickedItem = { title: string; link: string; date: string };
type SeenRecord = Record<string, PickedItem>;
type OpenAIChatResponse = { choices?: Array<{ message?: { content?: string } }> };

// ---------- Config ----------
// Title-level positives: vehicle/platform focused
const TITLE_KEYWORDS = [
  "ineos grenadier",
  "ineos quartermaster",
  "ineos trailmaster",
  "ineos fieldmaster",
  "ineos automotive",
  "grenadier 4x4",      // allow singular + strong auto hint
  "quartermaster 4x4"
];

// Automotive context hints (broaden acceptance)
const AUTO_HINTS = [
  "4x4","4wd","awd","off-road","overland","suv","ute","pickup","pick-up",
  "review","first drive","test drive","road test","spec","specs","price","pricing","release","launch",
  "engine","diesel","petrol","bmw","b58","power","torque","towing","payload",
  "diff","locking","low range","transfer case","ladder frame","ground clearance","axle","winch"
];

// Hard negatives (cycling team etc.)
const NEGATIVE_STRICT = [
  "ineos grenadiers"     // the cycling team (plural)
];

// Soft negatives (any cycling context)
const NEGATIVE_HINTS = [
  "cycling","peloton","tour de france","tdf","giro","vuelta","stage win","stage",
  "uci","rider","team roster","cyclingnews","grand tour"
];

const MAX_PER_RUN = 10;
const SUMMARY_DELAY_MS = 400;
const RELEVANCE_PARAGRAPHS = 6; // how many <p> to scan for content check

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const DATA_DIR = path.join(process.cwd(), "data");
const FEEDS_FILE = path.join(DATA_DIR, "feeds.json");
const SEEN_FILE = path.join(DATA_DIR, "seen.json");

// ---------- Helpers ----------
function monthLabel(d = new Date()) {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(d);
}
function ymd(d = new Date()) { return d.toISOString().slice(0, 10); }
function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 90);
}
function hash(input: string) { return crypto.createHash("sha1").update(input).digest("hex"); }
function canonical(url: string) {
  try { const u = new URL(url); u.hash = ""; return u.toString(); } catch { return url; }
}
function escapeRegExp(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function hasWord(haystack: string, word: string) {
  return new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").test(haystack);
}
function includesAny(haystack: string, arr: string[]) {
  const lo = haystack.toLowerCase();
  return arr.some(k => lo.includes(k));
}

async function get(url: string) {
  const controller = new AbortController(); const t = setTimeout(() => controller.abort(), 15_000);
  const init: any = {
    headers: { "user-agent": "grenadierparts.com news-bot (+https://grenadierparts.com)" },
    signal: controller.signal,
  };
  try {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
    return await res.text();
  } finally { clearTimeout(t); }
}

/**
 * Image extractor with favicon fallback.
 * 1) Try og:image / twitter:image
 * 2) Else return site favicon (/favicon.ico)
 * Returns absolute URL or null.
 */
function extractImage($: cheerio.CheerioAPI, base: string): string | null {
  const raw =
    $("meta[property='og:image']").attr("content") ||
    $("meta[name='twitter:image']").attr("content") ||
    $("meta[name='twitter:image:src']").attr("content") ||
    null;

  if (raw) {
    try {
      const abs = new URL(raw, base).toString();
      if (abs.toLowerCase().endsWith(".gif")) return null; // skip likely tiny trackers
      return abs;
    } catch { /* ignore */ }
  }

  try {
    const u = new URL(base);
    return `${u.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

// ---------- Relevance logic ----------
function hasNegative(s: string) {
  const lo = s.toLowerCase();
  // exact/word-boundary for "grenadiers" plural
  if (/\bineos\s+grenadiers\b/i.test(lo)) return true;
  if (/\bgrenadiers\b/i.test(lo) && lo.includes("ineos")) return true;
  // soft cycling hints
  return includesAny(lo, NEGATIVE_HINTS);
}

function titleLikelyRelevant(title: string) {
  const lo = title.toLowerCase();
  if (hasNegative(lo)) return false;

  // Strong matches
  if (includesAny(lo, TITLE_KEYWORDS)) return true;

  // Singular "grenadier" with automotive hints (avoid plural)
  const hasSingularGrenadier = hasWord(lo, "grenadier") && !hasWord(lo, "grenadiers");
  const hasQuartermaster = hasWord(lo, "quartermaster");

  if ((hasSingularGrenadier || hasQuartermaster) && includesAny(lo, AUTO_HINTS)) return true;

  // "Ineos" with automotive hints
  if (hasWord(lo, "ineos") && includesAny(lo, AUTO_HINTS)) return true;

  return false;
}

function contentLikelyRelevant(text: string) {
  const lo = text.toLowerCase();
  if (hasNegative(lo)) return false;

  // Direct, unambiguous phrases
  if (/\bineos\s+grenadier\b/i.test(lo)) return true;
  if (/\bineos\s+quartermaster\b/i.test(lo)) return true;
  if (/\bineos\s+automotive\b/i.test(lo)) return true;

  const hasSingularGrenadier = hasWord(lo, "grenadier") && !hasWord(lo, "grenadiers");
  const hasQuartermaster = hasWord(lo, "quartermaster");
  const ineosPresent = hasWord(lo, "ineos");

  // Automotive context present?
  const autoContext = includesAny(lo, AUTO_HINTS);

  // Accept if
  //  - "grenadier" (singular) OR "quartermaster" with automotive context
  //  - OR "ineos" + automotive context
  if ((hasSingularGrenadier || hasQuartermaster) && autoContext) return true;
  if (ineosPresent && autoContext) return true;

  return false;
}

// Tolerant feed fetcher
async function fetchFeed(url: string) {
  const text = await get(url);
  const looksXml = /^\s*<\?xml|^\s*<(rss|feed)\b/i.test(text);
  const $ = cheerio.load(text, { xmlMode: looksXml });

  const items: FeedItem[] = [];
  let rssCount = 0, atomCount = 0;

  $("item").each((_, el) => {
    const title = $(el).find("title").first().text().trim();
    let link = $(el).find("link").first().text().trim();
    if (!link) {
      const guid = $(el).find("guid[ispermalink='true'], guid[isPermaLink='true']").first().text().trim();
      if (guid) link = guid;
    }
    const pubDate = $(el).find("pubDate").first().text().trim();
    if (title && link) { items.push({ title, link: canonical(link), pubDate }); rssCount++; }
  });

  $("entry").each((_, el) => {
    const title = $(el).find("title").first().text().trim();
    let link =
      $(el).find("link[rel='alternate'][href]").first().attr("href")?.trim() ||
      $(el).find("link[href]").first().attr("href")?.trim() || "";
    const pubDate = $(el).find("updated, published").first().text().trim();
    if (title && link) { items.push({ title, link: canonical(link), pubDate }); atomCount++; }
  });

  if (!items.length) {
    const title =
      $("meta[property='og:title']").attr("content") ||
      $("meta[name='twitter:title']").attr("content") || $("title").text();
    const link = $("meta[property='og:url']").attr("content") ||
                 $("link[rel='canonical']").attr("href") || url;
    if (title && link) items.push({ title, link: canonical(link) });
  }

  console.log(`Parsed feed: ${url}  (RSS: ${rssCount}, Atom: ${atomCount}, Total: ${items.length})`);
  return items;
}

async function fetchArticleSummary(url: string, title: string) {
  let summary = "";
  let image: string | null = null;

  try {
    const html = await get(url);
    const $ = cheerio.load(html);
    const text = $("p").slice(0, 8).text().replace(/\s+/g, " ").trim().slice(0, 1200);
    summary = text || "Summary not available.";
    image = extractImage($, url);
  } catch {
    summary = "Summary not available.";
    image = extractImage(cheerio.load(""), url);
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
  if (OPENAI_API_KEY && summary !== "Summary not available.") {
    try {
      const prompt =
        `Summarise in 2 concise sentences, neutral and factual, focused on Ineos Grenadier / 4x4 relevance only. ` +
        `Avoid speculation or marketing language. Do not invent details.\n\nTitle: ${title}\n\nText:\n${summary}`;

      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        }),
      });
      if (r.ok) {
        const j = (await r.json()) as OpenAIChatResponse;
        const content = j.choices?.[0]?.message?.content?.trim();
        if (content) summary = content;
      }
    } catch { /* keep heuristic */ }
  }

  return { summary, image };
}

function ensureDir(p: string) { fs.mkdirSync(p, { recursive: true }); }
function loadJSON<T>(file: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(file, "utf8")) as T; } catch { return fallback; }
}
function isoWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function fetchContentSample(url: string): Promise<string> {
  try {
    const html = await get(url);
    const $ = cheerio.load(html);
    return $("p").slice(0, RELEVANCE_PARAGRAPHS).text().replace(/\s+/g, " ").trim().slice(0, 1500);
  } catch {
    return "";
  }
}

// ---------- Main ----------
async function main() {
  ensureDir(DATA_DIR); ensureDir(POSTS_DIR);

  const feeds: string[] = loadJSON(FEEDS_FILE, []);
  const seen: SeenRecord = loadJSON(SEEN_FILE, {});
  if (!feeds.length) { console.warn(`No feeds in ${FEEDS_FILE}`); return; }

  let candidates: FeedItem[] = [];
  for (const f of feeds) {
    try { candidates.push(...(await fetchFeed(f))); }
    catch (e) { console.warn("Feed error:", f, (e as Error).message); }
  }
  console.log(`Total candidate items parsed: ${candidates.length}`);

  const picked: PickedItem[] = [];
  for (const it of candidates) {
    const title = it.title || "";

    // quick skip for negatives
    if (hasNegative(title)) {
      // console.log(`Skip (negative in title): ${title}`);
      continue;
    }

    const likely = titleLikelyRelevant(title);
    const maybe = likely || /(?:\bineos\b|\bgrenadier\b|\bquartermaster\b)/i.test(title);

    const url = it.link ? canonical(it.link) : "";
    if (!url) continue;

    const h = hash(url);
    if (seen[h]) continue;

    // SECONDARY FILTER: if likely or maybe, confirm by article content
    if (maybe) {
      const sample = await fetchContentSample(url);
      if (!contentLikelyRelevant(sample)) {
        console.log(`Rejected likely false-positive: ${title}`);
        continue;
      }
    } else {
      continue; // not even maybe
    }

    const date = it.pubDate ? new Date(it.pubDate).toISOString().slice(0, 10) : ymd();
    picked.push({ title, link: url, date });
    seen[h] = { title, link: url, date };

    if (picked.length >= MAX_PER_RUN) break;
    if (SUMMARY_DELAY_MS) await sleep(120);
  }
  console.log(`Relevant new items picked: ${picked.length}`);

  if (!picked.length) {
    fs.writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));
    console.log("No new items.");
    return;
  }

  const summaries: Array<PickedItem & { summary: string; image?: string | null }> = [];
  for (const p of picked) {
    const { summary, image } = await fetchArticleSummary(p.link, p.title);
    summaries.push({ ...p, summary, image: image || undefined });
    if (SUMMARY_DELAY_MS) await sleep(SUMMARY_DELAY_MS);
  }

  const now = new Date();
  const label = monthLabel(now);
  const week = isoWeek(now);

  const slug = slugify(`grenadier-news-${label}-w${week}`);
  const outFile = path.join(POSTS_DIR, `${slug}.md`);
  const title = `Ineos Grenadier News Roundup — ${label} (Week ${week})`;
  const today = ymd();

  const body = summaries.map((s, i) => {
      const thumb = s.image
        ? `<img src="${s.image}" alt="" loading="lazy" style="max-width:100%;height:auto;border-radius:8px;margin:6px 0 10px;border:1px solid #1e2937" />\n`
        : "";
      return `### ${i + 1}. ${s.title}
${thumb}${s.summary}

👉 Source: ${s.link}
`;
    }).join(`\n---\n\n`);

  const md = `---
title: "${title}"
date: "${today}"
excerpt: "Latest headlines and community updates about the Ineos Grenadier — ${label}, Week ${week}."
image: "/grenadier.jpg"
image_credit: "Image © James Rees or licensed stock"
tags:
  - news
category: news
---

Welcome to the ${label} (Week ${week}) Grenadier News Roundup. Here are the key headlines and updates from around the web.

---

${body}

---

*Disclosure: Some links may be affiliate links. If you purchase through them, we may earn a small commission at no extra cost to you.*
`;

  fs.writeFileSync(outFile, md, "utf8");
  fs.writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));
  console.log(`Created ${path.relative(process.cwd(), outFile)}`);
}

main().catch(e => { console.error(e); process.exit(1); });
