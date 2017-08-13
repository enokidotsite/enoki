# Enoki

Enoki is a set of tools for self-publishing.

## Pre-Alpha

Not ready for production! Bugs everywhere! No testing! Limited documentation! Boo!!

## Features

- **no database**: use folders and files to structure your site
- **static**: no server-side code needed here!
- **hydrated**: hydrate your static output with isomorphic js
- **flexible**: great defaults, super customizable
- **archivable**: totally portable and future-proof
- **managable**: [appropriate](https://en.wikipedia.org/wiki/Appropriate_technology) for small to mid-sized projects

## Philosophy

## Usage

Enoki transforms your content into a static site. It’s suggested you use the [Starter Kit](#starter-kit) during pre-alpha. You can use Enoki either as a [command line interface]() or a [javascript module]().

<details id="column">
<summary>View the cli --help</summary>
There are a few options which will be available in future versions of the CLI.

```
--verbose, -v  Show version number                  [boolean] [default: false]
--output, -o   Build output dir                            [default: "build/"]
--site, -s     Site dir                                     [default: "site/"]
--content, -c  Content dir                               [default: "content/"]
--assets, -a   Assets dir                                 [default: "assets/"]
--live, -l     Live reloading                                  [default: true]
--panel, -p    Panel dir                                   [default: "panel/"]
--port, -P     Listen on port                                  [default: 8080]
--portpanel    Panel listen on port                            [default: 8081]
--portapi      Api listen on port                              [default: 8082]
--config, -C   Config file                             [default: "config.yml"]
-h, --help     Show help                                             [boolean]
```
</details>

### Build

```
enoki build
```

Provided a valid directory [structure](#structure), transform your content into a static site.

###  Development

```
enoki dev
```

Spin up a [Budo](https://github.com/mattdesl/budo) development server and watch for changes. If you’d like to customize this configuration during pre-alpha, check out the [Browserify Transform](#browserify-transform).

### Browserify Transform

```
browserify index.js -o bundle.js -t require-globify -t enoki/transform
```

The Browserify transform can be used in your custom build. It inlines your directory into JSON. For the pre-alpha, the transform also requires [`require-globify`](https://github.com/capaj/require-globify).


## Starter Kit

The intent is to make a modular set of tools, but during pre-alpha some of these parts are tightly bound. Because of this, it isn’t expected that any one will use the CLI javascript module on it’s own just yet.

Instead, it’s suggested you download the [Starter Kit](http://starter-kit.com) to get an example structure of a fully working site. Future documentation will cover each individual module in detail, but for now what follows is a walk-through of the Starter Kit.

**Download the Starter Kit**