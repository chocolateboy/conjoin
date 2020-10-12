type Joinable<T> = ArrayLike<T> | Iterable<T>;
type Mapper<T> = (value: T, index: number) => any;
type Wrappable<T> = (value: T) => any;
type BaseOptions = {
    last?: string;
    pair?: string;
    serial?: string | boolean;
    with?: string;
};

type OptionsWithMap<T> = BaseOptions & { map: Mapper<T> };
type OptionsWith$Map<T> = BaseOptions & { $map: Wrappable<T> } & { map?: Mapper<T> };

interface Conjoin<T = any> {
    <U>(values: Joinable<U>, options: OptionsWith$Map<U>): string;
    <U>(values: Joinable<U>, options: OptionsWithMap<U>): string;
    (values: Joinable<T>, options: BaseOptions): string;
    (values: Joinable<T>): string;
}

interface ConjoinWith$Map<T> {
    <U>(values: Joinable<U>, options: OptionsWith$Map<U>): string;
    <T>(values: Joinable<T>, options: OptionsWithMap<T>): string;
    (values: Joinable<T>, options: BaseOptions): string;
    (values: Joinable<T>): string;
}

interface Conjoiner {
    <T>(options: OptionsWith$Map<T>): ConjoinWith$Map<T>;
    <T>(options: OptionsWithMap<T>): Conjoin<T>;
    (options: BaseOptions): Conjoin;
    (): Conjoin;
}

declare const conjoin: Conjoin;
declare const conjoiner: Conjoiner;

export {
    Conjoiner,
    Conjoin,
    conjoin,
    conjoin as join,
    conjoiner,
    conjoiner as joiner,
};
