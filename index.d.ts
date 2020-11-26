export type Joinable<T> = Array<T> | ArrayLike<T> | Iterable<T>;
export type Mapper<T> = (value: T, index: number) => any;
export type Wrappable<T> = (value: T, ...rest: any[]) => any;

export type BaseOptions = {
    last?: string;
    pair?: string;
    serial?: string | boolean;
    with?: string;
};

export type OptionsWithDollarMap<T> = BaseOptions & { $map: Wrappable<T> };
export type OptionsWithMap<T> = BaseOptions & { map: Mapper<T> };
export type Options<T> = OptionsWithDollarMap<T> | OptionsWithMap<T> | BaseOptions;

export interface BaseConjoin<T> {
    (values: Joinable<T>, options: BaseOptions): string;
    (values: Joinable<T>): string;
}

// disallow +map+ when +$map+ is defined
export interface ConjoinWithDollarMap<T> extends BaseConjoin<T> {
    <U>(values: Joinable<U>, options: OptionsWithDollarMap<U>): string;
}

export interface Conjoin<T = any> extends BaseConjoin<T> {
    <U>(values: Joinable<U>, options: OptionsWithDollarMap<U>): string;
    <U>(values: Joinable<U>, options: OptionsWithMap<U>): string;
}

export interface Conjoiner {
    <T>(options: OptionsWithDollarMap<T>): ConjoinWithDollarMap<T>;
    <T>(options: OptionsWithMap<T>): Conjoin<T>;
    (options: BaseOptions): Conjoin;
    (): Conjoin;
}

declare const conjoin: Conjoin;
declare const conjoiner: Conjoiner;

export {
    conjoin,
    conjoin as join,
    conjoiner,
    conjoiner as joiner,
};
