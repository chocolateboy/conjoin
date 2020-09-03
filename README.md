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
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- tocstop -->

# NAME

conjoin - a fast and flexible joiner for iterables and arrays with a tiny footprint

# FEATURES

- works with ES6+ iterables, plain arrays and array-likes
- custom default, pair, and last separators
- currying (generate a function with baked-in options)
- no dependencies
- ~350 B minified + gzipped
- fully typed (TypeScript)
- CDN builds (UMD) - [jsDelivr][], [unpkg][]

# INSTALLATION

```
$ npm install @chocolatey/conjoin
```

# SYNOPSIS

```javascript
import { conjoin, conjoiner } from '@chocolatey/conjoin'

const array = ['foo', 'bar', 'baz', 'quux']
const iterable = new Set(array)
const single = array.slice(0, 1)
const pair = array.slice(0, 2)
const triple = array.slice(0, 3)
```

#### works with iterables, arrays, and array-likes

```javascript
const arrayLike = { length: 4, ...array }

conjoin([])        // ""
conjoin(single)    // "foo"
conjoin(pair)      // "foo and bar"
conjoin(triple)    // "foo, bar and baz"
conjoin(array)     // "foo, bar, baz and quux"
conjoin(iterable)  // "foo, bar, baz and quux"
conjoin(arrayLike) // "foo, bar, baz and quux"
```

#### custom separators

```javascript
conjoin(array, { with: '; ' })   // "foo; bar; baz and quux"
conjoin(array, { last: ' or ' }) // "foo, bar, baz or quux"
conjoin(pair, { pair: '/' })     // "foo/bar"
```

#### transform values

```javascript
const map = (it, i) => `${it}(${i + 1})`
join(array, { map }) // 'foo(1), bar(2), baz(3) and quux(4)"
```

#### currying

```javascript
const join = conjoiner({ map: it.toUpperCase() })
join(array)                    // "FOO, BAR, BAZ and QUUX"
join(array, { last: ' AND ' }) // "FOO, BAR, BAZ AND QUUX"
```

#### serial comma

```javascript
const join = conjoiner({ serial: ' or ' })
join(pair)  // "foo or bar"
join(array) // "foo, bar, baz, or quux"
```

# DESCRIPTION

This module exports a function which can be used to join array/iterable
elements to form a string. The default and last separators can be customized,
as well as the separator to use if there are only two elements. Options can
be baked into the function by currying.

## Why?

I often need to glue a list of values together with a default separator and a
different separator for the last two values, e.g. for error messages:

```javascript
const want = ['string', 'symbol', 'function']
const message = 'Invalid name: expected string, symbol or function'
```

Several libraries which support this are available on NPM, but most haven't
been updated to work with iterables (they throw an error rather than
converting), and many come with hardwired, immutable separators. This library
aims to be at least as fast as the other implementations, and more flexible,
while keeping the package size small.

# TYPES

The following types are referenced in the descriptions below.

```typescript
type Joinable = ArrayLike<any> | Iterable<any>;

type Options = {
    last?: string;
    map?: ((value: any, index: number) => any) | boolean;
    pair?: string;
    serial?: string | boolean;
    with?: string;
};
```

# EXPORTS

## conjoin

- **Type**: `(values: Joinable, options?: Options) ⇒ string`
- **Alias**: `join`

```javascript
import { join } from '@chocolatey/conjoin'

join(single)                  // "foo"
join(pair)                    // "foo and bar"
join(array, { last: ' or ' }) // "foo, bar, baz or quux"
```

Takes an array-like or iterable and joins its values with the supplied
separators.

## conjoiner

- **Type**: `(options?: Options) ⇒ ((values: Joinable, extend?: Options) ⇒ string)`
- **Alias**: `joiner`

```javascript
import { joiner } from '@chocolatey/conjoin'

const join = joiner({ last: ' or ' })

join(pair)                  // "foo or bar"
join(triple)                // "foo, bar or baz"
join(array, { with: '/' })  // "foo/bar/baz or quux"
join(array, { last: ': ' }) // "foo, bar, baz: quux"
```

