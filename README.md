# Batch images saver

Chrome extension to download all images opened as tabs in one archive in one click

# Install

Chrome:
- download batch-image-saver.zip from [latest release](https://github.com/lerarosalene/batched-img-save/releases/latest/)
- unpack archive, install as unpacked extension from `chrome://extensions` page

Firefox: 
- open [latest release](https://github.com/lerarosalene/batched-img-save/releases/tag/v1.1.3)
- click batch-image-saver-signed-{version}.xpi to automatically install it

# Build it yourself

- clone this repo
- `npm install`
- `npm run codegen`
- `npm run build`
- `npm run package`

Environment variable `BROWSER` controls which version of extension is built. Possible values:
- `chrome` (default)
- `firefox`



Release artifacts will be in `release-artifacts` folder
