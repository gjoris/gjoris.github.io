---
title: "Projecten"
date: 2025-10-12
draft: false
---

## marktplaats-2dehands-mcp

Een MCP server waarmee AI-assistenten kunnen zoeken en monitoren op [marktplaats.nl](https://www.marktplaats.nl) en [2dehands.be](https://www.2dehands.be). Beide sites zijn van Adevinta en delen dezelfde interne JSON API, dus één server dekt allebei via een `site` parameter.

**Kenmerken:**
- 18 MCP tools, 9 publiek + 9 authenticated
- Zoeken, advertentiedetails, verkoperprofielen, categoriefilters
- Lokale saved-search monitoring met delta-detectie
- Optionele eenmalige login (Playwright) voor inbox, eigen advertenties, favorieten, bid tracking
- 100% test coverage op publieke code, dagelijkse end-to-end checks tegen de live API
- Cross-platform (macOS, Linux, Windows)

**Tech Stack:** Python, MCP, `requests`, Playwright (optioneel), GitHub Actions

[Bekijk op GitHub](https://github.com/gjoris/marktplaats-2dehands-mcp) | [Laatste release](https://github.com/gjoris/marktplaats-2dehands-mcp/releases)

---

## Fasleutel - Muzieknoten Quiz

Een interactieve webapplicatie die muzikanten helpt bij het oefenen van de sol- en fa-sleutel. Gebouwd met vanilla JavaScript, met meerdere spelmodi en meertalige ondersteuning.

**Kenmerken:**
- Oefenmodus, Tijdrace en Sprint modi
- Ondersteuning voor 6 talen
- Real-time feedback en voortgangsregistratie
- Responsive design voor alle apparaten

**Tech Stack:** JavaScript, HTML5, SVG, Bulma CSS

[Probeer het live](https://gjoris.github.io/fasleutel/) | [Bekijk op GitHub](https://github.com/gjoris/fasleutel)

---

## Persoonlijke Tech Blog

Deze blog is zelf ook een project! Een moderne, meertalige tech blog gebouwd met Hugo en custom styling.

**Kenmerken:**
- Meertalige ondersteuning (EN/NL)
- Modern gradient design
- Dark mode ondersteuning
- Giscus comments integratie
- GoatCounter analytics

**Tech Stack:** Hugo, DoIt theme, Custom CSS/JS

[Bekijk op GitHub](https://github.com/gjoris/gjoris.github.io)

---

*Meer projecten volgen binnenkort...*
