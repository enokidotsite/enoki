<h1 align="center">Enoki</h1>

Enoki is a powerfully simple set of tools and interfaces for creating and managing websites and single-page-apps. It’s as vanilla as possible, meant to get out of your way, and play nice with traditional tooling as well as unique environments, such as the peer-to-peer [Beaker Browser](https://beakerbrowser.com).

Although fully-featured, it is still early in Enoki development. Support for other frameworks and syntax styles are on the roadmap. If something you’d like to see is missing, please feel free to contribute!

## Features

- **no-db**: just files and folders
- **understandable**: written for clarity
- **tools**: easy ways of traversing data
- **cute**: first class support for [choo](https://github.com/choojs/choo), a simple and sturdy front-end framework

## Usage

Although the Enoki library can be unsed in a variety of ways, for the sake of example let’s just create a fresh little Choo app and require `enoki/choo`:

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
var Page = require('enoki/page')
var html = require('choo/html')

function view (state, emit) {
  var page = new Page(state)
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

## Dependencies

For specifics on formatting directories and files, take a look at the dependencies’ documenation.

- [`smarkt`](https://github.com/jondashkyle/smarkt) for parsing mixed key/value store and yaml plain text files
- [`hypha`](https://github.com/jondashkyle/hypha) for turning folders and files into json

## Page API

The Page API is a super easy way of traversing your contnet. A few basic rules.

- End a query and return it’s value by calling `.value()`
- Every method is chainable (except `.value()`)
- Values can be reused in new queries by doing `page(oldQuery)`

### Examples

```js
var Page = require('enoki/page')

function view (state, emit) {
  // instantiate the page
  var page = new Page(state)

  // directly access pages by their href
  var site = page('/').value()
  var about = page('/about').value()

  // grab children and files
  var children = page().children().sort('name', 'asc').value()
  var files = page().files().value()

  // create new queries from previous
  var first = page(children).first().value()
  var last = page(children).last().value()

  // access specific keys
  var lastTitle = page(last).value('title')
}
```

<details><summary><b>Complete Methods List</b></summary>

#### `.children()`

Remaps to `.pages()`.

#### `.files()`

Files of the current `page`.

#### `.find(href)`

Locate a `sub-page` of the `current page` based on the `href`.

#### `.first()`

Returns the first `page` or `file`.

#### `.hasView()`

Does the current page have a custom view?

#### `.isActive()`

Is the current page active?

#### `.last()`

Returns the last `page` or `file`.

#### `.page()`

The current page.

#### `.pages()`

Sub-pages of the current page.

#### `.parent()`

The parent of the current page.

#### `.sortBy(key, order)`

Sort the `files` or `pages` based by a certain key. Order can be either `asc` or `desc`. For example, `.sortBy('name', 'desc')` or  `.sortBy('date', 'asc')`.

#### `.toArray()`

Converts the values of an object to an array.

#### `.value()`

Return the current value.</details>

## Choo

Sick

## Beaker Browser

Nice