---
title: "Een MCP Server voor Marktplaats en 2dehands"
date: 2026-05-28T11:30:00+02:00
draft: false
description: "Een MCP server die elke AI-assistent laat zoeken en monitoren op marktplaats.nl en 2dehands.be — zowel het publieke deel als je eigen account."
images: ["/images/post-hero.png"]
categories:
  - Tooling
  - AI
tags:
  - MCP
  - Python
  - Reverse engineering
---

Ik wilde mijn AI-assistent vragen kunnen stellen zoals *"hou Trek Emonda fietsen onder €2000 binnen 30 km van Antwerpen in de gaten"* en hem ook echt laten kijken. Het Model Context Protocol (MCP) maakt die brug mogelijk, dus ik bouwde [marktplaats-2dehands-mcp](https://github.com/gjoris/marktplaats-2dehands-mcp): één MCP server die zowel [marktplaats.nl](https://www.marktplaats.nl) als [2dehands.be](https://www.2dehands.be) afdekt.

<!--more-->

## Wat is MCP, kort

MCP is een open protocol dat AI-assistenten gebruiken om met externe tools te praten. Het is bij Anthropic gestart maar wordt intussen ondersteund door een groeiende set clients — Claude Code, Cursor, Cline, Continue, Zed, de desktop-app van ChatGPT, en alles wat tool-use kan koppelen. Je schrijft een server die een set getypeerde functies aanbiedt; de assistent kiest zelf wanneer hij ze aanroept. Mijn server biedt 18 van zulke functies aan — zoeken, advertentiedetails ophalen, saved searches monitoren, je inbox lezen, enzovoort — en de assistent leidt uit de natuurlijke taalvraag af welke hij nodig heeft.

## De website blokkeert scrapers, maar de API niet

Beide sites zitten achter Cloudflare en hun HTML-pagina's zijn niet bot-vriendelijk. Belangrijke ontdekking: hun interne JSON API op `/lrp/api/search` staat wagenwijd open. Geen auth, geen rate limiting, identieke response op beide sites. Beide zijn van Adevinta en delen dezelfde backend — één search-call werkt voor allebei door alleen de hostname te wisselen.

Dat betekende dat ik het hele "headless browser met stealth plugins"-konijnenhol kon overslaan en gewoon een Python `requests` wrapper kon schrijven.

```python
def search(site: str, params: dict) -> dict:
    response = requests.get(search_url(site), params=params, timeout=15)
    response.raise_for_status()
    return response.json()
```

Twee sites, één parameter, geen Playwright in zicht.

## Detailpagina's waren de volgende puzzel

Zoeken was één ding — een specifieke advertentie openen was lastiger. Er is geen publiek JSON-endpoint per listing, en de gerenderde Nederlandse UI-tekst scrapen (`Beschrijving`, `Kenmerken`, `Sinds 10 jan '26`) is precies het soort code dat breekt elke keer dat het front-end team een label aanpast.

Na wat rondneuzen in DevTools zag ik dat elke advertentiepagina een `<script>window.__CONFIG__ = {…}</script>` blok heeft — de hydration state waarvan de SPA boot. Daarin staat de hele advertentie als gestructureerde JSON: titel, prijzen, foto's, aantal views, online-sinds-tijdstempel. Die parsen, en BeautifulSoup mag thuisblijven.

Resultaat: geen taalafhankelijke parsing, veel robuuster bij layout-wijzigingen, en de type-informatie gaat van "string uit HTML gescraped" naar "echte integers en ISO 8601 timestamps".

## De toolset

De server biedt negen **publieke** tools aan (geen login nodig):

- Zoeken (`search_listings`) met de volledige filter-set: prijs, afstand, conditie, categorie, verkopertype
- Advertentiedetails (`get_listing_details`)
- Verkoperprofielen (`get_seller_info`)
- Categorieën en per-categorie attribuut-filters
- Lokale saved searches met delta-detectie — `check_saved_search` retourneert alleen advertenties die ik nog niet had gezien, zodat de tweede call me niet bedelft onder oude resultaten

En negen **authenticated** tools, achter een eenmalige login:

- Inbox unread counts en gesprekkenlijst
- Mijn eigen advertenties
- Mijn favorieten en bid favorites
- Saved searches die op het marktplaats-account zelf staan

Authenticatie is opt-in via een aparte Python extra (`pip install …[auth]`) zodat gebruikers die alleen publiek zoeken willen geen Playwright + Chromium meeslepen.

## Een kleine bug die de test-aanpak rechtvaardigde

De end-to-end test suite ving iets op dat ik anders gemist had: mijn eerste `get_seller_info` mapping was gebaseerd op veldnamen uit een oudere library en retourneerde stilletjes `id=None`, `name=None`, `is_verified=False` voor elke verkoper. Omdat unit tests de respons mockten met de *verwachte* shape liepen die groen; maar de live API geeft een totaal andere shape terug — alleen verification-flags, payment method, en geaggregeerde reviews. De naam en id van de verkoper komen uit het zoekresultaat, niet uit het profiel-endpoint.

Een dagelijkse GitHub Actions job draait nu de live tests tegen beide sites en opent een issue als er iets breekt aan upstream. Heeft zichzelf al één keer terugverdiend.

## Waar het bewust stopt

Een logische volgende stap is *biedingen plaatsen* en *berichten sturen naar verkopers*. Daar ga ik (voorlopig) niet heen. De Adevinta-gebruiksvoorwaarden lezen: bulk-extractie voor persoonlijk gebruik is OK, maar **advertenties of berichten plaatsen via geautomatiseerde systemen** is expliciet verboden in Artikel 7. Biedingen zijn de hoogste write-actie qua impact omdat elk bod een offerte is die een verkoper kan accepteren, en een fout-geconfigureerde bot kan snel ongewilde verplichtingen opstapelen.

Het authenticated *read*-pad is comfortabel: mijn eigen inbox, advertenties en favorieten monitoren is niet te onderscheiden van gewoon de mobile app gebruiken, die ook tegen dezelfde API praat. Schrijven is een andere discussie die ik liever expliciet voer wanneer er een concrete use case is.

## Een paar dingen onderweg geleerd

- **Eerst onderzoeken, dan ontwerpen.** Ik begon PR4 met de verwachting dat er een JSON listing-endpoint bestond en vond in plaats daarvan een hydration-blob in de HTML. Zonder die 30 minuten upfront rondneuzen had de server een veel fragielere parser gehad.
- **Optionele dependencies zijn de moeite waard.** Playwright in een `[auth]` extra splitsen betekent dat de basis-install klein blijft en een `uvx` aanroep snel is. Authenticated gebruikers kiezen er expliciet voor.
- **Functional coverage > line coverage voor end-to-end tests.** Een meta-test verifieert dat elke MCP tool minstens één keer tegen elke site is aangeroepen. Een nieuwe tool toevoegen zonder e2e-test laat CI nu expliciet falen.
- **De TOS-discussie is waardevol.** Niet als juridische oefening maar als ontwerp-constraint. Het veranderde welke features ik bouwde en welke ik niet.

## Probeer het

De server draait via stdio. In om het even welke MCP-aware client — Claude Code, Cursor, Cline, Continue, Zed — wijs je hem aan met `uvx` op de Git-repo:

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

Waar je dat snippet exact plakt verschilt per client (zie de docs van jouw client voor MCP-setup), maar het snippet zelf is hetzelfde overal. Broncode en volledige docs: [github.com/gjoris/marktplaats-2dehands-mcp](https://github.com/gjoris/marktplaats-2dehands-mcp).
