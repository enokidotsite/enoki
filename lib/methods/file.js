module.exports = {
  encodeFilename: encodeFilename,
  decodeFilename: decodeFilename,
  sanitizeName: sanitizeName
}

function encodeFilename (str) {
  return str.replace(/\.([^\.]*)$/, '-$1')
}

function decodeFilename (str) {
  return str.replace(/-([^\-]*)$/, '.$1')
}

function sanitizeName (str) {
  return str
    .replace(/\s+/g, '-')
    .replace(/[.,\/#!@?$%\^&\*;:{}=\_`~()]/g, '')
    .toLowerCase()
}
