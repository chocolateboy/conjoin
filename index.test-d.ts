import { expectError, expectType } from 'tsd'
import { conjoin, conjoiner }      from '.'

const numbers = [1, 2, 3, 4]
const strings = ['foo', 'bar', 'baz', 'quux']

const numberFn = (it: number, _index: number) => it ** 2
const stringFn = (it: string, _index: number) => it.toUpperCase()

const numberJoin1 = conjoiner({ map: numberFn })
const numberJoin2 = conjoiner({ $map: numberFn })

const stringJoin1 = conjoiner({ map: stringFn })
const stringJoin2 = conjoiner({ $map: stringFn })

// pass

expectType<string>(numberJoin1(numbers))
expectType<string>(numberJoin2(numbers))

expectType<string>(stringJoin1(strings))
expectType<string>(stringJoin2(strings))

expectType<string>(numberJoin1(strings, { map: stringFn }))
expectType<string>(numberJoin1(strings, { $map: stringFn }))
expectType<string>(numberJoin2(strings, { $map: stringFn }))

expectType<string>(stringJoin1(numbers, { map: numberFn }))
expectType<string>(stringJoin1(numbers, { $map: numberFn }))
expectType<string>(stringJoin2(numbers, { $map: numberFn }))

expectType<string>(numberJoin1(strings, { map: stringFn }))
expectType<string>(numberJoin1(strings, { $map: stringFn }))
expectType<string>(numberJoin2(strings, { $map: stringFn }))

expectType<string>(stringJoin1(numbers, { map: numberFn }))
expectType<string>(stringJoin1(numbers, { $map: numberFn }))
expectType<string>(stringJoin2(numbers, { $map: numberFn }))

// fail

/*
 * XXX these errors throw off tsc and cause the last two tests in this file to
 * appear valid (in $EDITOR), though the tsd tests pass/fail as expected
 */
expectError(conjoiner({ $map: numberFn, map: numberFn }))
expectError(conjoiner({ $map: numberFn, map: stringFn }))
expectError(conjoiner({ $map: stringFn, map: numberFn }))
expectError(conjoiner({ $map: stringFn, map: stringFn }))

expectError(numberJoin1(strings))
expectError(numberJoin1(strings, { map: numberFn }))
expectError(numberJoin1(numbers, { map: stringFn }))
expectError(numberJoin1(numbers, { $map: stringFn }))
expectError(numberJoin1(strings, { $map: numberFn }))
expectError(numberJoin1(numbers, { $map: numberFn, map: numberFn }))
expectError(numberJoin1(numbers, { $map: stringFn, map: stringFn }))

expectError(numberJoin2(strings))
expectError(numberJoin2(strings, { map: numberFn }))
expectError(numberJoin2(numbers, { map: stringFn }))
expectError(numberJoin2(numbers, { $map: stringFn }))
expectError(numberJoin2(strings, { $map: numberFn }))
expectError(numberJoin2(numbers, { $map: numberFn, map: numberFn }))
expectError(numberJoin2(numbers, { $map: stringFn, map: stringFn }))

expectError(stringJoin1(numbers))
expectError(stringJoin1(numbers, { map: stringFn }))
expectError(stringJoin1(strings, { map: numberFn }))
expectError(stringJoin1(strings, { $map: numberFn }))
expectError(stringJoin1(numbers, { $map: stringFn }))
expectError(stringJoin1(strings, { $map: stringFn, map: stringFn }))
expectError(stringJoin1(strings, { $map: numberFn, map: numberFn }))

expectError(stringJoin2(numbers))
expectError(stringJoin2(numbers, { map: stringFn }))
expectError(stringJoin2(strings, { map: numberFn }))
expectError(stringJoin2(strings, { $map: numberFn }))
expectError(stringJoin2(numbers, { $map: stringFn }))
expectError(stringJoin2(strings, { $map: stringFn, map: stringFn }))
expectError(stringJoin2(strings, { $map: numberFn, map: numberFn }))
