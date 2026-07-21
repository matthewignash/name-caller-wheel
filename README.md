# Name Caller Wheel

A spinning wheel for calling on students, built as a single static HTML page.

**Try it:** open `index.html` in any browser, or visit the live demo. No setup, no account, no network — it runs entirely client-side on a bundled sample roster.

This is a work in progress:

- [x] Phase 1 — wheel, demo mode, teacher controls, round tracking
- [ ] Phase 2 — separate teacher and projector views with same-browser sync
- [ ] Phase 3 — optional private Google Sheet backend (your roster, your key, never in this repo)
- [ ] Phase 4 — full write-up and 15-minute setup guide

The finished README will explain the whole pattern: a public static frontend on GitHub Pages, a private Google Apps Script backend, and a secret key that lives only in Script Properties — so the public site shows sample data while the owner's devices load real class lists.

## License

MIT
