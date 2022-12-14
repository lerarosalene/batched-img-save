[![build badge](https://github.com/lerarosalene/batched-img-save/actions/workflows/build.yaml/badge.svg)](https://github.com/lerarosalene/batched-img-save/actions/workflows/build.yaml)

# Batch images saver

Chrome extension to download all images opened as tabs in one archive in one click

# Install

Chrome:
- download `batch-image-saver.zip` from [latest release](https://github.com/lerarosalene/batched-img-save/releases/latest/)
- unpack archive, install as unpacked extension from `chrome://extensions` page

Firefox: 
- open [latest release](https://github.com/lerarosalene/batched-img-save/releases/latest/)
- click `batch-image-saver-signed-{version}.xpi` to automatically install it

# Build it yourself

- clone this repo
- `npm install`
- `npm run codegen`
- `npm run build`
- `npm run package`

Environment variable `BROWSER` controls which version of extension is built. It affects `build` and `package` scripts. Possible values:
- `chrome` (default)
- `firefox`

To sign firefox package with your own keys refer to `scripts/ci/ci-sign.mjs` file to see how it is done.

Release artifacts will be in `release-artifacts` folder
