## 3.0.0 - TBD

### Breaking Changes

- remove support for the `{ map: true }` shortcut for `JSON.stringify`
- reinstate collection types

### Features

- add a new `$map` option, an alternative to `map` which automatically wraps
  the supplied function so that it only takes a single value

### Fixes

- fix pkg.module filename: index.es.js -> index.esm.js

## 2.0.0 - TBD

### Breaking Changes

- `last` now defaults to `" and "` rather than the value of the default separator
- drop the legacy-browser build

### Features

- setting `map` to true uses a `JSON.stringify` wrapper
- setting `serial` to true uses the value of the `last` option

### Changes

#### Types

- remove unused type parameters: iterables, arrays and `map` are now untyped
  (e.g. `Array<any>`)
- `conjoin` can now take any array-like, rather than just arrays and iterables

#### Misc

- test and document the fact that options supplied to the curried function are
  merged into its default options
- reduce the minified file size

## 1.0.2 - 2020-06-23

- restore standard ESM bundle name

## 1.0.1 - 2020-06-21

- restore missing ESM bundle

## 1.0.0 - 2020-06-20

- add missing license

## 0.1.1 - 2020-06-06

- documentation fix

## 0.1.0 - 2020-06-01

- add support for a map function

## 0.0.1 - 2020-05-31

- initial release
