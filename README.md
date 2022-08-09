# Batched images saver

Chrome extension to download all images opened as tabs in one archive in one click

# Install

Download release from releases section (.zip for Chrome / .xpi for Firefox) and
- Chrome: unpack archive, install as unpacked extension from `chrome://extensions` page
- Firefox: install .xpi file from `about:debugging`

# Build it yourself

- clone this repo
- `npm install`
- `npm run codegen`
- `npm run build`
- `npm run package`

Release artifacts will be in `release-artifacts` folder

