const test                                 = require('ava')
const { Assertions }                       = require('ava/lib/assert.js')
const { conjoin, join, conjoiner, joiner } = require('.')

const ARRAY = ['foo', 'bar', 'baz', 'quux']
const EMPTY = []
const SINGLE = ARRAY.slice(0, 1)
const PAIR = ARRAY.slice(0, 2)
const TRIPLE = ARRAY.slice(0, 3)

function getArguments () {
    return arguments
}

function isJoined (...args) {
    const want = args.pop()

    let array = ARRAY, options = {}

    if (args.length === 2) {
        [array, options] = args
    } else if (args.length === 1) {
        if (Array.isArray(args[0]) || 'length' in args[0]) {
            array = args[0]
        } else {
            options = args[0]
        }
    }

    const iterable = new Set(Array.from(array))
    const joinables = [array, iterable]

    for (const joinable of joinables) {
        const curried = conjoiner(options)
        const curriedNoOptions = conjoiner()
        const curriedEmptyOptions = conjoiner({})
        const curriedSameOptions = conjoiner(options)

        this.is(conjoin(joinable, options), want)
        this.is(curried(joinable), want)
        this.is(curriedNoOptions(joinable, options), want)
        this.is(curriedEmptyOptions(joinable, options), want)
        this.is(curriedSameOptions(joinable, options), want)

        if (Object.keys(options).length === 0) {
            this.is(conjoin(joinable), want)
        }
    }
}

// XXX workaround until AVA supports custom assertions
// https://github.com/avajs/ava/issues/1094#issuecomment-502420286
Object.assign(Assertions.prototype, { isJoined })

test('alias', t => {
    t.is(join, conjoin)
    t.is(joiner, conjoiner)
})

test('default', t => {
    t.isJoined('foo, bar, baz and quux')
})

test('empty', t => {
    t.isJoined(EMPTY, '')
    t.isJoined(EMPTY, { last: ' or ' }, '')
    t.isJoined(EMPTY, { pair: ' or ' }, '')
    t.isJoined(EMPTY, { serial: ' or ' }, '')
    t.isJoined(EMPTY, { with: ' - ' }, '')
})

test('single', t => {
    t.isJoined(SINGLE, 'foo')
    t.isJoined(SINGLE, { last: ' or ' }, 'foo')
    t.isJoined(SINGLE, { pair: ' or ' }, 'foo')
    t.isJoined(SINGLE, { serial: ' or ' }, 'foo')
    t.isJoined(SINGLE, { with: ' - ' }, 'foo')
})

test('double', t => {
    t.isJoined(PAIR, 'foo and bar')
    t.isJoined(PAIR, { last: ' or ' }, 'foo or bar')
    t.isJoined(PAIR, { pair: ' or ' }, 'foo or bar')
    t.isJoined(PAIR, { serial: ' or ' }, 'foo or bar')
    t.isJoined(PAIR, { with: ' - ' }, 'foo and bar')
})

// XXX symbol values aren't supported (they don't stringify via concatenation)
test('non-string values', t => {
    let i = 0

    const array = [1, 2, 3, 4]
    const values = Array.from(ARRAY, (_, i) => new RegExp(++i, 'g'))

    t.isJoined([1], '1')
    t.isJoined([1, 2], '1 and 2')
    t.isJoined([1, 2], { pair: 42 }, '1422')
    t.isJoined(array, '1, 2, 3 and 4')
    t.isJoined(array, { with: 42 }, '1422423 and 4')
    t.isJoined(array, { with: 42, last: 42 }, '1422423424')

    t.isJoined(values, '/1/g, /2/g, /3/g and /4/g')
})

// XXX these are supported by the (transpiled) JavaScript, but not by
// TypeScript, where we require string separators
test('non-string separators', t => {
    class Separator {
        constructor (sep) {
            this._sep = sep
        }

        toString () {
            return this._sep
        }
    }

    const sep = { toString: () => ' :: ' }
    const pair = new Separator('/')
    const last = new String(' -> ')
    const options = { with: sep, pair, last }

    t.isJoined(EMPTY, options, '')
    t.isJoined(SINGLE, options, 'foo')
    t.isJoined(PAIR, options, 'foo/bar')
    t.isJoined(TRIPLE, options, 'foo :: bar -> baz')
    t.isJoined(ARRAY, options, 'foo :: bar :: baz -> quux')
})

test('array-likes', t => {
    // `arguments` is actually iterable, but it's pretty much the canonical
    // array-like so we want to confirm it works
    const args1 = getArguments(...ARRAY)
    t.isJoined(args1, 'foo, bar, baz and quux')

    const args2 = { length: ARRAY.length, ...ARRAY }
    t.isJoined(args2, 'foo, bar, baz and quux')
})

// this is tested by default in isJoined, but in an all or nothing way. confirm
// it works with selected overrides
test('curried override', t => {
    const join = conjoiner({ with: ' | ', last: ' or ' })

    t.is(join(ARRAY), 'foo | bar | baz or quux')
    t.is(join(ARRAY, { with: '/' }), 'foo/bar/baz or quux')
    t.is(join(ARRAY, { last: ' but not ' }), 'foo | bar | baz but not quux')
    t.is(join(ARRAY, { serial: true }), 'foo | bar | baz, or quux')
    t.is(join(ARRAY, { serial: false }), 'foo | bar | baz or quux')
})

