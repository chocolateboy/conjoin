const test           = require('ava')
const { Assertions } = require('ava/lib/assert.js')

const {
    conjoin,
    join,
    conjoiner,
    joiner
} = require(
    '.'
)

const ARRAY = ['foo', 'bar', 'baz', 'quux']

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
    const array = []

    t.isJoined(array, '')
    t.isJoined(array, { with: ' - ' }, '')
    t.isJoined(array, { last: ' or ' }, '')
    t.isJoined(array, { pair: ' or ' }, '')
    t.isJoined(array, { serial: ' or ' }, '')
})

test('single', t => {
    const array = ['foo']

    t.isJoined(array, 'foo')
    t.isJoined(array, { with: ' - ' }, 'foo')
    t.isJoined(array, { last: ' or ' }, 'foo')
    t.isJoined(array, { pair: ' or ' }, 'foo')
    t.isJoined(array, { serial: ' or ' }, 'foo')
})

test('double', t => {
    const array = ['foo', 'bar']

    t.isJoined(array, 'foo and bar')
    t.isJoined(array, { with: ' - ' }, 'foo and bar')
    t.isJoined(array, { last: ' or ' }, 'foo or bar')
    t.isJoined(array, { pair: ' or ' }, 'foo or bar')
    t.isJoined(array, { serial: ' or ' }, 'foo or bar')
})

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

test('non-string separators', t => {
    const sep = { toString: () => ' :: ' }
    const pair = { toString: () => '/' }
    const last = { toString: () => ' -> ' }

    const options = { with: sep, pair, last }

    t.isJoined([], options, '')
    t.isJoined(['foo'], options, 'foo')
    t.isJoined(['foo', 'bar'], options, 'foo/bar')
    t.isJoined(['foo', 'bar', 'baz'], options, 'foo :: bar -> baz')
    t.isJoined(['foo', 'bar', 'baz', 'quux'], options, 'foo :: bar :: baz -> quux')
})

test('array-likes', t => {
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
    t.is(join(ARRAY, { map: true }), '"foo" | "bar" | "baz" or "quux"')
    t.is(join(ARRAY, { map: false }), 'foo | bar | baz or quux')
    t.is(join(ARRAY, { serial: true }), 'foo | bar | baz, or quux')
    t.is(join(ARRAY, { serial: false }), 'foo | bar | baz or quux')
    t.is(join(ARRAY, { map: true, serial: true }), '"foo" | "bar" | "baz", or "quux"')
    t.is(join(ARRAY, { map: true, serial: false }), '"foo" | "bar" | "baz" or "quux"')
    t.is(join(ARRAY, { map: false, serial: true }), 'foo | bar | baz, or quux')
    t.is(join(ARRAY, { map: false, serial: false }), 'foo | bar | baz or quux')
})

test('oxford comma', t => {
    const or = { pair: ' or ', last: ', or ' }
    const and = { pair: ' & ', last: ', and ' }

    t.isJoined([], or, '')
    t.isJoined(['foo'], or, 'foo')
    t.isJoined(['foo', 'bar'], or, 'foo or bar')
    t.isJoined(['foo', 'bar', 'baz'], or, 'foo, bar, or baz')
    t.isJoined(or, 'foo, bar, baz, or quux')

    t.isJoined([], and, '')
    t.isJoined(['foo'], and, 'foo')
    t.isJoined(['foo', 'bar'], and, 'foo & bar')
    t.isJoined(['foo', 'bar', 'baz'], and, 'foo, bar, and baz')
    t.isJoined(and, 'foo, bar, baz, and quux')
})

test('option.last', t => {
    t.isJoined({ last: '' }, 'foo, bar, bazquux')
    t.isJoined({ last: ', ' }, 'foo, bar, baz, quux')
    t.isJoined({ last: ' or ' }, 'foo, bar, baz or quux')
    t.isJoined({ last: ' and ' }, 'foo, bar, baz and quux')
})

