const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    host: 'localhost',
    // port: 5200,   // 省略port，默认启动8080起第一个能用的端口
    compress: true, // 服务器压缩
    open: false, // 自动打开页面
    hot: true, // 热更新(默认开启)
    historyApiFallback: {
      index: '/index.html'
    },
    proxy: {
      '/getHi': {
        target: 'http://localhost:1111',  // 跨域目标主机，自行修改
        ws: true,  // 代理 websockets
        changeOrigin: true,
      },
    }
  },
  plugins: [
    new ReactRefreshPlugin(),
  ]
};