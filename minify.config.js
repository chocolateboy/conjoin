// custom bili config file to tweak Terser

module.exports = {
    plugins: {
        terser: {
            // don't minify away our function names
            keep_fnames: /conjoin/,
        }
    }
}
