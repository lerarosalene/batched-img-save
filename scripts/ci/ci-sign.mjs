import { readdir, unlink, copyFile, mkdir } from "node:fs/promises"

async function sign() {
  try {
    const webExtArtsOld = await readdir('web-ext-artifacts');
    for (let file of webExtArtsOld) {
      const path = join('web-ext-artifacts', file);
      await unlink(path);
    }
  } catch (error) {}

  await promisify(exec)(
    `npx web-ext sign -s dist/firefox --api-key "${process.env.MOZ_API_KEY}" --api-secret "${process.env.MOZ_API_SECRET}"`
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
  await sign();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
