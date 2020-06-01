const test = require('ava')
const { Assertions } = require('ava/lib/assert.js')
const { conjoin, join, conjoiner, joiner } = require('.')

const ARRAY = ['foo', 'bar', 'baz', 'quux']

function isJoined (...args) {
    const want = args.pop()

    let array = ARRAY, options = {}

    if (args.length === 2) {
        [array, options] = args
    } else if (args.length === 1) {
        if (Array.isArray(args[0])) {
            array = args[0]
        } else {
            options = args[0]
        }
    }

    const iterable = new Set(array)
    const joinables = [array, iterable]

    for (const joinable of joinables) {
        const curried = conjoiner(options)

        this.is(conjoin(joinable, options), want)
        this.is(curried(joinable), want)

        if (Object.keys(options).length === 0) {
            this.is(conjoin(joinable), want)
        }
    }
}

// XXX workaround until Ava supports custom assertions
// https://github.com/avajs/ava/issues/1094#issuecomment-502420286
Object.assign(Assertions.prototype, { isJoined })

test('alias', t => {
    t.is(join, conjoin)
    t.is(joiner, conjoiner)
})

test('default', t => {
    t.isJoined('foo, bar, baz, quux')
})

test('with', t => {
    const separator = { toString () { return ' / ' } }

    t.isJoined({ with: ' | ' }, 'foo | bar | baz | quux')
    t.isJoined({ with: 42 }, 'foo42bar42baz42quux')
    t.isJoined({ with: separator }, 'foo / bar / baz / quux')
})

test('last', t => {
    t.isJoined({ last: '' }, 'foo, bar, bazquux')
    t.isJoined({ last: ', ' }, 'foo, bar, baz, quux')
    t.isJoined({ last: ' or ' }, 'foo, bar, baz or quux')
    t.isJoined({ last: ' and ' }, 'foo, bar, baz and quux')
})

test('pair', t => {
    const array = ['foo' ,'bar']

    t.isJoined(array, { pair: '' }, 'foobar')
    t.isJoined(array, { pair: ', ' }, 'foo, bar')
    t.isJoined(array, { pair: ' or ' }, 'foo or bar')

    t.isJoined({ pair: '' }, 'foo, bar, baz, quux')
    t.isJoined(array, { pair: ' or ', last: ' and ' }, 'foo or bar')
    t.isJoined({ pair: ' or ', last: ' and ' }, 'foo, bar, baz and quux')
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

    t.isJoined(array, 'foo, bar')
    t.isJoined(array, { with: ' - ' }, 'foo - bar')
    t.isJoined(array, { last: ' or ' }, 'foo or bar')
    t.isJoined(array, { pair: ' or ' }, 'foo or bar')
    t.isJoined(array, { serial: ' or ' }, 'foo or bar')
})

test('oxford comma', t => {
    const or = { pair: ' or ', last: ', or ' }
    const and = { pair: ' and ', last: ', and ' }

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
})

test('serial', t => {
    const or = { serial: ' or ' }
    const and = { serial: ' and ' }

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
})

test('type', t => {
    const array = [1, 2, 3, 4]

    t.isJoined([1], '1')
    t.isJoined([1, 2], '1, 2')
    t.isJoined([1, 2], { pair: 42 }, '1422')
    t.isJoined(array, '1, 2, 3, 4')
    t.isJoined(array, { with: 42 }, '1422423424')
})

test('map', t => {
    let map = (value, index) => {
        t.is(index, ARRAY.indexOf(value))
        return value.toUpperCase()
    }

    let options = { map }

    t.isJoined([], options, '')
    t.isJoined(['foo'], options, 'FOO')
    t.isJoined(['foo', 'bar'], options, 'FOO, BAR')
    t.isJoined(['foo', 'bar', 'baz'], options, 'FOO, BAR, BAZ')
    t.isJoined(options, 'FOO, BAR, BAZ, QUUX')

    map = (value, index) => {
        t.is(index, ARRAY.indexOf(value))
        return JSON.stringify(value)
    }

    // confirm the example in the README works

    options = { map, last: ' or ' }

    t.isJoined([], options, '')
    t.isJoined(['foo'], options, '"foo"')
    t.isJoined(['foo', 'bar'], options, '"foo" or "bar"')
    t.isJoined(['foo', 'bar', 'baz'], options, '"foo", "bar" or "baz"')
    t.isJoined(options, '"foo", "bar", "baz" or "quux"')
})
