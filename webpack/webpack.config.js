var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require("path");
var webpack = require("webpack");

// BASE APP DIR
var root_dir = path.resolve(__dirname, "..");

// CSS LOADERS
var cssLoaders = "style-loader!css-loader!postcss-loader",
  scssLoaders = "style!css!postcss-loader!sass?outputStyle=expanded";

function extractForProduction(loaders) {
    return ExtractTextPlugin.extract("style", loaders.substr(loaders.indexOf("!")));
}

module.exports = function(options) {
    var plugins = [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurrenceOrderPlugin()
    ];

    if (options.prod) {
        plugins.push(new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: true,
            compress: {
                warnings: true
            },
            output: {
                screw_ie8: true
            }
        }));

        plugins.push(new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify('production')}}));
    }

    var config = {
        context: root_dir + "/app",
        entry: "./Main.js",
        output: {
            path: root_dir + "/dist",
            filename: "app.js"
        },
        module: {
                loaders: [
                {
                    test: /\.jsx$/,
                    loaders: ["babel-loader"],
                    exclude: [/node_modules/]
                },
                {
                    test: /\.js$/,
                    exclude: [/node_modules/],
                    loader: "babel-loader",
                    query: {compact: false, cacheDirectory: true}
                },
                { test: /\.css$/, loader: cssLoaders },
                {
                    test: /\.scss$/,
                    loader: scssLoaders
                }
            ]
        },
        plugins: plugins
    };

    return config;

}
