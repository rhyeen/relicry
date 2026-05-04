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

## Downloading Card Metadata

The repo now includes a metadata-only cards API at `/api/cards` plus a helper script that walks every paginated result used by the cards listing and writes the combined JSON locally.

Start the app first so the route is available:

```bash
npm run local
```

Then, in another terminal, run:

```bash
npm run cards:metadata
```

By default this writes to `.local/cards/metadata.json`, which is gitignored.

Optional environment variables:

- `CARDS_BASE_URL` overrides the base URL to fetch from. Default: `http://127.0.0.1:3000`
- `CARDS_METADATA_OUTPUT` overrides the output file path

The downloaded payload contains only card metadata and excludes illustration, art, and artist references.

---

## Generating Print-Version Images

Only publication admins can do this.

For instructions, see: https://docs.google.com/document/d/1v8Mc2iAXS1c6yIv_6QRK7YfnG8QFJWRvUOphmApTGOs/edit?tab=t.8d50ck9ouxp
