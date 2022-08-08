import { readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import { join } from 'path';
import Mustache from 'mustache';
import YAML from 'yaml';
import { build } from 'esbuild';

async function manifest() {
  const yamlTemplate = await readFile(join('src', 'manifest.yaml'), 'utf-8');
  const packageData = JSON.parse(await readFile('package.json', 'utf-8'));

  const yamlFile = Mustache.render(yamlTemplate, packageData);
  const manifestData = YAML.parse(yamlFile);
  const manifest = JSON.stringify(manifestData, null, 2);

  await writeFile(join('dist', 'manifest.json'), manifest);
}

async function background() {
  await build({
    entryPoints: [join('src', 'background.js')],
    bundle: true,
    minify: true,
    outfile: join('dist', 'background.js'),
  });
}

async function content() {
  await build({
    entryPoints: [join('src', 'content.js')],
    bundle: true,
    minify: true,
    outfile: join('dist', 'content.js'),
  });
}

async function assets() {
  await copyFile(join('assets', 'icon-48x48.png'), join('dist', 'icon-48x48.png'));
  await copyFile(join('assets', 'icon-96x96.png'), join('dist', 'icon-96x96.png'));
}

async function main() {
  await mkdir('dist', { recursive: true });
  await Promise.all([
    manifest(),
    background(),
    content(),
    assets(),
  ]);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
