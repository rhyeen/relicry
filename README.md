This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Codex Skills

This repo includes project-specific Codex skills under `.codex/skills`. These are the version-controlled source of truth for reusable Codex guidance.

### Relicry Gallery UI

The `relicry-gallery-ui` skill captures the current conventions for `/art`, `/art/[id]`, `/ast/[id]`, `/cards`, gallery grids, filter dialogs, URL-backed filters, design-system actions, and browser validation.

### DS Component First

The `ds-component-first` skill captures the convention that app UI should use existing DS components first, extend or create DS components for reusable patterns, and reserve custom module CSS for genuinely exceptional one-off UI.

### Repo Managed Skills

The `repo-managed-skills` skill captures this repo's skill workflow: create and update project-specific skills under `.codex/skills`, validate them there, and symlink them into the local Codex skills directory for discovery.

### Browser Smoke Check

The `browser-smoke-check` skill captures the localhost smoke-test workflow for checking whether the Codex in-app browser can reach local pages and capture screenshots.

To make Codex discover the repo-owned skill locally, symlink it into your Codex skills directory from the repo root:

```bash
CODEX_SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"
mkdir -p "$CODEX_SKILLS_DIR"
ln -s "$(pwd)/.codex/skills/<skill-name>" "$CODEX_SKILLS_DIR/<skill-name>"
```

If `"$CODEX_SKILLS_DIR/<skill-name>"` already exists, inspect it first:

```bash
ls -la "$CODEX_SKILLS_DIR/<skill-name>"
```

If it is an older local copy, preserve or remove it before creating the symlink. The intended setup is:

```bash
~/.codex/skills/<skill-name> -> /path/to/relicry/.codex/skills/<skill-name>
```

After linking, restart or refresh Codex if the skill does not appear immediately. You can ask Codex to use it explicitly, for example: "Use the relicry-gallery-ui skill while updating the art gallery." Codex should also pick it up automatically for related Relicry gallery, card, art detail, and artist page work.

### Adding Future Skills

When adding more project-specific Codex skills, use the built-in `skill-creator` workflow, but keep the repo as the source of truth:

1. Create the skill under `.codex/skills/<skill-name>`.
2. Include the required `SKILL.md` file and any optional skill resources, such as `agents/openai.yaml`, `references/`, `scripts/`, or `assets/`.
3. Symlink the repo skill into your local Codex skills directory:

```bash
CODEX_SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"
mkdir -p "$CODEX_SKILLS_DIR"
ln -s "$(pwd)/.codex/skills/<skill-name>" "$CODEX_SKILLS_DIR/<skill-name>"
```

Do not treat `~/.codex/skills` as the canonical home for Relicry skills. It should only contain symlinks or local install copies that point back to version-controlled repo skills.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!


## Firebase Emulator Usage

This project is configured to use the Firebase Emulators for Auth, Firestore, Functions, and Storage.

### Start the Emulators

```bash
npm run emulators:start
```

This will start the following emulators:
- Auth (port 9097)
- Firestore (port 8087)
- Storage (port 9197)

You can access the Emulator UI at [http://localhost:4000](http://localhost:4000) if enabled.

### Stop the Emulators

```bash
npm run emulators:stop
```

If the stop script does not work, you may need to stop the emulators manually (e.g., with Ctrl+C in the terminal).

---

## Deploying Firestore Indexes

Firestore indexes are defined in `firestore.indexes.json`.

Firebase App Hosting rollouts from `main` do not apply those indexes automatically, so deploy them locally when index changes are merged:

```bash
npm run firestore:indexes:deploy
```

This runs:

```bash
firebase deploy --only firestore:indexes
```

If you have not authenticated the Firebase CLI on your machine yet, run `firebase login` first.

---

# Local Scripts

## Validating cards

For instructions, see: https://docs.google.com/document/d/1v8Mc2iAXS1c6yIv_6QRK7YfnG8QFJWRvUOphmApTGOs/edit?tab=t.3mvxhhy6tavh

## Updating Google Sheet planning database

Only super admins can do this.

For instructions, see: https://docs.google.com/document/d/1v8Mc2iAXS1c6yIv_6QRK7YfnG8QFJWRvUOphmApTGOs/edit?tab=t.mjueotyaftyj

## Generating Print-Version Images

Only publication admins can do this.

For instructions, see: https://docs.google.com/document/d/1v8Mc2iAXS1c6yIv_6QRK7YfnG8QFJWRvUOphmApTGOs/edit?tab=t.8d50ck9ouxp
