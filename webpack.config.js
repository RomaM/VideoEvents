const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    // filename: '[name].bundle.js',
    filename: '[name].js',
    publicPath: 'dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: path.resolve(__dirname, 'node_modules/'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          // process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'style-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {sourceMap: true}
          },
          {
            loader: 'sass-loader',
            options: {sourceMap: true}
          }
        ]
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ],
  devServer: {
    overlay: true
  }
};
