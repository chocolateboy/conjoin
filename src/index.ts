export type Joinable = ArrayLike<any> | Iterable<any>;
export type Mapper = (value: any, index: number) => any;

export type Options = {
    last?: string;
    map?: Mapper | boolean;
    pair?: string;
    serial?: string | boolean;
    with?: string;
};

const $Array = Array
const safeJsonStringify = (value: any) => JSON.stringify(value)

const $conjoin = function conjoin (values: Joinable, options: Options = {}) {
    let {
        with: sep = ', ',
        last = ' and ',
        pair = last,
        map: $map,
        serial = false,
    } = options

    let $last, mutable

    const map: Mapper | undefined = $map
        ? ($map === true ? safeJsonStringify : $map)
        : undefined

    // XXX TypeScript doesn't grok that Array.from's second argument can be
    // undefined
    const array: Array<any> = (mutable = (map || !$Array.isArray(values)))
        ? $Array.from(values, map!)
        : values as Array<any>

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
            // in my tests (Node.js v14), concatenation is about 20% faster than
            // coercion via String(...). it also minifies better
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

const $conjoiner = function conjoiner ($options: Options = {}) {
    return function conjoin (values: Joinable, options?: Options) {
        return $conjoin(
            values,
            (options ? Object.assign({}, $options, options) : $options)
        )
    }
}

export {
    $conjoin as conjoin,
    $conjoin as join,
    $conjoiner as conjoiner,
    $conjoiner as joiner
}
