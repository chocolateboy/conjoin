module.exports = {
    env: {
        development: {
            sourceMaps: true,
            plugins: ['source-map-support'],
        },

        compat: {
            presets: [
                ['@babel/preset-env', {
                    // set this to true to see the applied transforms and bundled polyfills
                    debug: false,

                    bugfixes: true,

                    // useBuiltIns: 'usage',

                    // browsers which support `Array.from`, which requires the
                    // following for full support (these are the MDN IDs):
                    //
                    //  - javascript.builtins.Array.from
                    //  - javascript.builtins.String.@@iterator
                    //
                    // generated a list for each with
                    // @wessberg/browserslist-generator then merged them
                    // manually, selecting the highest version for each browser
                    // (because the `Array.from` list wasn't working on its own)

                    /*
                     * 'and_chr >= 45',
                     * 'and_ff >= 36',
                     * 'android >= 81',
                     * 'chrome >= 45',
                     * 'edge >= 12',
                     * 'firefox >= 36',
                     * 'ios_saf >= 9.2',
                     * 'opera >= 32',
                     * 'safari >= 9',
                     * 'samsung >= 5.4',
                     */

                    // that didn't work (Babel still adds the Array.from
                    // polyfill, listing almost every browser in that list as
                    // the culprit), so now doing the same merge with the data
                    // from node_modules/@babel/compat-data/data/corejs2-built-ins.json

                    targets: {
                        browsers: [
                            'chrome >= 51',
                            'edge >= 15',
                            'electron >= 1.2',
                            'firefox >= 36',
                            'ios >= 10',
                            'node >= 6.5',
                            'opera >= 38',
                            'safari >= 10',
                            'samsung >= 5',
                        ]
                    }
                }]
            ],
        }
    },

    presets: [
        'bili/babel',
    ],
}
