"use client";

import * as React from "react";
import Link from "next/link";
import type { NewsPost } from "@/lib/news";

type Props = { initialPosts: NewsPost[] };
type Region = "All" | "UK" | "US" | "AU" | "EU" | "CA" | "NZ" | "ZA" | "Global";
type SortOrder = "newest" | "oldest";

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
  // Derive regions from front-matter locations or tags
  const allRegions = React.useMemo<Region[]>(() => {
    const gathered: string[] = [];
    for (const p of initialPosts) {
      if (p.locations?.length) gathered.push(...p.locations);
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
  const [sort, setSort] = React.useState<SortOrder>("newest");

  const filteredAndSorted = React.useMemo(() => {
    const filtered = initialPosts.filter((p) => {
      if (region === "All") return true;
      const locs = p.locations || [];
      const tags = p.tags || [];
      return locs.includes(region) || tags.includes(region);
    });

    return filtered.sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : 0;
      const tb = b.date ? new Date(b.date).getTime() : 0;
      return sort === "newest" ? tb - ta : ta - tb;
    });
  }, [initialPosts, region, sort]);

  return (
    <div className="space-y-6">
      {/* Filters - simple, elegant */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          <span className="text-sm opacity-80">Location</span>
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

        <label className="flex items-center gap-2">
          <span className="text-sm opacity-80">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>

      {/* List */}
      <ul className="space-y-4">
        {filteredAndSorted.map((p) => {
          const regions = uniq([
            ...(p.locations || []),
            ...(p.tags || []).filter(t => ["UK","US","AU","EU","CA","NZ","ZA","Global"].includes(t)),
          ]);

          return (
            <li key={p.slug} className="border rounded-xl p-4 hover:shadow-sm transition">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="text-lg font-medium">
                  <Link href={`/posts/${p.slug}`} className="hover:underline">
                    {p.title}
                  </Link>
                </h3>
                <div className="text-sm opacity-70">{formatDate(p.date)}</div>
              </div>

              {p.excerpt ? (
                <p className="mt-1 opacity-85">{p.excerpt}</p>
              ) : null}

              {regions.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
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
              ) : null}
            </li>
          );
        })}

        {!filteredAndSorted.length && (
          <li className="opacity-70">No posts found.</li>
        )}
      </ul>
    </div>
  );
}
