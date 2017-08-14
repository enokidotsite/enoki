#!/usr/bin/env node
var build = require('./build')
var dev = require('./dev')
var defaults = require('./defaults')

require('yargs')
  .command(
    'build',
    'build the site',
    function (yargs) {
      setOptions(yargs)
    },
    build
  )
  .command(
    'dev',
    'spin up a local server and develop',
    function (yargs) {
      setOptions(yargs)
    },
    dev
  )
  .usage('$0 <cmd> [args]')
  .alias('v', 'version')
  .version(function() { return require('../package').version })
  .describe('v', 'show version information')
  .alias('h', 'help')
  .help('help')
  .showHelpOnFail(true, "Specify --help for available options")
  .argv

function setOptions (yargs) {
  return yargs
    .option('verbose', {
      alias: 'v',
      describe: 'Print debug output',
      default: defaults.verbose
    })
    .option('output', {
      alias: 'o',
      describe: 'Build output dir',
      default: defaults.output
    })
    .option('site', {
      alias: 's',
      describe: 'Site dir',
      default: defaults.site
    })
    .option('content', {
      alias: 'c',
      describe: 'Content dir',
      default: defaults.content
    })
    .option('assets', {
      alias: 'a',
      describe: 'Assets dir',
      default: defaults.assets
    })
    .option('live', {
      alias: 'l',
      describe: 'Live reloading',
      default: defaults.live
    })
    .option('panel', {
      alias: 'p',
      describe: 'Panel dir',
      default: 'panel/'
    })
    .option('port', {
      alias: 'P',
      describe: 'Listen on port',
      default: defaults.port
    })
    .option('portpanel', {
      describe: 'Panel listen on port',
      default: defaults.portpanel
    })
    .option('portapi', {
      describe: 'Api listen on port',
      default: defaults.portapi
    })
    .option('config', {
      alias: 'C',
      describe: 'Config file',
      default: defaults.config
    })
}