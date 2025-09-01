/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

// ---------- Config ----------
const KEYWORDS = [
  "ineos grenadier",
  "grenadier",
  "quartermaster",
  "fieldmaster",
  "trailmaster",
  "4x4",
  "off-road",
  "overland",
  "overlanding"
];

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const DATA_DIR = path.join(process.cwd(), "data");
const FEEDS_FILE = path.join(DATA_DIR, "feeds.json");
const SEEN_FILE = path.join(DATA_DIR, "seen.json"); // store hashes/urls we already used

// Month label for the roundup
function monthLabel(d = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
  return fmt.format(d); // e.g., "September 2025"
}

function ymd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 90);
}

function hash(input: string) {
  return crypto.createHash("sha1").update(input).digest("hex");
}

async function get(url: string) {
  const res = await fetch(url, { headers: { "user-agent": "grenadierparts.com news-bot" } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return await res.text();
}

// extremely tolerant RSS/Atom fetcher (falls back to og tags from HTML if needed)
async function fetchFeed(url: string) {
  const text = await get(url);
  const $ = cheerio.load(text, { xmlMode: text.trim().startsWith("<?xml") });
  const items: { title: string; link: string; pubDate?: string }[] = [];

  // RSS
  $("item").each((_, el) => {
    const title = $(el).find("title").first().text().trim();
    const link = $(el).find("link").first().text().trim();
    const pubDate = $(el).find("pubDate").first().text().trim();
    if (title && link) items.push({ title, link, pubDate });
  });

  // Atom
  $("entry").each((_, el) => {
    const title = $(el).find("title").first().text().trim();
    const link = $(el).find("link[href]").first().attr("href")?.trim() || "";
    const pubDate = $(el).find("updated, published").first().text().trim();
    if (title && link) items.push({ title, link, pubDate });
  });

  // If nothing parsed but HTML page, try OG links (some blogs expose feed-like pages)
  if (!items.length) {
    const title = $("meta[property='og:title']").attr("content") || $("title").text();
    const link = $("meta[property='og:url']").attr("content") || url;
    if (title) items.push({ title, link });
  }
  return items;
}

function keywordMatch(s: string) {
  const lo = s.toLowerCase();
  return KEYWORDS.some(k => lo.includes(k));
}

async function fetchArticleSummary(url: string, title: string) {
  // Pull the article HTML and summarise heuristically, or use OpenAI if key is provided
  let summary = "";
  try {
    const html = await get(url);
    const $ = cheerio.load(html);
    const text = $("p").slice(0, 8).text().replace(/\s+/g, " ").trim().slice(0, 1200);
    summary = text || "Summary not available.";
  } catch {
    summary = "Summary not available.";
  }

  // Optional: use OpenAI for better summary if OPENAI_API_KEY provided
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
  if (OPENAI_API_KEY && summary !== "Summary not available.") {
    try {
      const prompt = `Summarise the following article in 2–3 sentences focusing on Ineos Grenadier/4x4 relevance. Keep it neutral and factual.\n\nTitle: ${title}\n\nText:\n${summary}`;
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        })
      });
      if (r.ok) {
        const j = await r.json();
        const content = j.choices?.[0]?.message?.content?.trim();
        if (content) summary = content;
      }
    } catch {}
  }

  return summary;
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function loadJSON<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function main() {
  ensureDir(DATA_DIR);
  ensureDir(POSTS_DIR);

  const feeds: string[] = loadJSON(FEEDS_FILE, []);
  const seen: Record<string, { title: string; link: string; date: string }> = loadJSON(SEEN_FILE, {});

  let candidates: { title: string; link: string; pubDate?: string }[] = [];
  for (const f of feeds) {
    try {
      const items = await fetchFeed(f);
      candidates.push(...items);
    } catch (e) {
      console.warn("Feed error:", f, (e as Error).message);
    }
  }

  // Filter for Grenadier/4x4 relevance and dedupe by link hash
  const picked: { title: string; link: string; date: string }[] = [];
  for (const it of candidates) {
    const t = it.title || "";
    if (!keywordMatch(t)) continue;
    const url = it.link || "";
    if (!url) continue;
    const h = hash(url);
    if (seen[h]) continue;
    const date = it.pubDate ? new Date(it.pubDate).toISOString().slice(0, 10) : ymd();
    picked.push({ title: t, link: url, date });
    seen[h] = { title: t, link: url, date };
    if (picked.length >= 10) break; // cap per run
  }

  if (!picked.length) {
    console.log("No new relevant items found.");
    fs.writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));
    return;
  }

  // Summarise each item
  const summaries: { title: string; link: string; date: string; summary: string }[] = [];
  for (const p of picked) {
    const s = await fetchArticleSummary(p.link, p.title);
    summaries.push({ ...p, summary: s });
  }

  // Build monthly roundup MD
  const label = monthLabel(new Date());
  const slug = slugify(`grenadier-news-${label}`);
  const outFile = path.join(POSTS_DIR, `${slug}.md`);
  const title = `Ineos Grenadier News Roundup — ${label}`;
  const today = ymd();

  const body = summaries
    .map(
      (s, i) =>
        `### ${i + 1}. ${s.title}\n` +
        `${s.summary}\n\n` +
        `👉 Source: ${s.link}\n`
    )
    .join(`\n---\n\n`);

  const md = `---
title: "${title}"
date: "${today}"
excerpt: "Latest headlines and community updates about the Ineos Grenadier — ${label}."
image: "/grenadier.jpg"
image_credit: "Image © James Rees or licensed stock"
---

Welcome to the ${label} Grenadier News Roundup. Here are the key headlines and updates from around the web.

---

${body}

---

*Disclosure: Some links may be affiliate links. If you purchase through them, we may earn a small commission at no extra cost to you.*
`;

  fs.writeFileSync(outFile, md, "utf8");
  fs.writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));
  console.log(`Created ${path.relative(process.cwd(), outFile)}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
