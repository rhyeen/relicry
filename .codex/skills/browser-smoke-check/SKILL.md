---
name: browser-smoke-check
description: Use when Codex is unsure whether the Browser plugin or in-app browser can reach local development URLs or capture screenshots, especially after browser connection uncertainty, blocked data/file URL attempts, localhost failures, or before relying on browser visual validation in Relicry. Serve the bundled smoke page over 127.0.0.1, open it with the Browser plugin, verify expected DOM text, and capture a screenshot.
---

# Browser Smoke Check

## Overview

Check the Codex in-app browser with a tiny local HTML page served over `127.0.0.1`. This validates the same path used for local dev-server testing: local HTTP navigation, DOM inspection, and screenshot capture.

## Workflow

1. Use the Browser plugin workflow first when available.
   - Read and follow the Browser skill before falling back to any other browser surface.
   - Keep the browser in the background unless the user explicitly asks to see it.

2. Serve the bundled smoke page.
   - Use this skill asset as the source of truth: `assets/relicry-browser-smoke.html`.
   - Prefer serving the asset directory directly with a temporary local server, for example:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

   - Run the command from `.codex/skills/browser-smoke-check/assets`.
   - If the port is in use, pick another high local port.
   - If sandboxing blocks the server bind with `Operation not permitted`, request escalation for the temporary localhost server.
   - Keep the server session running until the browser check finishes, then stop it.

3. Open the smoke page in the in-app browser.
   - Navigate to `http://127.0.0.1:<port>/relicry-browser-smoke.html`.
   - Do not use `data:` or `file:` URLs for this check; they may be blocked by browser policy and do not validate localhost.

4. Verify the result.
   - Confirm the page title is `Codex Browser Smoke Test`.
   - Confirm the DOM includes both `Local browser is reachable` and `Smoke test passed`.
   - Capture a viewport screenshot.
   - Save the screenshot to `/private/tmp/relicry-browser-smoke.png` unless the user asked for another path.

5. Report clearly.
   - State whether local browser reachability and screenshot capture passed.
   - Include the screenshot inline when the user asked for a screenshot or when visual proof is useful.
   - Mention any fallback, blocked URL policy, escalation, or cleanup issue that affected the check.

## Pass Criteria

Treat the smoke check as passing only when all of these are true:

- The browser successfully loads the page from `127.0.0.1`.
- The expected title and DOM text are present.
- Screenshot bytes are captured and written to disk.
- The temporary server is stopped after verification.
