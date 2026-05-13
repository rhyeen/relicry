---
name: repo-managed-skills
description: Use when Codex creates, updates, installs, validates, or discusses project-specific Codex skills in this repository. Trigger when a user asks to make a reusable skill, version-control a skill, symlink a skill into the local Codex skills directory, follow README skill conventions, or ensure future Codex skill changes are stored under the repo rather than only in ~/.codex/skills.
---

# Repo Managed Skills

## Rule

For Relicry project skills, treat `.codex/skills/<skill-name>` in the repo as the source of truth. Treat `${CODEX_HOME:-$HOME/.codex}/skills/<skill-name>` as the local discovery path, usually a symlink to the repo-owned skill.

Do not leave a Relicry skill only in `~/.codex/skills`.

## Workflow

1. Read the repository README before changing skills.
   - Follow the current "Codex Skills" instructions.
   - If the README convention changes, follow the README over this skill.

2. Create or update the skill in the repo.
   - Use the built-in `skill-creator` workflow for new skills.
   - Put the skill under `.codex/skills/<skill-name>`.
   - Include `SKILL.md`.
   - Include `agents/openai.yaml` when UI metadata is useful.
   - Add `references/`, `scripts/`, or `assets/` only when the skill needs them.

3. Link the repo skill into local Codex discovery.
   - Resolve the local skills directory as `${CODEX_HOME:-$HOME/.codex}/skills`.
   - Ensure the directory exists.
   - If the local skill path already exists, inspect it first.
   - If it is a stale local copy created during the current work, preserve it outside the skills directory or replace it with a symlink after confirming the repo copy is complete.
   - The intended final shape is:

```text
~/.codex/skills/<skill-name> -> /path/to/relicry/.codex/skills/<skill-name>
```

4. Validate.
   - Run the `skill-creator` `quick_validate.py` script on the repo-owned skill.
   - Confirm the local path is a symlink pointing to the repo path.
   - Check `git status --short` includes the repo skill files.

5. Mention operational notes.
   - If Codex may need a restart or refresh to discover the new skill, tell the user.
   - If a stale local copy was preserved elsewhere, tell the user where it went.

## Commands

Use these from the repo root, substituting the skill name:

```bash
CODEX_SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"
mkdir -p "$CODEX_SKILLS_DIR"
ln -s "$(pwd)/.codex/skills/<skill-name>" "$CODEX_SKILLS_DIR/<skill-name>"
```

If replacing a current-turn local copy, move it aside first instead of deleting it:

```bash
mv "$CODEX_SKILLS_DIR/<skill-name>" "/private/tmp/<skill-name>-local-copy"
ln -s "$(pwd)/.codex/skills/<skill-name>" "$CODEX_SKILLS_DIR/<skill-name>"
```
