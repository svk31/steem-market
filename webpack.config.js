var ExtractTextPlugin = require("extract-text-webpack-plugin");

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
                loaders: ["babel-loader"]
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
