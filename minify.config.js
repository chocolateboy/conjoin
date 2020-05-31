// a config file for bili [1]. currently used to configure Terser to avoid
// mangling the names of the exported functions (conjoin and conjoiner)
//
// note: the name of this file needs to NOT be bili.config.js, or similar, to
// avoid bili using it by default
//
// [1] https://github.com/egoist/bili
module.exports = {
    plugins: {
        terser: {
            // placing this here rather than under mangle preserves the name of
            // the function returned by conjoiner
            keep_fnames: /^conjoin(er)?$/
        }
    }
}
