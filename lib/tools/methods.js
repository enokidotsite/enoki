var objectValues = require('object-values')
var objectKeys = require('object-keys')
var assert = require('assert')
var xtend = require('xtend')
var path = require('path')

module.exports = {
  children,
  file,
  files,
  find,
  first,
  hasView,
  images,
  isActive,
  // isFirst,
  // isLast,
  last,
  page,
  pages,
  parent,
  sortBy,
  visible
}

function children (state, value) {
  return pages(state, value)
}

function file (state, value, key) {
  try {
    return value.files[key] || { }
  } catch (err) {
    return { }
  }
}

function files (state, value) {
  try {
    return value.files || { }
  } catch (err) {
    return { }
  }
}

function find (state, value, url) {
  try {
    // grab from root
    if (url.indexOf('/') === 0) return state.content[url]
    // if has pages grab relative
    if (typeof value.pages === 'object') return state.content[value.pages[url].url]
    // fall back to any key for files etc
    return value[url] || { }
  } catch (err) {
    return { }
  }
}

function first (state, value) {
  try {
    var obj = value || { }
    return obj[objectKeys(obj)[0]] || { }
  } catch (err) {
    return { }
  }
}

function hasView (state, value) {
  try {
    return typeof this._value.view !== 'undefined'
  } catch (err) {
    return false
  }
}

function images (state, value) {
  try {
    return objectKeys(value.files || { })
      .reduce(function (res, cur) {
        if (
          typeof value.files[cur] === 'object' &&
          value.files[cur].type === 'image'
        ) {
          res[cur] = value.files[cur]
        }
        return res
      }, { })
  } catch (err) {
    return { }
  }
}

function isActive (state, value) {
  try {
    return state.href || '/' === value.url
  } catch (err) {
    return false
  }
}

function isFirst (state, value) {
  try {
    var _parent = parent(state, value)
    if (value.extension) {
      return objectKeys(_parent.files).indexOf(value.filename) === 0
    } else {
      return objectKeys(_parent.pages).indexOf(value.name) === 0
    }
  } catch (err) {
    return false
  }
}

function isLast (state, value) {
  try {
    var _parent = parent(state, value)
    if (value.extension) {
      var keys = objectKeys(_parent.files)
      return keys.indexOf(value.filename) === keys.length - 1
    } else {
      var keys = objectKeys(_parent.pages)
      return keys.indexOf(value.name) === keys.length - 1
    }
  } catch (err) {
    return false
  }
}

function last (state, value) {
  try {
    var obj = value || { }
    var keys = objectKeys(obj)
    return obj[keys[keys.length - 1]] || { }
  } catch (err) {
    return { }
  }
}

function page (state, value) {
  try {
    return state.content[state.href || '/'] || { }
  } catch (err) {
    return { }
  }
}

function pages (state, value) {
  try {
    var regex = new RegExp('^' + value.url + '\/[^\/]+\/?$')
    return objectKeys(state.content)
      .filter(key => regex.test(key.trim()))
      .reduce(readPage, { })
  } catch (err) {
    return { }
  }

  function readPage (result, key) {
    var page = state.content[key]
    if (page) result[key] = page
    return result
  }
}

function parent (state, value) {
  try {
    var url = path.resolve(value.url, '../')
    return state.content[url] || { }
  } catch (err) {
    return state.content['/'] || { }
  }
}

function sortBy (state, value, key, order) {
  try {
    return objectValues(value).sort(sort)
  } catch (err) {
    return [ ]
  }

  function sort (a, b) {
    try {
      var alpha = a[key]
      var beta = b[key]

      // reverse order
      if (order === 'desc') {
        alpha = b[key]
        beta = a[key]
      }

      // date or string
      if (isDate(alpha) && isDate(beta)) {
        return new Date(alpha) - new Date(beta)
      } else {
        return alpha.localeCompare(beta)
      }
    } catch (err) {
      return 0
    }
  }
}

function visible (state, value) {
  try {
    if (isPage(value)) {
      return value.visible !== false
    } else {
      return objectValues(value).filter(obj => obj.visible !== false)
    }
  } catch (err) {
    return false
  }
}

function isPage (value) {
  return (
    typeof value === 'object' &&
    typeof value.url === 'string' &&
    !value.extension
  )
}

function isDate (str) {
  return /^\d{4}\-\d{1,2}\-\d{1,2}$/.test(str)
}
