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
  - [$map](#dollar-map)
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
- &lt; 350 B minified + gzipped
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
const map = (value, index) => JSON.stringify(value)
const $map = JSON.stringify

join(array, { map })  // '"foo", "bar", "baz", "quux"'
join(array, { $map }) // '"foo", "bar", "baz", "quux"'
```

#### currying

```javascript
const map = it => it.toUpperCase()
const join = conjoiner({ map })

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
type Joinable<T> = ArrayLike<T> | Iterable<T>;

type Options<T> = {
    last?: string;
    map?: (value: T, index: number) => any;
    pair?: string;
    serial?: string | boolean;
    with?: string;
    $map?: (value: T) => any;
};
```

# EXPORTS

## conjoin

- **Type**: `(values: Joinable<T>, options?: Options<T>) ⇒ string`
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

- **Type**:
    - `<U>(options?: Options<U>) ⇒ (values: Joinable<U>) ⇒ string`
    - `<U>(options?: Options<U>) ⇒ <T>(values: Joinable<T>, options: Options<T>) ⇒ string`
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

- **Type**: `(value: T, index: number) => any`
- **Default**: `undefined`

```javascript
const repeat = (it, i) => String(it).repeat(i + 1)
const toInt = it => parseInt(it)

join(['a', 'b', 'c', 'd'], { map: repeat })    // "a, bb, ccc, dddd"
join(['1.', '2.', '3.', '4.'], { map: toInt }) // "1, 2, 3, 4"
```

An optional function to transform each joined value. If supplied, the function
is passed the value and its 0-based index within the array/iterable.

Note that functions like `parseInt` need to be wrapped to ensure the second
argument passed to the map function (the index) isn't disallowed or
[misinterpreted][parseInt]. Rather than wrapping these functions manually, they can be
wrapped automatically via the [`$map`](#dollar-map) option.

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
join(pair, { serial: ' or ' })                          // "foo or bar"
join(array, { serial: ' or ' })                         // "foo, bar, baz, or quux"
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
```

```javascript
const join = joiner({ last: ' or ' })

join(array)                      // "eats, shoots or leaves"
join(array, { serial: true })    // "eats, shoots, or leaves"
```

## with

- **Type**: `string`
- **Default**: `", "`

```javascript
join(pair,   { with: '/' })     // "foo and bar"
join(triple, { with: '/' })     // "foo/bar and baz"
join(triple, { with: ' and ' }) // "foo and bar and baz"
```

The default separator, used for all but the only ([pair](#pair)) and
[last](#last) separators.

## $map <a name="dollar-map"></a>

- **Type**: `(value: T) => any`
- **Default**: `undefined`

```javascript
const items = ['1.', '2)', '3:', '4/']

join(items, { $map: parseInt })       // "1, 2, 3 and 4"
join(array, { $map: JSON.stringify }) // '"foo", "bar", "baz" and "quux"'
```

An optional function to transform each joined value.

This is the same as the [`map`](#map) option, but the function is automatically wrapped
to ensure it's only passed a value rather than a value and its index. This is
needed for functions that disallow or [misinterpret][parseInt] additional arguments
such as `parseInt` and `JSON.stringify`.

Assigning a function to `$map` is the same as assigning its wrapper to `map`, so
the following are equivalent:

```javascript
const map = it => JSON.stringify(it)

join(array, { map })                  // '"foo", "bar", "baz" and "quux"'
join(array, { $map: JSON.stringify }) // '"foo", "bar", "baz" and "quux"'
```

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

2.0.0

# AUTHOR

[chocolateboy](https://github.com/chocolateboy)

# COPYRIGHT AND LICENSE

Copyright © 2020 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the
terms of the [Artistic License 2.0](https://www.opensource.org/licenses/artistic-license-2.0.php).

[jsDelivr]: https://cdn.jsdelivr.net/npm/@chocolatey/conjoin@2.0.0/dist/index.umd.min.js
[parseInt]: https://stackoverflow.com/q/262427
[unpkg]: https://unpkg.com/@chocolatey/conjoin@2.0.0/dist/index.umd.min.js
