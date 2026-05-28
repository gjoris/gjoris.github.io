---
title: "Projects"
date: 2025-10-12
draft: false
---

## marktplaats-2dehands-mcp

An MCP server that lets AI assistants search and monitor [marktplaats.nl](https://www.marktplaats.nl) and [2dehands.be](https://www.2dehands.be). Both sites are operated by Adevinta and share the same internal JSON API, so a single server covers both via a `site` parameter.

**Features:**
- 18 MCP tools, 9 public + 9 authenticated
- Search, listing details, seller profiles, category filters
- Local saved-search monitoring with delta detection
- Optional one-time login (Playwright) for inbox, own listings, favorites, bid tracking
- 100% test coverage on public code, daily end-to-end checks against the live API
- Cross-platform (macOS, Linux, Windows)

**Tech Stack:** Python, MCP, `requests`, Playwright (optional), GitHub Actions

[View on GitHub](https://github.com/gjoris/marktplaats-2dehands-mcp) | [Latest release](https://github.com/gjoris/marktplaats-2dehands-mcp/releases)

---

## Fasleutel - Music Notes Quiz

An interactive web application that helps musicians practice reading treble and bass clefs. Built with vanilla JavaScript, featuring multiple game modes and multilingual support.

**Features:**
- Practice Mode, Time Attack, and Sprint modes
- Support for 6 languages
- Real-time feedback and progress tracking
- Responsive design for all devices

**Tech Stack:** JavaScript, HTML5, SVG, Bulma CSS

[Try it live](https://gjoris.github.io/fasleutel/) | [View on GitHub](https://github.com/gjoris/fasleutel)

---

## Personal Tech Blog

This blog itself is a project! A modern, multilingual tech blog built with Hugo and custom styling.

**Features:**
- Multilingual support (EN/NL)
- Modern gradient design
- Dark mode support
- Giscus comments integration
- GoatCounter analytics

**Tech Stack:** Hugo, DoIt theme, Custom CSS/JS

[View on GitHub](https://github.com/gjoris/gjoris.github.io)

---

*More projects coming soon...*
