"use client";

import { useState, useEffect } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  // Close the menu when changing routes (basic heuristic)
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    window.addEventListener("popstate", close);
    return () => {
      window.removeEventListener("hashchange", close);
      window.removeEventListener("popstate", close);
    };
  }, []);

  return (
    <nav className="nav">
      <button
        aria-label="Toggle menu"
        className="nav__toggle"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="nav__toggle-bar" />
        <span className="nav__toggle-bar" />
        <span className="nav__toggle-bar" />
      </button>

      <ul className={`nav__list ${open ? "is-open" : ""}`}>
        <li><a href="/" className="link">Home</a></li>
        <li><a href="/category/accessories" className="link">Accessories</a></li>
        <li><a href="/category/maintenance" className="link">Maintenance</a></li>
        <li><a href="/news" className="link">News</a></li>
        <li><a href="/disclosure" className="link">Disclosure</a></li>
      </ul>
    </nav>
  );
}
