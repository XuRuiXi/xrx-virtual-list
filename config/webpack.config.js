const { merge } = require('webpack-merge');
const baseConfig = require('./base.config');

const env = process.env.NODE_ENV;
let config = '';

if (env === 'production') {
  config = require('./prod.config');
} else if (env === 'development') {
  config = require('./dev.config');
}

module.exports = merge(baseConfig, config);