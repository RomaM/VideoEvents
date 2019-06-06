const path = require('path');

const config = {
  entry: ['whatwg-fetch', './src/index.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'velib.js',
    library: 'VELib',
    libraryTarget: 'umd',
    publicPath: 'dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: path.resolve(__dirname, 'node_modules/'),
        use: ['babel-loader']
      },
    ]
  },
  plugins: [],
  devServer: {
    overlay: true
  }
};

module.exports = config;