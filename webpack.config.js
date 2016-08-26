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
            }
        ]
    }
};

module.exports = conf;
