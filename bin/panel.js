var fs = require('fs-extra')
var path = require('path')
var merry = require('merry')
var budo = require('budo')
var globify = require('require-globify')
var parseBody = require('parse-body')

var getOptions = require('./options')

var enokiModule = require('../')
var enokiTransform = require('../transform')

var cm = require('../lib/content')

module.exports = serve

function serve (opts) {
  var options = getOptions.defaults(opts)
  var paths = getOptions.paths(options)
  
  try {
    fs.lstatSync(paths.panel).isDirectory()
    fs.outputFile(
      path.join(paths.root, '.log'),
      '',
      function (err) {
        if (err) return console.warn(err.message)
      }
    )
  } catch (err) {
    return console.log('Panel directory not found')
  }

  var app = merry({
    // logLevel: 'error'
  })

  // interface
  var server = budo(paths.panel, {
    live: true,
    port: options.portpanel || 8080,
    pushstate: true,
    serve: 'bundle.js',
    dir: [paths.content, path.join(paths.panel, '/assets')],
    browserify: {
      transform: [enokiTransform, globify]
    }
  }).on('connect', function (ev) {
    console.log('Panel running on %s', ev.uri)
    // console.log('LiveReload running on port %s', ev.livePort)
  }).on('update', function (buffer) {
    // console.log('bundle - %d bytes', buffer.length)
  })

  app.route('PUT', '/update', function (req, res, ctx) {
    cors(req, res, function () {
      parseBody(req, 1e6, function (err, body) {
        if (err) return ctx.send(400, { message: err.message })
        if (body.path && body.file && body.page) {
          try {
            fs.outputFile(
              path.join(paths.content, body.path, body.file),
              cm.encode(body.page),
              function (err) {
                if (err) return console.error(err.message)
                if (options.verbose) console.log('created ' + page.path)
                ctx.log.info('write')
                ctx.send(201, { message: 'success' })
              }
            )
          } catch (err) {
            ctx.send(400, { message: 'can not update' })
          }
        } else {
          ctx.send(400, { message: 'missing data' })
        }
      }) 
    })
  })

  app.route('PUT', '/add', function (req, res, ctx) {
    cors(req, res, function () {
      parseBody(req, 1e6, function (err, body) {
        if (err) return ctx.send(400, { message: err.message })
        if (body.path && body.view && body.title) {
          try {
            fs.outputFile(
              path.join(paths.content, body.path, body.view + '.txt'),
              cm.encode({ title: body.title }),
              function (err) {
                if (err) return console.error(err.message)
                if (options.verbose) console.log('created ' + page.path)
                ctx.log.info('write')
                ctx.send(201, { message: 'success' })
                // major hack to force refresh
                fs.appendFileSync(
                  path.join(paths.root, '.log'),
                  path.join(body.path, body.view + '.txt\n')
                )
              }
            )
          } catch (err) {
            ctx.send(400, { message: 'can not update' })
          }
        } else {
          ctx.send(400, { message: 'missing data' })
        }
      }) 
    })
  })

  app.route('PUT', '/add-file', function (req, res, ctx) {
    cors(req, res, function () {
      parseBody(req, 1e6, function (err, body) {
        if (err) return ctx.send(400, { message: err.message })
        if (body.path && body.filename && body.result) {
          // WOW SUPER HACKY
          var image = new Buffer(body.result.split(",")[1], 'base64')
          try {
            fs.outputFile(
              path.join(paths.content, body.path, body.filename),
              image,
              'binary',
              function (err) {
                if (err) return console.error(err.message)
                if (options.verbose) console.log('created ' + page.path)
                ctx.log.info('write')
                ctx.send(201, { message: 'success' })
                // major hack to force refresh
                fs.appendFileSync(
                  path.join(paths.root, '.log'),
                  path.join(body.path, body.view + '.txt\n')
                )
              }
            )
          } catch (err) {
            ctx.send(400, { message: 'can not update' })
          }
        } else {
          ctx.send(400, { message: 'missing data' })
        }
      }) 
    })
  })


  app.route('PUT', '/remove', function (req, res, ctx) {
    cors(req, res, function () {
      parseBody(req, 1e6, function (err, body) {
        if (err) return ctx.send(400, { message: err.message })
        if (body.path) {
          try {
            fs.remove(
              path.join(paths.content, body.path),
              function (err) {
                if (err) return console.error(err.message)
                if (options.verbose) console.log('created ' + page.path)
                ctx.log.info('write')
                ctx.send(201, { message: 'success' })
                // major hack to force refresh
                fs.appendFileSync(
                  path.join(paths.root, '.log'),
                  path.join(body.path, body.view + '.txt\n')
                )
              }
            )
          } catch (err) {
            ctx.send(400, { message: 'can not update' })
          }
        } else {
          ctx.send(400, { message: 'missing data' })
        }
      }) 
    })
  })

  app.route('default', function (req, res, ctx) {
    cors(req, res, function () {
      ctx.log.info('Route doesnt exist')
      ctx.send(404, { message: 'nada butts here' })
    })
  })

  // start
  app.listen(options.portapi || 8081)
  console.log('Api running on http://localhost:' + options.portapi)
}

function cors (req, res, next) {
  var headers = ['Content-Type', 'Accept', 'X-Requested-With']
  var origin = '*'
  var credentials = false
  var methods = ['PUT', 'POST', 'DELETE', 'GET', 'OPTIONS']

  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Headers', headers.join(','))
  res.setHeader('Access-Control-Allow-Credentials', credentials)
  res.setHeader('Access-Control-Allow-Methods', methods.join(','))

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  } else {
    next()
  }
}