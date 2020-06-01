export type Options<T> = {
    last?: string;
    map?: Mapper<T>;
    pair?: string;
    serial?: string;
    with?: string;
};

export type Mapper<T> = (value: T, index: number) => any;

const { isArray, from: arrayFrom } = Array

function _conjoin<T> (
    array: Array<T>,
    sep: string,
    pairSep: string,
    lastSep: string,
    mutable: boolean,
): string {
    const length = array.length

    switch (length) {
        case 0:
            return ''

        case 1:
            // in my tests (Node.js v14), concatenation is about 20% faster than
            // coercion via String(...). it also minifies better
            return '' + array[0]

        case 2:
            return array[0] + pairSep + array[1]

        default:
            if (mutable) {
                const last = array.pop()
                return array.join(sep) + lastSep + last
            } else {
                return array.slice(0, -1).join(sep) + lastSep + array[length - 1]
            }
    }
}

export function conjoin<T> (
    iterable: Iterable<T>,
    {
        with: sep = ', ',
        last = sep,
        pair = last,
        serial,
        map
    }: Options<T> = {}
): string {
    if (serial != null) {
        pair = serial
        last = ',' + serial
    }

    let array, mutable = true

    if (map) {
        array = arrayFrom(iterable, map)
    } else if (isArray(iterable)) {
        array = iterable
        mutable = false
    } else {
        array = arrayFrom(iterable)
    }

    return _conjoin(array, sep, '' + pair, last, mutable)
}

export function conjoiner<T> (
    {
        with: sep = ', ',
        last = sep,
        pair = last,
        serial,
        map
    }: Options<T> = {}
) {
    if (serial != null) {
        pair = serial
        last = ',' + serial
    }

    pair = '' + pair

    if (map) {
        return function conjoin (iterable: Iterable<T>) {
            return _conjoin(arrayFrom(iterable, map), sep, pair, last, true)
        }
    }

    return function conjoin (iterable: Iterable<T>) {
        const [array, mutable] = isArray(iterable)
            ? [iterable, false]
            : [arrayFrom(iterable), true]

        return _conjoin(array, sep, pair, last, mutable)
    }
}

export { conjoin as join, conjoiner as joiner }
