var xt = require('xtend')
var ok = require('object-keys')
var yaml = require('js-yaml')

module.exports = {
  encode: encode,
  decode: decode,
  keysToLowerCase: keysToLowerCase
}

/**
 * todo:
 * - testing
 * - normalizing
 */
function decode (str) {
  return str
    .split('\n----')
    .filter(str => str)
    .reduce(function (result, field) {
      var data = field
        .replace(/^\s+|\s+$/g, '')
        .split(/:([^]+)/)
        .filter(str => str.trim() !== '')

      if (data.length >= 2) {
        if (data[1].trim().charAt(0) !== '-') {
          result[data[0].toLowerCase()] = data[1].trim()
        } else {
          result = xt(result, keysToLowerCase(yaml.safeLoad(field)))
        }
      }

      return result
    }, { })
}

function encode (obj) {
  return ok(obj)
    .reduce(function (result, key) {
      var value = obj[key]
      if (typeof value === 'object') {
        result.push(yaml.safeDump({ [key]: value }))
      } else {
        result.push(key + ': ' + value)
      }

      return result
    }, [ ])
    .join('\n\n----\n\n')
}

function keysToLowerCase(obj) {
  if (
    !typeof(obj) === 'object' ||
    typeof(obj) === 'string' ||
    typeof(obj) === 'number' ||
    typeof(obj) === 'boolean'
  ) {
    return obj
  }

  var keys = Object.keys(obj)
  var n = keys.length
  var lowKey

  while (n--) {
    var key = keys[n];
    if (key === (lowKey = key.toLowerCase())) continue
    obj[lowKey] = keysToLowerCase(obj[key])
    delete obj[key]
  }

  return (obj)
}