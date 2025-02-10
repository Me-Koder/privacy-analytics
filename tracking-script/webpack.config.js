// tracking-script/webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/script.js',
  output: {
    filename: 'analytics.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: true,
  },
};