import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const explicitDir = args.find((arg) => !arg.startsWith('--'));

const defaultDirs = [
  path.resolve(process.cwd(), 'local/cards/screenshots'),
  path.resolve(process.cwd(), '.local/cards/screenshots'),
];

async function resolveScreenshotsDir() {
  if (explicitDir) {
    return path.resolve(process.cwd(), explicitDir);
  }

  for (const dir of defaultDirs) {
    try {
      const stat = await fs.stat(dir);
      if (stat.isDirectory()) {
        return dir;
      }
    } catch {
      // Try next candidate.
    }
  }

  throw new Error(
    `Could not find a screenshots directory. Checked: ${defaultDirs.join(', ')}`,
  );
}

function getTargetFileName(fileName) {
  if (!fileName.startsWith('localhost')) {
    return null;
  }

  const awakened = /\s\(1\)(?=\.png$)/i.test(fileName);
  const cardMatch = fileName.match(/^localhost_\d+_(c_[a-z0-9]+_\d+)_/i);
  if (cardMatch) {
    return `${cardMatch[1]}${awakened ? '_awakened' : ''}.png`;
  }

  const questTokenMatch = fileName.match(/^localhost_\d+_(t_\d+)(?:_|(?=\.png$))/i);
  if (questTokenMatch) {
    return `${questTokenMatch[1]}.png`;
  }

  const uniqueRewardMatch = fileName.match(/^localhost_\d+_(ur_[a-z0-9]+)(?:_|(?=\.png$))/i);
  if (!uniqueRewardMatch) {
    return null;
  }

  const sideSuffix = /(?:^|[&_])side=back(?:[&()]|$)/i.test(fileName)
    ? '_back'
    : '';

  return `${uniqueRewardMatch[1]}${sideSuffix}.png`;
}

async function main() {
  const screenshotsDir = await resolveScreenshotsDir();
  const entries = await fs.readdir(screenshotsDir, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);

  const plannedRenames = [];

  for (const fileName of files) {
    const targetFileName = getTargetFileName(fileName);
    if (!targetFileName || targetFileName === fileName) {
      continue;
    }

    plannedRenames.push({
      from: fileName,
      to: targetFileName,
    });
  }

  if (plannedRenames.length === 0) {
    console.log(`No matching localhost screenshot files found in ${screenshotsDir}.`);
    return;
  }

  const targetCounts = new Map();
  for (const rename of plannedRenames) {
    targetCounts.set(rename.to, (targetCounts.get(rename.to) ?? 0) + 1);
  }

  for (const rename of plannedRenames) {
    if ((targetCounts.get(rename.to) ?? 0) > 1) {
      throw new Error(`Multiple files would be renamed to ${rename.to}.`);
    }
  }

  for (const rename of plannedRenames) {
    const targetPath = path.join(screenshotsDir, rename.to);
    let willOverwrite = false;

    try {
      await fs.access(targetPath);
      willOverwrite = true;
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        throw error;
      }
    }

    console.log(
      `${dryRun ? 'Would rename' : 'Renaming'} ${rename.from} -> ${rename.to}${willOverwrite ? ' (overwriting existing file)' : ''}`,
    );

    if (!dryRun) {
      if (willOverwrite) {
        await fs.unlink(targetPath);
      }
      await fs.rename(
        path.join(screenshotsDir, rename.from),
        targetPath,
      );
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
