---
title: "An MCP Server for Marktplaats and 2dehands"
date: 2026-05-28T11:30:00+02:00
draft: false
description: "I built an MCP server that lets any AI assistant search and monitor listings on marktplaats.nl and 2dehands.be — both the public side and your own account."
images: ["/images/post-hero.png"]
categories:
  - Tooling
  - AI
tags:
  - MCP
  - Python
  - Reverse engineering
---

I wanted to be able to ask my AI assistant things like *"keep an eye on Trek Emonda bikes under €2000 within 30 km of Antwerp"* and have it actually go and look. The Model Context Protocol (MCP) makes that wiring possible, so I built [marktplaats-2dehands-mcp](https://github.com/gjoris/marktplaats-2dehands-mcp): a single MCP server that covers both [marktplaats.nl](https://www.marktplaats.nl) and [2dehands.be](https://www.2dehands.be).

<!--more-->

## What is MCP, briefly

MCP is an open protocol that AI assistants use to talk to external tools. It started at Anthropic but is now supported by a growing set of clients — Claude Code, Cursor, Cline, Continue, Zed, ChatGPT's desktop app, and anything else that wires up tool use. You write a server that exposes a set of typed function calls; the assistant decides when to invoke them. The MCP server I built provides 18 of these calls — searching, fetching listing details, monitoring saved searches, reading your inbox, and so on — and the assistant figures out which one to use from a natural-language request.

## The website blocks scrapers, but the API doesn't

Both marktplaats.nl and 2dehands.be sit behind Cloudflare, and their HTML pages are not friendly to bots. The interesting discovery: their internal JSON API at `/lrp/api/search` is wide open. No auth, no rate limiting, identical response shape on both sites. Both are owned by Adevinta and share the same backend — so a single search call works for either by just swapping the hostname.

That meant I could skip the entire "headless browser with stealth plugins" rabbit hole and write a normal Python `requests` wrapper.

```python
def search(site: str, params: dict) -> dict:
    response = requests.get(search_url(site), params=params, timeout=15)
    response.raise_for_status()
    return response.json()
```

Two sites, one parameter, no Playwright in sight.

## Listing detail pages were the next puzzle

Searching is one thing — opening a single listing was harder. There's no public JSON endpoint for individual listings, and scraping the rendered Dutch UI text (`Beschrijving`, `Kenmerken`, `Sinds 10 jan '26`) is the kind of code that breaks every time the front-end team changes a label.

After poking around in DevTools I noticed every listing page has a `<script>window.__CONFIG__ = {…}</script>` block — the hydration state the SPA boots from. It contains the entire listing as structured JSON: title, prices, image gallery, view count, online-since timestamp. Extract that, and you skip BeautifulSoup entirely.

Net effect: zero language-dependent parsing, much more robust to layout changes, and the type information goes from "string scraped out of HTML" to "actual integers and ISO 8601 timestamps".

## The toolset

The server exposes nine **public** tools (no login needed):

- Searching (`search_listings`) with the full filter set: price, distance, condition, category, seller type
- Listing details (`get_listing_details`)
- Seller profiles (`get_seller_info`)
- Categories and per-category attribute filters
- Local saved searches with delta detection — `check_saved_search` returns only listings I haven't seen yet, so the second call doesn't drown me in old results

And nine **authenticated** tools, behind a one-time login:

- Inbox unread counts and conversation list
- My own listings
- My favorites and bid favorites
- Saved searches stored on the marktplaats account itself

Authentication is opt-in via a separate Python extra (`pip install …[auth]`) so users who only want public search don't pull in Playwright + Chromium.

## A small bug that proved the testing approach

The end-to-end test suite caught something I would otherwise have missed: my initial `get_seller_info` mapping was based on field names from an older library and quietly returned `id=None`, `name=None`, `is_verified=False` for every seller. Because unit tests mocked the response with the *expected* shape, they passed; but the live API actually returns a completely different shape — only verification flags, payment method, and aggregated reviews. The seller's name and id come from the search result, not the profile endpoint.

A daily GitHub Actions job now runs the live tests against both sites and opens an issue when something breaks upstream. It's already paid for itself once.

## Where it stops, on purpose

A natural next step is *placing bids* and *sending messages to sellers*. I'm not going there — at least not yet. Reading the Adevinta terms of service: bulk extraction of listings is fine for personal use, but **placing ads or messages through automated systems** is explicitly forbidden in Article 7. Bids are the highest-stakes write action because each one is a real offer that a seller can accept, and a misconfigured bot could rack up unwanted commitments fast.

The authenticated *read* path is comfortable: monitoring my own inbox, listings, and favorites is indistinguishable from using the mobile app, which talks to the same API. Writing is a different discussion that I'd rather have explicitly when there's a concrete use case.

## Some things I picked up along the way

- **Investigate before designing.** I started PR4 expecting to find a JSON listing endpoint and instead found a hydration blob in the HTML. Without that 30 minutes of upfront poking around, the server would have a much more fragile parser.
- **Optional dependencies are worth the small effort.** Splitting Playwright into a `[auth]` extra means the base install stays at a few MB and an `uvx` invocation is fast. Authenticated users opt in.
- **Functional coverage > line coverage for end-to-end tests.** A meta-test asserts that every MCP tool was hit against every site at least once during the run. Adding a new tool without an e2e test now fails CI explicitly.
- **The TOS conversation is worth having.** Not as a legal exercise but as a design constraint. It changed which features I built and which I refused to.

## Try it

The server runs over stdio. In any MCP-aware client — Claude Code, Cursor, Cline, Continue, Zed — you point it at the Git repo with `uvx`:

```jsonc
{
  "mcpServers": {
    "marktplaats-2dehands": {
      "type": "stdio",
      "command": "uvx",
      "args": [
        "git+https://github.com/gjoris/marktplaats-2dehands-mcp",
        "marktplaats-2dehands-mcp"
      ]
    }
  }
}
```

The exact place to drop that snippet differs per client (see your client's docs for MCP setup), but the snippet itself is portable. Source and full docs: [github.com/gjoris/marktplaats-2dehands-mcp](https://github.com/gjoris/marktplaats-2dehands-mcp).
