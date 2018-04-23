#!/usr/bin/env node
var Enoki = require('../lib/read/sync')
var chokidar = require('chokidar')
var mkdirp = require('mkdirp')
var path = require('path')
var fs = require('fs')

// create a global enoki instance
// set some defaults
var enoki = new Enoki()
var defaults = {
  output: 'bundles/content.json',
  verbose: false,
  watch: false
}

// create our cli app
module.exports = require('yargs')
  .command('content', 'output static content', setOptions, handleContent)
  .version('version', require('../package').version)
  .alias('h', 'help')
  .help('help')
  .usage('Usage: $0 -x [num]')
  .showHelpOnFail(false, 'Specify --help for available options')
  .argv

// should we watch or not?
function handleContent (argv) {
  if (argv.watch) watchContent(argv)
  else buildContent(argv)
}

function watchContent (argv) {
  // grab our settings and watch the content dir
  var site = enoki.readSite()
  var watcher = chokidar.watch(site.config.content, {
    ignored: /(^|[/\\])\../,
    persistent: true
  })

  if (argv.verbose) {
    console.log(`Enoki is watching ${site.config.content} for changes`)
  }

  // build and begin watching
  buildContent(argv)
  watcher.on('change', function (file) {
    buildContent(argv)
  })
}

function buildContent (argv) {
  var content = enoki.readContent()

  if (argv.verbose) {
    console.log(`Writing Enoki content to ${argv.output}`)
  }

  // ensure the content dir exists and try writing
  mkdirp(path.dirname(argv.output), function () {
    try {
      fs.writeFileSync(argv.output, JSON.stringify(content))
      if (argv.verbose) console.log(`Enoki content saved`)
    } catch (err) {
      if (argv.verbose) console.log(`Can not save Enoki content`)
      throw new Error(err)
    }
  })
}

function setOptions (yargs) {
  return yargs
    .option('output', {
      alias: 'o',
      describe: 'Output path',
      default: defaults.output
    })
    .option('watch', {
      alias: 'w',
      describe: 'Watch for changes',
      default: defaults.watch
    })
    .option('verbose', {
      alias: 'v',
      describe: 'Log ouptut',
      default: defaults.verbose
    })
}
