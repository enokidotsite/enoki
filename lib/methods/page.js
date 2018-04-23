var assert = require('assert')
var objectKeys = require('object-keys')

module.exports = {
  getViews: getViews
}

function getViews (props) {
  assert.equal(typeof props, 'object', 'enoki arg1 props must be type object')
  assert.equal(typeof props.blueprint, 'object', 'enoki arg1 props.blueprint must be type object')
  assert.equal(typeof props.blueprints, 'object', 'enoki arg1 props.blueprints must be type object')

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
}
