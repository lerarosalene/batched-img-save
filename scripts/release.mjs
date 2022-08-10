import { copyFile, mkdir, readdir, readFile, unlink } from "fs/promises";
import { exec, execFile } from "child_process";
import { promisify } from "util";
import { join } from "path";

async function gh(...args) {
  return (await promisify(execFile)('gh', args)).stdout;
}

async function listReleases() {
  const data = await gh('release', 'list');
  const lines = data.split('\n').map(line => line.trim()).filter(line => line.length);
  return lines.map(line => line.split('\t')[0]);
}

async function build(browser) {
  await promisify(exec)('npm run build', {
    env: { ...process.env, BROWSER: browser }
  });

  await promisify(exec)('npm run package', {
    env: { ...process.env, BROWSER: browser }
  });
}

async function signAndPublish() {
  try {
    const webExtArtsOld = await readdir('web-ext-artifacts');
    for (let file of webExtArtsOld) {
      const path = join('web-ext-artifacts', file);
      await unlink(path);
    }
  } catch (error) {}

  await promisify(exec)(
    `npx web-ext sign -s dist --api-key "${process.env.MOZ_API_KEY}" --api-secret "${process.env.MOZ_API_SECRET}"`
  );

  const results = await readdir('web-ext-artifacts');
  const xpis = results.filter(res => res.endsWith('.xpi'));
  const xpi = xpis[0];

  if (!xpi) {
    throw new Error('No resulting .xpi found');
  }

  const version = JSON.parse(await readFile('package.json', 'utf-8')).version;
  const name = `batch-image-saver-signed-${version}.xpi`;

  await mkdir('release-artifacts', { recursive: true });
  await copyFile(
    join('web-ext-artifacts', xpi),
    join('release-artifacts', name)
  );
}

async function main() {
  const releaseTag =  await readFile('RELEASE', 'utf-8');
  const existing = await listReleases();

  if (existing.includes(releaseTag) && process.env.NODE_ENV === "production") {
    return;
  }

  try {
    const oldArtifacts = await readdir('release-artifacts');
    for (let file of oldArtifacts) {
      await unlink(join('release-artifacts', file));
    }
  } catch (error) {}

  const releaseNotes = `release: ${releaseTag}`;

  await promisify(exec)('npm ci');
  await promisify(exec)('npm run codegen');

  await build("chrome");
  await build("firefox");

  if (process.env.NODE_ENV === "production") {
    await signAndPublish();
  }

  const artifacts = (await readdir('release-artifacts'))
    .map(item => join('release-artifacts', item));

  if (process.env.NODE_ENV === "production") {
    await gh('release', 'create', releaseTag, ...artifacts, '--notes', releaseNotes, '-t', releaseTag);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
