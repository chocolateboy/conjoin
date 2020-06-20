# conjoin

[![Build Status](https://travis-ci.org/chocolateboy/conjoin.svg)](https://travis-ci.org/chocolateboy/conjoin)
[![NPM Version](https://img.shields.io/npm/v/@chocolatey/conjoin.svg)](https://www.npmjs.org/package/@chocolatey/conjoin)

<!-- toc -->

- [NAME](#name)
- [FEATURES](#features)
- [INSTALLATION](#installation)
- [SYNOPSIS](#synopsis)
- [DESCRIPTION](#description)
  - [Why?](#why)
- [TYPES](#types)
- [EXPORTS](#exports)
  - [conjoin](#conjoin-1)
  - [conjoiner](#conjoiner)
- [OPTIONS](#options)
  - [last](#last)
  - [map](#map)
  - [pair](#pair)
  - [serial](#serial)
  - [with](#with)
- [DEVELOPMENT](#development)
- [COMPATIBILITY](#compatibility)
  - [Compat](#compat)
  - [Modern](#modern)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- tocstop -->

# NAME

conjoin - a fast and flexible joiner for iterables and arrays with a small footprint

# FEATURES

- works with ES6+ iterables and plain arrays
- custom default, pair, and last separators
- currying (generate a function with baked-in options)
- &lt; 700 B minified
- no dependencies
- fully typed (TypeScript)

# INSTALLATION

```
$ npm install @chocolatey/conjoin
```

# SYNOPSIS

```javascript
import { conjoin, conjoiner } from '@chocolatey/conjoin'

const array = ['foo', 'bar', 'baz', 'quux']
const iterable = new Set(array)
const pair = array.slice(0, 2)

// works with iterables and arrays
conjoin(array)    // "foo, bar, baz, quux"
conjoin(iterable) // "foo, bar, baz, quux"

// custom separators
conjoin(array, { with: ' | ' })  // "foo | bar | baz | quux"
conjoin(array, { last: ' or ' }) // "foo, bar, baz or quux"

// currying
const join = conjoiner({ last: ' or ' })
join(array) // "foo, bar, baz or quux"
join(pair)  // "foo or bar"

// transform values
const map = it => JSON.stringify(it)
const join = conjoiner({ map, last: ' or ' })
join(array) // '"foo", "bar", "baz" or "quux"'

// serial comma
const join = conjoiner({ pair: ' and ', last: ', and ' })
join(pair)  // "foo and bar"
join(array) // "foo, bar, baz, and quux"

// shorthand
const join = conjoiner({ serial: ' and ' })
join(pair)  // "foo and bar"
join(array) // "foo, bar, baz, and quux"
```

# DESCRIPTION

This module exports a function which can be used to join array/iterable
elements to form a string. The default and last separators can be customized,
as well as the separator to use if there are only two elements. Options can
be baked into the function by currying.

## Why?

I often need to glue a list of values together with a separator, e.g. for error
messages:

```javascript
const want = ['string', 'symbol', 'function']
const message = 'Invalid name: expected string, symbol or function.'
```

Several libraries which support this are available on NPM, but most haven't
been updated to work with iterables (they throw an error rather than
converting), and many come with hardwired, immutable separators. This library
aims to be at least as fast as the other implementations, and more flexible,
while keeping the package size small.

# TYPES

The following types are referenced in the descriptions below.

```typescript
type Options<T> = {
    last?: string;
    map?: (value: T, index: number) => any;
    pair?: string;
    serial?: string;
    with?: string;
};
```

# EXPORTS

## conjoin

- **Type**: `<T>(Iterable<T>, options?: Options<T>) ⇒ string`
- **Alias**: `join`

```javascript
import { join } from '@chocolatey/conjoin'

join([])                                              // ""
join(['foo'])                                         // "foo"
join(['foo', 'bar'])                                  // "foo, bar"
join(['foo', 'bar', 'baz'])                           // "foo, bar, baz"
join(['foo', 'bar', 'baz', 'quux'], { last: ' or ' }) // "foo, bar, baz or quux"
```

Takes an array or iterable and joins its values with the supplied separators.

## conjoiner

- **Type**: `(options: Options<T>) ⇒ <T>(iterable: Iterable<T>) ⇒ string`
- **Alias**: `joiner`

```javascript
import { joiner } from '@chocolatey/conjoin'

const join = joiner({ last: ' or ' })

join([])                            // ""
join(['foo'])                       // "foo"
join(['foo', 'bar'])                // "foo or bar"
join(['foo', 'bar', 'baz', 'quux']) // "foo, bar, baz or quux"
```

Returns a function which takes an array/iterable and joins its values with the
supplied separators.

# OPTIONS

The [`conjoin`](#conjoin-1) and [`conjoiner`](#conjoiner) functions take the
following options.

## last

- **Type**: `string`
- **Default**: value of the [`with`](#with) option

```javascript
join(array)                   // "foo, bar, baz, quux"
join(array, { last: ' or ' }) // "foo, bar, baz or quux"
```

The separator to use before the final value. Only used if there are three or
more values. If not supplied, it defaults to the value of the [`with`](#with)
option.

## map

- **Type**: `(value: T, index: number) ⇒ any`
- **Default**: undefined

```javascript
const toUpper = value => value.toUpperCase()
const stringify = it => JSON.stringify(it)

join(array, { map: toUpper })   // "FOO, BAR, BAZ, QUUX"
join(array, { map: stringify }) // '"foo", "bar", "baz", "quux"'
```

A function to transform each joined value. If supplied, the function is passed
the value and its 0-based index within the array/iterable.

## pair

- **Type**: `string`
- **Default**: value of the [`last`](#last) option

```javascript
const join = conjoiner({ pair: ' and ', last: ', and ' })

join(['foo'])                       // "foo"
join(['foo', 'bar'])                // "foo and bar"
join(['foo', 'bar', 'baz'])         // "foo, bar, and baz"
join(['foo', 'bar', 'baz', 'quux']) // "foo, bar, baz, and quux"
```

The separator to use when there are exactly two values. If not supplied, it
defaults to the value of the [`last`](#last) option.

Can be used in conjunction with `last` to produce lists in the
"[Oxford comma](https://en.wikipedia.org/wiki/Serial_comma)" style.

## serial

- **Type**: `string`
- **Default**: `undefined`

```javascript
join([1, 2, 3], { serial: ' or ' })                     // "1, 2, or 3"
join(['eats', 'shoots', 'leaves'], { serial: ' and ' }) // "eats, shoots, and leaves"
```

This option provides a way to create an Oxford-comma-style list with a single
option by taking advantage of the fact that the [`last`](#last) separator in such
lists is the [`pair`](#pair) separator with a comma prepended. Supplying a `serial`
option of `<string>` is equivalent to providing a `pair` option of `<string>`
and a `last` option of `","` + `<string>`, e.g.:

#### before

```javascript
join(pair, { pair: ' or ', last: ', or ' })  // "foo or bar"
join(array, { pair: ' or ', last: ', or ' }) // "foo, bar, baz, or quux"
```

#### after

```javascript
join(pair, { serial: ' or ' })  // "foo or bar"
join(array, { serial: ' or ' }) // "foo, bar, baz, or quux"
```

## with

- **Type**: `string`
- **Default**: `", "`

```javascript
join(['foo', 'bar'], { with: '' })           // "foobar"
join(['foo', 'bar'], { with: ',' })          // "foo,bar"
join(['foo', 'bar', 'baz'], { with: ' | ' }) // "foo | bar | baz"
```

The default separator. Used as the last separator as well unless overridden by
the [`last`](#last) or [`pair`](#pair) options.

# DEVELOPMENT

<details>

## NPM Scripts

The following NPM scripts are available:

- build - compile the library for testing and save to the target directory
- build:release - compile the library for release and save to the target directory
- clean - remove the target directory and its contents
- doctoc - generate the README's TOC (table of contents)
- rebuild - clean the target directory and recompile the library
- test - recompile the library and run the test suite
- test:run - run the test suite
- typecheck - sanity check the library's type definitions

</details>

# COMPATIBILITY

## Compat

`index.umd.min.js`:

- any [environment][browserslist] with ([full][string-iterator]) support for [`Array.from`][array-from]

## Modern

`index.js` and `index.esm.js`:

- [Maintained Node.js versions](https://github.com/nodejs/Release#readme) and compatible browsers

# SEE ALSO

- [array-to-sentence](https://www.npmjs.com/package/array-to-sentence)
- [join-array](https://www.npmjs.com/package/join-array)
- [joinn](https://www.npmjs.com/package/joinn)
- [oxford-comma-join](https://www.npmjs.com/package/oxford-comma-join)
- [oxford-join](https://www.npmjs.com/package/oxford-join)

# VERSION

1.0.0

# AUTHOR

[chocolateboy](https://github.com/chocolateboy)

# COPYRIGHT AND LICENSE

Copyright © 2020 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the
terms of the [Artistic License 2.0](https://www.opensource.org/licenses/artistic-license-2.0.php).

[string-iterator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/@@iterator
[array-from]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
[browserslist]: https://browserl.ist/?q=chrome+%3E%3D+51%2C+edge+%3E%3D+15%2C+electron+%3E%3D+1.2%2C+firefox+%3E%3D+36%2C+ios+%3E%3D+10%2C+node+%3E%3D+6.5%2C+opera+%3E%3D+38%2C+safari+%3E%3D+10%2C+samsung+%3E%3D+5
