import {
    Joinable,
    Mapper,
    Options,
    OptionsWithDollarMap,
    OptionsWithMap
} from '../index.d'

type InternalOptions<T> = Partial<OptionsWithDollarMap<T> & OptionsWithMap<T>>;

const { from: arrayFrom, isArray } = Array

const conjoin = <T>(values: Joinable<T>, options: InternalOptions<T> = {}) => {
    let {
        with: sep = ', ',
        last = ' and ',
        map: _map,
        pair = last,
        serial = false,
        $map
    } = options

    let $last: T | undefined, mutable: boolean

    const map: Mapper<T> | undefined = $map
        ? (value: T) => $map!(value) // [1]
        : _map

    // [1] XXX "Cannot invoke an object which is possibly 'undefined'."
    // expanding the ternary into an if/else statement doesn't help

    const array: Array<T> = (mutable = (map || !isArray(values)) as boolean)
        ? arrayFrom(values, map!) // [2]
        : values as Array<T>

    // [2] XXX TypeScript doesn't grok that Array.from's second argument can be
    // undefined

    const length = array.length

    if (serial !== false) {
        if (serial === true) {
            serial = last
        }

        pair = serial
        last = ',' + serial
    }

    switch (length) {
        case 0:
            return ''

        case 1:
            return '' + array[0]

        case 2:
            return '' + array[0] + pair + array[1]

        default:
            if (mutable) {
                $last = array.pop()
                return array.join(sep) + last + $last
            } else {
                return array.slice(0, -1).join(sep) + last + array[length - 1]
            }
    }
}

// the types here are just placeholders: the full/correct types are in the
// declaration file
const conjoiner = ($options: Options<unknown> = {}) => {
    return (values: Joinable<unknown>, _options?: Options<unknown>) => {
        return conjoin(values, _options ? Object.assign({}, $options, _options) : $options)
    }
}

export { conjoin, conjoiner, conjoin as join, conjoiner as joiner }
