var fs = require('fs-extra')
var path = require('path')
var budo = require('budo')
var globify = require('require-globify')
var parseBody = require('parse-body')
var serverRouter = require('server-router')

var getOptions = require('./options')

var enokiModule = require('../')
var enokiTransform = require('../transform')

var utilsContent = require('../lib/utils/content')

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

  var router = serverRouter()
  router.route('PUT', '/api/v1/update', handleUpdate)
  router.route('PUT', '/api/v1/add', handleAdd)
  router.route('PUT', '/api/v1/add-file', handleAdd)
  router.route('PUT', '/api/v1/remove', handleRemove)

  // interface
  var server = budo(paths.panel, {
    live: true,
    port: options.portpanel || 8080,
    pushstate: true,
    serve: 'bundle.js',
    dir: [paths.content, path.join(paths.panel, '/assets')],
    browserify: {
      transform: [enokiTransform, globify]
    },
    middleware: function (req, res, next) {
      router.match(req, res)
    }
  }).on('connect', function (ev) {
    console.log('Panel running on %s', ev.uri)
  })

  function handleUpdate (req, res) {
    parseBody(req, 1e6, function (err, body) {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: 'Error '}))
      }

      try {
        fs.outputFile(
          path.join(paths.content, body.path, body.file),
          utilsContent.encode(body.page),
          function (err) {
            if (err) return console.error(err.message)
            if (options.verbose) console.log('created ' + page.path)
            res.writeHead(201, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ message: 'Worked' }))
          }
        )
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: 'Error '}))
      }
    }) 
  }

  function handleAdd (req, res) {
    parseBody(req, 1e6, function (err, body) {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: 'Error '}))
      }

      try {
        fs.outputFile(
          path.join(paths.content, body.path, body.view + '.txt'),
          utilsContent.encode({ title: body.title }),
          function (err) {
            if (err) return console.error(err.message)
            if (options.verbose) console.log('created ' + page.path)

            // major hack to force refresh
            fs.appendFileSync(
              path.join(paths.root, '.log'),
              path.join(body.path, body.view + '.txt\n')
            )

            res.writeHead(201, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ message: 'success' }))
          }
        )
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: 'Error '}))
      }
    }) 
  }

  function handleAddFile (req, res) {
    parseBody(req, 1e6, function (err, body) {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: 'Error '}))
      }

      try {
        var image = new Buffer(body.result.split(",")[1], 'base64')
        fs.outputFile(
          path.join(paths.content, body.path, body.filename),
          image,
          'binary',
          function (err) {
            if (err) return console.error(err.message)
            if (options.verbose) console.log('created ' + page.path)

            // major hack to force refresh
            fs.appendFileSync(
              path.join(paths.root, '.log'),
              path.join(body.path, body.view + '.txt\n')
            )

            res.writeHead(201, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ message: 'success' }))
          }
        )
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: 'Error '}))
      }
    }) 
  }

  function handleRemove (req, res) {
    parseBody(req, 1e6, function (err, body) {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: 'Error '}))
      }

      try {
        fs.remove(
          path.join(paths.content, body.path),
          function (err) {
            if (err) return console.error(err.message)
            if (options.verbose) console.log('created ' + page.path)
              
            // major hack to force refresh
            fs.appendFileSync(
              path.join(paths.root, '.log'),
              path.join(body.path, body.view + '.txt\n')
            )

            res.writeHead(201, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ message: 'success' }))
          }
        )
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: 'Error '}))
      }
    }) 
  }
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