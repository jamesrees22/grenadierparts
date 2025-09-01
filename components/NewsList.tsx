// components/NewsList.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import type { NewsPost } from "@/lib/news";

type Props = {
  initialPosts: NewsPost[];
};

type Region = "All" | "UK" | "US" | "AU" | "EU" | "CA" | "NZ" | "ZA" | "Global";

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function formatDate(iso: string) {
  try {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
}

export default function NewsList({ initialPosts }: Props) {
  // Derive all known regions from posts (front-matter locations or tags)
  const allRegions = React.useMemo<Region[]>(() => {
    const gathered: string[] = [];
    for (const p of initialPosts) {
      if (p.locations?.length) gathered.push(...p.locations);
      // fallback: some posts only had tags
      if (p.tags?.length) {
        for (const t of p.tags) {
          if (["UK","US","AU","EU","CA","NZ","ZA","Global"].includes(t)) gathered.push(t);
        }
      }
    }
    const set = uniq(gathered).filter(Boolean) as Region[];
    set.sort();
    return ["All", ...set];
  }, [initialPosts]);

  const [region, setRegion] = React.useState<Region>("All");
  const [from, setFrom] = React.useState<string>(""); // YYYY-MM-DD
  const [to, setTo] = React.useState<string>("");

  const filtered = React.useMemo(() => {
    const fromTime = from ? new Date(from).getTime() : -Infinity;
    const toTime   = to   ? new Date(to).getTime()   : Infinity;

    return initialPosts.filter((p) => {
      // Region filter
      if (region !== "All") {
        const locs = p.locations || [];
        const tags = p.tags || [];
        const inLoc = locs.includes(region) || tags.includes(region);
        if (!inLoc) return false;
      }
      // Date filter
      const t = p.date ? new Date(p.date).getTime() : NaN;
      if (!Number.isNaN(t)) {
        if (t < fromTime) return false;
        if (t > toTime) return false;
      }
      return true;
    });
  }, [initialPosts, region, from, to]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="w-full gap-3 grid" style={{ gridTemplateColumns: "1fr", rowGap: 12 }}>
        <div className="flex flex-wrap gap-8 items-end">
          <label className="flex flex-col gap-1 min-w-[180px]">
            <span className="text-sm opacity-80">Region</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              className="border rounded-lg px-3 py-2"
            >
              {allRegions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-80">From date</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-80">To date</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </label>

          <button
            onClick={() => { setRegion("All"); setFrom(""); setTo(""); }}
            className="border rounded-lg px-3 py-2"
            title="Clear filters"
          >
            Clear
          </button>
        </div>
      </div>

      {/* List */}
      <ul className="space-y-4">
        {filtered.map((p) => {
          const regions = uniq([...(p.locations || []), ...(p.tags || []).filter(t => ["UK","US","AU","EU","CA","NZ","ZA","Global"].includes(t))]);
          return (
            <li key={p.slug} className="border rounded-xl p-4 hover:shadow-sm transition">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="text-lg font-medium">
                  <Link href={`/posts/${p.slug}`} className="hover:underline">{p.title}</Link>
                </h3>
                <div className="text-sm opacity-70">{formatDate(p.date)}</div>
              </div>

              {p.excerpt ? (
                <p className="mt-1 opacity-85">{p.excerpt}</p>
              ) : null}

              {regions.length ? (
                <div className="mt-2 flex flex-wrap gap-6 items-center">
                  <div className="text-sm opacity-70">Regions:</div>
                  <div className="flex gap-6 flex-wrap">
                    {regions.map((r) => (
                      <span
                        key={r}
                        className="text-xs px-2 py-1 rounded-full border"
                        title={`Tagged: ${r}`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}

        {!filtered.length && (
          <li className="opacity-70">No posts match these filters.</li>
        )}
      </ul>
    </div>
  );
}
