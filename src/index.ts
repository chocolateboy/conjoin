type Options = {
    last?: string;
    pair?: string;
    serial?: string;
    with?: string;
};

function _conjoin<T> (
    iterable: Iterable<T>,
    sep: string,
    pairSep: string,
    lastSep: string
): string {
    let array: Array<T>, mutable, last

    if (Array.isArray(iterable)) {
        array = iterable
    } else {
        array = Array.from(iterable)
        mutable = true
    }

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
                last = array.pop()
                return array.join(sep) + lastSep + last
            } else {
                return array.slice(0, -1).join(sep) + lastSep + array[length - 1]
            }
    }
}

export function conjoin<T> (
    iterable: Iterable<T>,
    { with: sep = ', ', last = sep, pair = last, serial }: Options = {}
) {
    if (serial != null) {
        [pair, last] = [serial, ',' + serial]
    }

    return _conjoin(iterable, sep, '' + pair, last)
}

export function conjoiner (
    { with: sep = ', ', last = sep, pair = last, serial }: Options = {}
) {
    if (serial != null) {
        [pair, last] = [serial, ',' + serial]
    }

    pair = '' + pair

    return function conjoin<T> (iterable: Iterable<T>) {
        return _conjoin(iterable, sep, pair, last)
    }
}

export { conjoin as join, conjoiner as joiner }
