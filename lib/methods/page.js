var objectKeys = require('object-keys')

module.exports = {
  getViews: getViews
}

function getViews (props) {
  props = props || { }
  if (!props.blueprint) return console.warn('must define blueprint')
  if (!props.blueprints) return console.warn('must define all blueprints')

  var blueprint = props.blueprint
  var blueprints = props.blueprints

  if (blueprint.pages && typeof blueprint.pages === 'object') {
    // if pages are disabled
    if (blueprint.pages.view === false) return false

    // presets
    if (typeof blueprint.pages.view === 'object') {
      return blueprint.pages.view.reduce(function (result, key) {
        result[key] = blueprints[key]
        return result
      }, { })
    } else {
      // if just a string
      return {
        [blueprint.pages.view]: blueprints[blueprint.pages.view]
      }
    }
  } else {
    return objectKeys(blueprints).reduce(function (result, key) {
      result[key] = blueprints[key]
      return result
    }, { })
  }

  return { }
}
