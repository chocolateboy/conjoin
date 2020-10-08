export type Joinable<T> = ArrayLike<T> | Iterable<T>;
export type Mapper<T> = (value: T, index: number) => any;
export type Wrappable<T> = (value: T) => any;

export type Options<T> = {
    last?: string;
    map?: Mapper<T>;
    pair?: string;
    serial?: string | boolean;
    with?: string;
    $map?: Wrappable<T>;
};

const $Array = Array

const $conjoin = function conjoin<T> (values: Joinable<T>, options: Options<T> = {}) {
    let {
        with: sep = ', ',
        last = ' and ',
        map: _map,
        pair = last,
        serial = false,
        $map
    } = options

    let $last, mutable

    const map: Mapper<T> | undefined = $map
        ? ((value: T) => $map!(value)) // [1]
        : _map

    // [1] XXX "Cannot invoke an object which is possibly 'undefined'."
    // expanding the ternary into an if/else statement doesn't help

    const array: Array<T> = (mutable = (map || !$Array.isArray(values)))
        ? $Array.from(values, map!) // [2]
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

const $conjoiner = function conjoiner<U> ($options: Options<U> = {}) {
    function conjoin<U> (values: Joinable<U>): string
    function conjoin<T> (values: Joinable<T>, options: Options<T>): string
    function conjoin (values: Joinable<any>, _options?: Options<any>) {
        return $conjoin(values, _options ? Object.assign({}, $options, _options) : $options)
    }

    return conjoin
}

export {
    $conjoin as conjoin,
    $conjoin as join,
    $conjoiner as conjoiner,
    $conjoiner as joiner
}
