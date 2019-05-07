const path = require('path');

const webpack = require("webpack");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = env => {


    function isProd() {
        return env.NODE_ENV == 'production';
    }

    function isDev() {
        return !isProd();
    }

    let entry;

    if (isDev()) {
        entry = {
            'jquery.cardslider': './src/js/jquery.cardslider.js',
        };
    } else {
        entry = {
            'jquery.cardslider': './src/js/jquery.cardslider.js',
            'jquery.cardslider.min': './src/js/jquery.cardslider.js',
        };
    }

    let config = {
        mode: env.NODE_ENV,
        entry,
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist/js')
        },
        module: {
            rules: [{
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }]
        }
    };


    if (isDev() ) {
        config.optimization = {
            minimize: true,
            minimizer: [
                new UglifyJsPlugin({
                    include: /\.min\.js$/
                })
            ]
        };

        config.watch = true;
    } else {

    }


    return config;

};