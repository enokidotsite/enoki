<h1 align="center">Enoki</h1>

Enoki is a powerfully simple set of tools and interfaces for creating and managing websites and single-page-apps. It’s as vanilla as possible, meant to get out of your way, and play nice with traditional tooling as well as unique environments, such as the peer-to-peer [Beaker Browser](https://beakerbrowser.com).

Although fully-featured, Enoki is still early in development. Support for other frameworks and syntax styles are on the roadmap. If something you’d like to see is missing, please feel free to contribute!

## Features

- **no-db**: just files and folders
- **simple**: written for clarity
- **tools**: easy ways of traversing data
- **cute**: first class support for [choo](https://github.com/choojs/choo), a simple and sturdy front-end framework
- **panel**: manage your content with a [super simple and extensible interface](https://github.com/enokidotsite/)

## Usage

Although the Enoki library can be used in a variety of ways, for the sake of example let’s just create a fresh little Choo app and require `enoki/choo`:

```js
var choo = require('choo')
var app = choo()

app.use(require('enoki/choo')())
```

Create a `/content` directory in the root of your project and make an `index.txt` file. Pages (and sub-pages) are just folders with their own `index.txt` files:

```
title: Enoki Example
----
text: Hey, not bad!
```

Inside your Choo views you can traverse your content with a super handy API:

```js
var html = require('choo/html')

function view (state, emit) {
  var page = state.page
  var children = page().children().sort('title', 'asc').value()

  return html`
    <body>
      <h1>${page.value('title')}</h1>
      <article>${page.value('text')}</article>
      <ul>
        ${children.map(renderChild)}
      </ul>
    </body>
  `

  function renderChild (props) {
    var child = page(props)
    return html`
      <li>
        <a href="${child.value('url')}">${child.value('title')}</a>
      </li>
    `
  }
}
``` 

### Browserify

To use Enoki with browserify just include the transform which statically inlines the JSON `hypha` creates. Ensure you’re using the `.readSync()` method and `-t enoki/transform`.

### Peer-to-Peer / Dat

The web is becoming re-decentralized! You can use Enoki with [Dat](https://datproject.org) in an environment such as [Beaker Browser](https://beakerbrowser.com) by swapping Node’s `fs` for the `DatArchive` API. This enables real-time reading of the archives’s files. Ensure you’re using `.readAsync()`.

### CLI

When using Enoki in a Dat environment we use the `DatArchive` API instead of Node’s `fs` to read the archive’s files. However, over `http` Enoki reads a static `json` file for fallback.

If you’d like to output that static `json` when developing your site you can use the Enoki `cli`. It’s possible to watch your content directory for changes by using the `--watch` flag.

```
enoki content
enoki content --watch
```

### Note

Enoki is early in development. If you’d like to see support for webpack, or whatever other tooling, feel free to contribute!

## Dependencies

For specifics on formatting directories and files, take a look at the dependencies’ documenation.

- [`smarkt`](https://github.com/jondashkyle/smarkt) for parsing mixed key/value store and yaml plain text files
- [`hypha`](https://github.com/jondashkyle/hypha) for turning folders and files into json

## Page API

Enoki exposes a super convenient way for traversing flat content state called [`nanopage`](https://github.com/jondashkyle/nanopage).

You can access it like so:

```
var Page = require('enoki/page')
```

Alternatively, if you’re using Choo you can access `nanopage` over state:

```
state.page().title().value()
```

For a complete list of methods, take a look [at the docs](https://github.com/jondashkyle/nanopage)!