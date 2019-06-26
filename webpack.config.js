var path = require('path')

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var webpackConfig = {
  entry: {
    src: './src/scatter-plot.js',
  },
  output: {
    filename: "scatter-plot.js",
    path: path.join(__dirname, "dist"),
    library: "[name]",
    libraryTarget: "umd"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  plugins: [
    new UglifyJSPlugin()
  ],
  module: {
    loaders: [
      { test: /\.js$/, loader: "babel-loader" },
      { test: /\.css$/, loader: [ 'to-string-loader', 'css-loader' ] }
    ]
  },
  stats: {
    warningsFilter: /export.*scatterplot.*was not found/
  },
  watch: true,
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    https: true,
  }
}

module.exports = webpackConfig
