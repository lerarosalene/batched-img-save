import slugify from "slugify";

export function findSafeName(name, knownNames) {
  let rexp = /^(.*)(\.[^\.]*)$/;
  let match = name.match(rexp);
  let base, ext;

  if (match) {
    base = slugify(match[1]);
    ext = match[2];
  } else {
    base = slugify(name);
    ext = "";
  }

  if (!knownNames.has(createName(base, ext))) {
    knownNames.add(createName(base, ext));
    return createName(base, ext);
  }

  let suffixNum = 1;
  while (knownNames.has(createName(base, ext, suffixNum))) {
    suffixNum += 1;
  }

  knownNames.add(createName(base, ext, suffixNum));
  return createName(base, ext, suffixNum);

  function createName(base, ext, suffixNum) {
    if (suffixNum === undefined) {
      return `${base}${ext}`;
    }
    return `${base}-${suffixNum}${ext}`;
  }
}
