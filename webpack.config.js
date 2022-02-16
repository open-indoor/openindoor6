// For cache
const path = require("path")
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest')

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// App directory
const appDirectory = fs.realpathSync(process.cwd());

// Gets absolute path of file within app directory
const resolveAppPath = relativePath => path.resolve(appDirectory, relativePath);
// Host
// const host = process.env.HOST || 'localhost';

// Required for babel-preset-react-app
process.env.NODE_ENV = 'development';

module.exports = {
    resolve: {
        alias: {
            "tinyqueue": __dirname + "/node_modules/tinyqueue/tinyqueue.js"
        }
    },
    entry: path.resolve(__dirname, "src/index.js"),
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "openindoor.js",
        library: {
            name: 'openindoor',
            type: 'umd',
            export: 'default',
            umdNamedDefine: true
        },
        // libraryTarget: "umd",
    },
    // output: {
    //     filename: '[name].[chunkhash].js',
    //     path: path.resolve(__dirname, 'dist')
    // },
    // externals: {
    //     react: 'react',
    //     reactDOM: 'react-dom'
    // },

    // module.exports = {
    //...
    externals: {
        'maplibre-gl': 'maplibregl',
    },
    //   };
    module: {

        rules: [{
                test: /\.(js)$/,
                exclude: /node_modules/,
                loader: "babel-loader",
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
                // options: {
                //     modules: {
                //         auto: true,
                //     },
                // },
            },
            // {
            //     test: /\.sc|ass$/,
            //     use: [
            //         { loader: "css-loader" },
            //         { loader: "sass-loader" }
            //     ]
            // },
            // {
            //     test: /\.sc|ass$/,
            //     use: [
            //         { loader: "css-loader" },
            //         { loader: "sass-loader" }
            //     ]
            // },
            // {
            //     test: /\.(ico|gif|png|jpe?g|svg)$/i,
            //     use: [
            //         'file-loader',
            //         { loader: 'image-webpack-loader' },
            //     ],
            // },
        ],
    },

    // mode: env || 'development', // on définit le mode en fonction de la valeur de NODE_ENV
    devServer: {
        client: {
            progress: true,
            logging: 'info',
            overlay: true,

        },
        webSocketServer: false,
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        allowedHosts: [
            'app-dev.openindoor.io',
            'app.openindoor.io',
            'localhost',
        ],
        hot: true,
        port: 3040,
        // headers: {
        //     "Access-Control-Allow-Origin": "*",
        //     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        //     "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        // }
    },
    devtool: 'inline-source-map',
    plugins: [
        // Re-generate index.html with injected script tag.
        // The injected script tag contains a src value of the
        // filename output defined above.
        // new CleanWebpackPlugin('dist/*.*', {}), // supprime tous les fichiers du répertoire dist sans pour autant supprimer ce dossier

        // new HtmlWebpackPlugin({
        //     // inject: true,
        //     // template: resolveAppPath('public/index.html'),
        //     title: 'Development',
        // }),
        // new HtmlWebpackPlugin({
        //     title: 'OpenIndoor',
        //     inject: true,
        //     // hash: true,
        //     template: './public/index.html',
        //     // filename: 'index.html'
        // }),
        // new WorkboxPlugin.GenerateSW({
        //     // these options encourage the ServiceWorkers to get in there fast
        //     // and not allow any straggling "old" SWs to hang around
        //     clientsClaim: true,
        //     skipWaiting: true,
        // }),
        // new WebpackPwaManifest({
        //     filename: "manifest.json",
        //     name: 'OpenIndoor',
        //     short_name: 'OpenIndoor',
        //     description: 'OpenIndoor',
        //     background_color: 'red',
        //     display: 'fullscreen',
        //     crossorigin: 'anonymous', //can be null, use-credentials or anonymous
        //     icons: [{
        //         src: path.resolve('src/assets/icon.png'),
        //         sizes: [96, 128, 192, 256, 384, 512],
        //         destination: '.'
        //     }],
        //     publicPath: ".",
        //     includeDirectory: true
        // })
    ],
}