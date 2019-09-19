const fs = require('fs');
const path = require('path');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: path.join(__dirname, 'src', 'component-manager.ts'),
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'component-manager.js'
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          },
          { loader: 'sass-loader' }
        ]
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: { }
          }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: false }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
        loader: 'url-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.scss', '.css', '.html', '.svg', '.png', '.jpeg', '.jpg', '.gif'],
    alias: {
      handlebars: 'handlebars/dist/handlebars.js'
    }
  },
  plugins: [
    new CompressionWebpackPlugin({
      filename: (info) => {
        return info.path.replace(/.gz$/, '')
      }
    })
  ]
};