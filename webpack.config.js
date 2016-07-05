var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require("path");

// BASE APP DIR
var root_dir = path.resolve(__dirname, "..");

// CSS LOADERS
var cssLoaders = "style-loader!css-loader!postcss-loader",
  scssLoaders = "style!css!postcss-loader!sass?outputStyle=expanded";

function extractForProduction(loaders) {
    return ExtractTextPlugin.extract("style", loaders.substr(loaders.indexOf("!")));
}

var conf = {
    context: __dirname + "/app",
    entry: "./Main.js",
    output: {
        path: __dirname + "/dist",
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
    }
};

module.exports = conf;