test('option.map', t => {
    let map = (value, index) => {
        t.is(index, ARRAY.indexOf(value))
        return value.toUpperCase()
    }

    let options = { map }

    t.isJoined([], options, '')
    t.isJoined(['foo'], options, 'FOO')
    t.isJoined(['foo', 'bar'], options, 'FOO and BAR')
    t.isJoined(['foo', 'bar', 'baz'], options, 'FOO, BAR and BAZ')
    t.isJoined(options, 'FOO, BAR, BAZ and QUUX')

    const manual = (value, index) => {
        t.is(index, ARRAY.indexOf(value))
        return JSON.stringify(value)
    }

    const auto = true

    // confirm the examples in the README work
    for (const map of [manual, auto]) {
        options = { map, last: ' or ' }

        t.isJoined([], options, '')
        t.isJoined(['foo'], options, '"foo"')
        t.isJoined(['foo', 'bar'], options, '"foo" or "bar"')
        t.isJoined(['foo', 'bar', 'baz'], options, '"foo", "bar" or "baz"')
        t.isJoined(options, '"foo", "bar", "baz" or "quux"')
    }
})

test('option.pair', t => {
    const array = ['foo' ,'bar']

    t.isJoined(array, { pair: '' }, 'foobar')
    t.isJoined(array, { pair: ', ' }, 'foo, bar')
    t.isJoined(array, { pair: ' or ' }, 'foo or bar')
    t.isJoined(array, { pair: ' or ', last: ' and not ' }, 'foo or bar')

    t.isJoined({ pair: '' }, 'foo, bar, baz and quux')
    t.isJoined({ pair: ' or ', last: ' and not ' }, 'foo, bar, baz and not quux')
})

test('option.serial', t => {
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
    t.is(join(['foo', 'bar']), 'foo or bar')
    t.is(join(array), 'eats, shoots or leaves')
    t.is(join(array, { serial: true }), 'eats, shoots, or leaves')

    t.isJoined([], or, '')
    t.isJoined(['foo'], or, 'foo')
    t.isJoined(['foo', 'bar'], or, 'foo or bar')
    t.isJoined(['foo', 'bar', 'baz'], or, 'foo, bar, or baz')
    t.isJoined(or, 'foo, bar, baz, or quux')

    t.isJoined([], and, '')
    t.isJoined(['foo'], and, 'foo')
    t.isJoined(['foo', 'bar'], and, 'foo and bar')
    t.isJoined(['foo', 'bar', 'baz'], and, 'foo, bar, and baz')
    t.isJoined(and, 'foo, bar, baz, and quux')

    t.isJoined([], bool1, '')
    t.isJoined(['foo'], bool1, 'foo')
    t.isJoined(['foo', 'bar'], bool1, 'foo and bar')
    t.isJoined(['foo', 'bar', 'baz'], bool1, 'foo, bar, and baz')
    t.isJoined(['foo', 'bar', 'baz', 'quux'], bool1, 'foo, bar, baz, and quux')

    t.isJoined([], bool2, '')
    t.isJoined(['foo'], bool2, 'foo')
    t.isJoined(['foo', 'bar'], bool2, 'foo or bar')
    t.isJoined(['foo', 'bar', 'baz'], bool2, 'foo, bar, or baz')
    t.isJoined(['foo', 'bar', 'baz', 'quux'], bool2, 'foo, bar, baz, or quux')

    t.isJoined([], bool3, '')
    t.isJoined(['foo'], bool3, 'foo')
    t.isJoined(['foo', 'bar'], bool3, 'foo and bar')
    t.isJoined(['foo', 'bar', 'baz'], bool3, 'foo, bar and baz')
    t.isJoined(['foo', 'bar', 'baz', 'quux'], bool3, 'foo, bar, baz and quux')

    t.isJoined([], bool4, '')
    t.isJoined(['foo'], bool4, 'foo')
    t.isJoined(['foo', 'bar'], bool4, 'foo or bar')
    t.isJoined(['foo', 'bar', 'baz'], bool4, 'foo, bar or baz')
    t.isJoined(['foo', 'bar', 'baz', 'quux'], bool4, 'foo, bar, baz or quux')
})

test('option.with', t => {
    const separator = { toString () { return ' / ' } }

    t.isJoined({ with: '; ' }, 'foo; bar; baz and quux')
    t.isJoined({ with: 42 }, 'foo42bar42baz and quux')
    t.isJoined({ with: separator }, 'foo / bar / baz and quux')
})
