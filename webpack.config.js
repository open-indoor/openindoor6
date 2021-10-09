const path = require("path")
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// App directory
const appDirectory = fs.realpathSync(process.cwd());

// Gets absolute path of file within app directory
const resolveAppPath = relativePath => path.resolve(appDirectory, relativePath);
// Host
const host = process.env.HOST || 'localhost';

// Required for babel-preset-react-app
process.env.NODE_ENV = 'development';

module.exports = {
    entry: path.resolve(__dirname, "src/index.js"),
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js",
        library: "$",
        libraryTarget: "umd",
    },
    module: {
        rules: [{
            test: /\.(js)$/,
            exclude: /node_modules/,
            loader: "babel-loader",
        }, ],
    },
    mode: "development",
    devServer: {
        // Serve index.html as the base
        // contentBase: resolveAppPath('public'),
        client: {
            progress: true,
            logging: 'info',
            overlay: true,

        },
        static: './dist',
        // Enable compression
        compress: true,
        // Enable hot reloading
        hot: true,
        port: 3000,
        // Public path is root of content base
        // publicPath: '/',
    },
    devtool: 'inline-source-map',
    plugins: [
        // Re-generate index.html with injected script tag.
        // The injected script tag contains a src value of the
        // filename output defined above.
        new HtmlWebpackPlugin({
            // inject: true,
            // template: resolveAppPath('public/index.html'),
            title: 'Development',
        }),
    ],
}