<div align="center"><a href="https://enoki.site"><img src="example/content/title.svg" height="auto" width="100%"></a></div>

<br />

Enoki is a powerfully simple set of tools and interfaces for creating and managing websites, single-page apps, and whatever else you can imagine. It’s as vanilla as possible, meant to get out of your way, and play nicely with traditional tooling as well as unique environments, such as the peer-to-peer [Beaker Browser](https://beakerbrowser.com).

Although fully-featured, Enoki is still early in development. Support for other frameworks and syntax styles are on the roadmap. If something you’d like to see is missing, please feel free to contribute!

## Features

- **no-db**: just files and folders
- **simple**: written for clarity and understandability
- **tools**: easy ways of [traversing data](#page-api)
- **cute**: first class support for [choo](https://github.com/choojs/choo), a simple and sturdy front-end framework
- **panel**: manage your content with a [super simple and extensible interface](https://github.com/enokidotsite/panel)

## Usage

The Enoki module can be used in a variety of ways. For a quick overview in situ, take a look at an [example design](https://github.com/enokidotsite/design-jacinto). For the sake of this readme, let’s just create a fresh little Choo app.

Create a `/content` directory in the root of your project and make an `index.txt` file. Pages (and sub-pages) are just folders with their own `index.txt` files:

```
title: Enoki Example
----
text: Hey, not bad!
```

Inside `index.js` let’s initialize our Choo app and require the `enoki/choo` plugin which loads our content. If in an environment exposing the Dat API we’ll dynamically read your `/content` into state. If over HTTP we’ll fallback to static JSON output of state when last edited/built.

```js
var choo = require('choo')
var app = choo()

app.use(require('enoki/choo')())
```

<details><summary><b>Expaned Choo example</b></summary>

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

</details>

## Page API

Enoki provides a super convenient way for traversing flat content state called [`nanopage`](https://github.com/jondashkyle/nanopage). Just pass some [content state](#content-state) to the constructor and you’re set.

```js
var Page = require('enoki/page')
var page = new Page(state)

// some examples
var title = page().value('title')
var children = page().children().toArray()
var imageFirst = page().files().value('path')
```

For a complete list of methods, take a look [at the docs](https://github.com/jondashkyle/nanopage)!

## Enoki Panel

The [Enoki Panel](https://github.com/enokidotsite/panel) is a super extensible interface for managing an Enoki site’s content. It runs entirely client-side in [Beaker Browser](https://beakerbrowser.com), and is accessible at [panel.enoki.site](https://panel.enoki.site).

## Configuration options

```json
{
  "blueprints": "/blueprints",
  "config": "site.json",
  "content": "content",
  "fallback": "/bundles/content.json",
  "file": "index.txt"
}
```

It’s recommended to place your configuration in a file called `site.json` within the root directory of your site. This works like `package.json`, but for your site. Just as `package.json` can be read using any number of tools, your `site.json` can be too.

Alternatively, when using the module, pass the configuration object as the first argument to the Enoki class. When using the Choo plugin, simply pass as the first argument to the returned function.

```js
// using the module
new Enoki(defaults)

// using the choo plugin
app.use(require('enoki/choo')(defaults))
```

Configuration is progressively constructed, just like `package.json`: module defaults → `site.json` → configuration object argument.

<details><summary><b>Configuration options overview</b></summary>

#### `blueprints`

The directory containing your site’s blueprints. These are JSON files describing the fields for the Enoki Panel. Here’s an [example of that](lib/read/defaults.json).

#### `config`

The location of the configuration file.

#### `content`

The content directory.

#### `fallback`

The location of the content state JSON fallback for HTTP.

#### `file.txt`

The file containing data for each page. Defaults to `index.txt`. An alternate could be `index.md`.

</details>

## Peer-to-Peer / Dat

The web is becoming re-decentralized! You can use Enoki with [Dat](https://datproject.org) in an environment such as [Beaker Browser](https://beakerbrowser.com) by swapping Node’s `fs` for the `DatArchive` API. This enables real-time reading of the archives’s files. Ensure you’re using `.readAsync()`.

## HTTP Fallback and CLI

When using Enoki in a Dat environment we use the `DatArchive` API instead of Node’s `fs` to read the archive’s files. However, over `http` Enoki reads a static `json` file for fallback.

If you’d like to output that static `json` when developing your site you can use the Enoki `cli`. It’s possible to watch your content directory for changes by using the `--watch` flag.

```
enoki content
enoki content --watch
```

## Dependencies

For specifics on formatting directories and files, take a look at the dependencies’ documentation.

- [`smarkt`](https://github.com/jondashkyle/smarkt) for parsing mixed key/value store and yaml plain text files
- [`hypha`](https://github.com/jondashkyle/hypha) for turning folders and files into json

## Contributing

Enoki is early in development. If you’d like to see support for webpack, or whatever other tooling, feel free to contribute!