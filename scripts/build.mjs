import { readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import { basename, dirname, join, resolve } from 'path';
import Mustache from 'mustache';
import YAML from 'yaml';
import { build } from 'esbuild';
import sass from 'sass';
import { createCanvas, loadImage } from 'canvas';

const BROWSER_ENV = process.env.BROWSER ?? "chrome";

const commonEsbuildArgs = {
  define: {
    BROWSER_ENV: JSON.stringify(BROWSER_ENV),
    NODE_ENV: process.env.NODE_ENV ?? "production"
  },
  minify: true,
  bundle: true,
};

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
    outfile: join('dist', 'background.js'),
    ...commonEsbuildArgs,
  });
}

async function content() {
  await build({
    entryPoints: [join('src', 'content.js')],
    outfile: join('dist', 'content.js'),
    ...commonEsbuildArgs,
  });
}

async function buildPng(name, svgPath, size) {
  const canvas = createCanvas();
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  const img = await loadImage(svgPath);
  ctx.drawImage(img, 0, 0, size, size);

  const result = canvas.toBuffer();
  const resultDir = dirname(resolve(name));
  const lastDot = name.lastIndexOf(".");
  const resultExt = lastDot > -1 ? name.substr(lastDot) : null;
  const resultNamePrefix = resultExt ? basename(name, resultExt) : basename(name);
  const resultName = resultNamePrefix + `-${size}x${size}`;
  const resultPath = join(resultDir, resultName + (resultExt ?? ""));

  await writeFile(resultPath, result);
}

async function assets() {
  await Promise.all([
    buildPng(join('dist', 'icon.png'), join('assets', 'icon.svg'), 48),
    buildPng(join('dist', 'icon.png'), join('assets', 'icon.svg'), 96),
    copyFile(join('assets', 'delete.svg'), join('dist', 'delete.svg')),
    copyFile(join('assets', 'download.svg'), join('dist', 'download.svg')),
  ])
}

async function ui() {
  await copyFile(join('src', 'ui.html'), join('dist', 'ui.html'));
  const result = sass.compile(join('src', 'ui.scss'));
  await writeFile(join('dist', 'ui.css'), result.css);

  await build({
    entryPoints: [join('src', 'ui.js')],
    outfile: join('dist', 'ui.js'),
    loader: {
      ".js": "jsx"
    },
    ...commonEsbuildArgs,
  });
}

async function main() {
  await mkdir('dist', { recursive: true });
  await Promise.all([
    manifest(),
    background(),
    content(),
    assets(),
    ui(),
  ]);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
