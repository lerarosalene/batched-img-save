import { readdir, copyFile, mkdir, readFile } from "node:fs/promises"
import { promisify } from "node:util";
import { exec } from "node:child_process";

async function sign() {
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
