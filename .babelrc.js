const env = process.env.NODE_ENV;
let plugins = [];
let presets = [
  [
    "@babel/preset-env",
    {
      // false 不使用任何的polyfill
      // 以下的两个值可能会发生冲突(加入第三方库如果实现了关于polyfill相关的东西，你再实现会有冲突的问题)，解决：在babel-loader中加入exclude属性
      // usage 根据源代码需要哪些polyfil就引入相关的api
      // entry 只要是浏览器需要的polyfill都引入(不是根据源代码应用哪polyfill)
      "useBuiltIns": "usage", // false "usage" "entry"
      "corejs": "3", // useBuiltIns为usage时需要声明core-js的版本为3
    }
  ],
  "@babel/preset-react",
]
if (env === 'development') plugins = [...plugins, "react-refresh/babel"];
if (env === 'test') presets = [...presets, "@babel/preset-typescript"];

module.exports = {
  presets,
  plugins,
}