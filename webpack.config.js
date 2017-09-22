const webpack = require('webpack')
const path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: './src/server_entry.js',
    output: {
        path: path.resolve(__dirname, 'static'),
        filename: 'db_server.bundle.js'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'node_modules/firebase-admin')
                ],
                use: {
                    loader: 'babel-loader',
                    query: {
                        presets: ['env', 'es2015', 'react']
                    }
                }
            },
            // {
            //     test: /\.json$/,
            //     loader: 'json-loader'
            // }
        ]
    },
    plugins: [
        new UglifyJSPlugin({
            sourceMap: true
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    ],
    target: 'node'
}