Returns a function which takes an array/iterable and joins its values with the
supplied separators. Options passed to the generated function override the
options passed to the generator.

# OPTIONS

The [`conjoin`](#conjoin-1) and [`conjoiner`](#conjoiner) functions take the
following options.

## last

- **Type**: `string`
- **Default**: `" and "`

```javascript
join(array)                   // "foo, bar, baz and quux"
join(array, { last: ' or ' }) // "foo, bar, baz or quux"
```

The separator to use between the last two values. Used if there are three or
more values, or if there are two values and no [`pair`](#pair) separator is
defined.

## map

- **Type**: `((value: any, index: number) ⇒ any) | boolean`
- **Default**: undefined

```javascript
const map = (it, i) => String(it).repeat(i + 1)
const stringify = it => JSON.stringify(it)

join([1, 2, 3, 4], { map })     // "1, 22, 333 and 4444"
join(array, { map: stringify }) // '"foo", "bar", "baz" and "quux"'
```

An optional function to transform each joined value. If supplied, the function
is passed the value and its 0-based index within the array/iterable.

Note that `JSON.stringify` needs to be wrapped to prevent the second argument
to the map function (the index) being interpreted as a replacer. As a
convenience, if the map value is `true`, this wrapper is used as the function,
e.g.:

```javascript
join(array, { map: true }) // '"foo", "bar", "baz" and "quux"'
```

## pair

- **Type**: `string`
- **Default**: value of the [`last`](#last) option

```javascript
const join = conjoiner({ pair: ' or ', last: ', or ' })

join(single) // "foo"
join(pair)   // "foo or bar"
join(triple) // "foo, bar, or baz"
join(array)  // "foo, bar, baz, or quux"
```

The separator to use when there are exactly two values. If not supplied, it
defaults to the value of the [`last`](#last) option.

Can be used in conjunction with `last` to produce lists in the
"[Oxford comma](https://en.wikipedia.org/wiki/Serial_comma)" style.

## serial

- **Type**: `string | boolean`
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
const join = joiner({ pair: ' or ', last: ', or ' })
join(pair)  // "foo or bar"
join(array) // "foo, bar, baz, or quux"
```

#### after

```javascript
const join = joiner({ serial: ' or ' })
join(pair)  // "foo or bar"
join(array) // "foo, bar, baz, or quux"
```

As a convenience, if the value is true, it's assigned the value of the
[`last`](#last) option, e.g.:

```javascript
const array = ['eats', 'shoots', 'leaves']
conjoin(array)                   // "eats, shoots and leaves"
conjoin(array, { serial: true }) // "eats, shoots, and leaves"

const join = joiner({ last: ' or ' })
join(array)                      // "eats, shoots or leaves"
join(array, { serial: true })    // "eats, shoots, or leaves"
```

## with

- **Type**: `string`
- **Default**: `", "`

```javascript
join(pair, { with: '/' })       // "foo/bar"
join(triple, { with: '/' })     // "foo/bar and baz"
join(triple, { with: ' and ' }) // "foo and bar and baz"
```

The default separator, used for all but the only ([pair](#pair)) and
[last](#last) separators.

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

- [Maintained Node.js versions](https://github.com/nodejs/Release#readme) and compatible browsers

# SEE ALSO

- [array-to-sentence](https://www.npmjs.com/package/array-to-sentence)
- [join-array](https://www.npmjs.com/package/join-array)
- [joinn](https://www.npmjs.com/package/joinn)
- [oxford-comma-join](https://www.npmjs.com/package/oxford-comma-join)
- [oxford-join](https://www.npmjs.com/package/oxford-join)

# VERSION

1.0.2

# AUTHOR

[chocolateboy](https://github.com/chocolateboy)

# COPYRIGHT AND LICENSE

Copyright © 2020 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the
terms of the [Artistic License 2.0](https://www.opensource.org/licenses/artistic-license-2.0.php).

[jsDelivr]: https://cdn.jsdelivr.net/npm/@chocolatey/conjoin@1.0.2/dist/index.umd.min.js
[unpkg]: https://unpkg.com/@chocolatey/conjoin@1.0.2/dist/index.umd.min.js
