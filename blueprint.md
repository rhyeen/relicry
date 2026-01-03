# Relicry - A TCG Adventure Game

## Overview

Relicry is a web-based trading-card game (TCG) application with a dark and modern mobile first user interface. The application is designed to have pages accessed by scanning QR codes on real physical TCG cards to reveal more information about the card.

High performant caching and reduced page size is high priority as most pages are static, will be accessed by many people in the same physical location on their mobile devices with limited internet/cell service.

## Design and Features

### Visual Design

*   **Theme:** A dark theme with white/gold highlights that creates an immersive and engaging experience.
*   **Color Palette:**
    *   Background: A very dark desaturated blue (`#0D1117`).
    *   Primary Accent: A vibrant gold for buttons and highlights (`#D3AF37`).
    *   Card Background: A slightly lighter dark color (`#161B22`).
    *   Text: white (`#FFFFFF`).
    *   Card Border: A subtle border in a slightly lighter shade than the card background.
*   **Typography:**
    *   **Primary Font:** "Barlow Condensed" for body text, ensuring readability. This is found at https://fonts.google.com/specimen/Barlow+Condensed
    *   **Title Font:** "Bree Serif" for most headings. This is found at https://fonts.google.com/specimen/Bree+Serif. For h1 headings or exceptional cases, use "Pirata One". This is found at https://fonts.google.com/specimen/Pirata+One.
*   **Animations & Effects:**
    *   **Card Hover:** Cards will have a subtle "lift" and glow effect on hover to provide tactile feedback.
    *   **Staggered Load:** The card will load once the image is loaded down. Each element of the page loading into place with a fade in and slight bounce.
    *   **Button Glow:** Buttons will have a soft glow to draw attention to the primary action.

### Features

*   **Local Develoment Data:** By hitting the root page while local (https://localhost:5007), this will automatically populate the Firestore database with example cards and other data.
*   **Card Display:** By navigating to the QR code of a card (e.g. https://localhost:5007/1/abcdef), it will display information about this card.
*   **Responsive Design:** The UI is fully responsive and works seamlessly on both desktop and mobile devices, but focuses mostly on mobile or tablet display.

## Current Plan

The current plan is to get the scaffolding in place so that the developer can focus on the finer details.

- [x] Get Firebase authentication working so that if a user navigates to https://localhost:5007/login, there is a Google Auth Login page for them.
- [x] Set up a base layout for all pages that contains a navigation bar that detects if the user is logged in and displays their profile in the right corner or displays a button to login. There is also a button icon for navigating to the home screen and one for seeing ongoing events (navigating to https://localhost:5007/e). There should also be a basic footer with the email relicry@googlegroups.com for contact, a copyright for Relicry, and a link to leave feedback (https://localhost:5007/feedback), and a link to the Discord server (https://discord.gg/YF5RyAaj).
- [x] Differentiates the statically loaded content from the server and the authenticated client instances (especially in the layout) so that as much as possible can render on the server. Lazy loading the other stuff on the page as needed.
- [x] Setting up error boundaries, 404s, and other useful accessibilty features to ensure QoL upfront.
- [x] Create basic endpoints as specified in /src/app/README.md.
- [x] Create test data populators for all routes shown in /src/app/README.md, utilizing consts to share the same test ID values to ensure each entity can properly reference other entities (e.g. an Art entity, references an Artist via its artistId property which references the Art's id property—the test data should have the same value for both of these test entities for artistId=>id). Populator should update `populateLocal` in /src/app/server/db/local.db.ts, creating additional helper functions/files to keep the population method clean. `populateLocalCards` is used as an example of how to do so logically, but can definitely be cleaned up or moved.
- [x] Get auth vs no auth parts of pages working together so more info is displayed based on auth.
- [x] Set up localStorage-level caching for pages.
- [ ] Getting Firebase storage images to work
- [ ] Attempt basic auth stuff: (1) Adding card to player collection (2) Modifying aspsects of user profile (3) Creating decks
- [ ] Denormalizing data so when we get things like a Card, we also get Art/Artist.
- [ ] See if we can recreate the Card printable card itself with CSS
- [ ] Get Apex design in place
- [ ] Incorporate caching model in all components, not just Card
<!-- - [ ] Get all pages unit/component tested with vitest and local `__test__` folders. -->

### Localization

Almost all the data on the website is loaded via the DB, so all the localization
has to exist in the DB as well. Rather than using a LocaleMap (e.g.
`{ en: '', es: ''}`), we can assume that English must always be pulled down as
a fallback langauge, so that might as well be the default data in the DB. Then
if the language is not English (e.g. if it is Spanish), we pull locale data from
`${collectionName}_es/${documentId}`, which contains only the locale changes and
no other properties. Then we perform a deep merge of the normal document and
the other language's DB document.