test('oxford comma', t => {
    const or = { pair: ' or ', last: ', or ' }
    const and = { pair: ' & ', last: ', and ' }

    t.isJoined(EMPTY, or, '')
    t.isJoined(SINGLE, or, 'foo')
    t.isJoined(PAIR, or, 'foo or bar')
    t.isJoined(TRIPLE, or, 'foo, bar, or baz')
    t.isJoined(or, 'foo, bar, baz, or quux')

    t.isJoined(EMPTY, and, '')
    t.isJoined(SINGLE, and, 'foo')
    t.isJoined(PAIR, and, 'foo & bar')
    t.isJoined(TRIPLE, and, 'foo, bar, and baz')
    t.isJoined(and, 'foo, bar, baz, and quux')
})

test('options.last', t => {
    t.isJoined({ last: '' }, 'foo, bar, bazquux')
    t.isJoined({ last: ', ' }, 'foo, bar, baz, quux')
    t.isJoined({ last: ' or ' }, 'foo, bar, baz or quux')
    t.isJoined({ last: ' and ' }, 'foo, bar, baz and quux')
})

test('options.map', t => {
    const map = (value, index) => {
        t.is(index, ARRAY.indexOf(value))
        return value.toUpperCase()
    }

    const options = { map }

    t.isJoined(EMPTY, options, '')
    t.isJoined(SINGLE, options, 'FOO')
    t.isJoined(PAIR, options, 'FOO and BAR')
    t.isJoined(TRIPLE, options, 'FOO, BAR and BAZ')
    t.isJoined(options, 'FOO, BAR, BAZ and QUUX')
})

test('options.$map', t => {
    const options = { $map: JSON.stringify }

    t.isJoined(EMPTY, options, '')
    t.isJoined(SINGLE, options, '"foo"')
    t.isJoined(PAIR, options, '"foo" and "bar"')
    t.isJoined(TRIPLE, options, '"foo", "bar" and "baz"')
    t.isJoined(options, '"foo", "bar", "baz" and "quux"')
})

test('options.pair', t => {
    t.isJoined(PAIR, { pair: '' }, 'foobar')
    t.isJoined(PAIR, { pair: ', ' }, 'foo, bar')
    t.isJoined(PAIR, { pair: ' or ' }, 'foo or bar')
    t.isJoined(PAIR, { pair: ' or ', last: ' and not ' }, 'foo or bar')

    t.isJoined({ pair: '' }, 'foo, bar, baz and quux')
    t.isJoined({ pair: ' or ', last: ' and not ' }, 'foo, bar, baz and not quux')
})

test('options.serial', t => {
    const or = { serial: ' or ' }
    const and = { serial: ' and ' }
    const bool1 = { serial: true }
    const bool2 = { serial: true, last: ' or ' }
    const bool3 = { serial: false }
    const bool4 = { serial: false, last: ' or ' }

    // examples from the README
    const array = ['eats', 'shoots', 'leaves']
    t.isJoined(array, 'eats, shoots and leaves')
    t.isJoined(array, { serial: true }, 'eats, shoots, and leaves')

    const join = conjoiner({ last: ' or ' })
    t.is(join(PAIR), 'foo or bar')
    t.is(join(array), 'eats, shoots or leaves')
    t.is(join(array, { serial: true }), 'eats, shoots, or leaves')

    t.isJoined(EMPTY, or, '')
    t.isJoined(SINGLE, or, 'foo')
    t.isJoined(PAIR, or, 'foo or bar')
    t.isJoined(TRIPLE, or, 'foo, bar, or baz')
    t.isJoined(or, 'foo, bar, baz, or quux')

    t.isJoined(EMPTY, and, '')
    t.isJoined(SINGLE, and, 'foo')
    t.isJoined(PAIR, and, 'foo and bar')
    t.isJoined(TRIPLE, and, 'foo, bar, and baz')
    t.isJoined(and, 'foo, bar, baz, and quux')

    t.isJoined(EMPTY, bool1, '')
    t.isJoined(SINGLE, bool1, 'foo')
    t.isJoined(PAIR, bool1, 'foo and bar')
    t.isJoined(TRIPLE, bool1, 'foo, bar, and baz')
    t.isJoined(ARRAY, bool1, 'foo, bar, baz, and quux')

    t.isJoined(EMPTY, bool2, '')
    t.isJoined(SINGLE, bool2, 'foo')
    t.isJoined(PAIR, bool2, 'foo or bar')
    t.isJoined(TRIPLE, bool2, 'foo, bar, or baz')
    t.isJoined(ARRAY, bool2, 'foo, bar, baz, or quux')

    t.isJoined(EMPTY, bool3, '')
    t.isJoined(SINGLE, bool3, 'foo')
    t.isJoined(PAIR, bool3, 'foo and bar')
    t.isJoined(TRIPLE, bool3, 'foo, bar and baz')
    t.isJoined(ARRAY, bool3, 'foo, bar, baz and quux')

    t.isJoined(EMPTY, bool4, '')
    t.isJoined(SINGLE, bool4, 'foo')
    t.isJoined(PAIR, bool4, 'foo or bar')
    t.isJoined(TRIPLE, bool4, 'foo, bar or baz')
    t.isJoined(ARRAY, bool4, 'foo, bar, baz or quux')
})

test('options.with', t => {
    const separator = { toString () { return ' / ' } }

    t.isJoined({ with: '; ' }, 'foo; bar; baz and quux')
    t.isJoined({ with: 42 }, 'foo42bar42baz and quux')
    t.isJoined({ with: separator }, 'foo / bar / baz and quux')
})
