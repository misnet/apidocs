import path from 'path';

export default {
  //"hash":true,
  "entry": "src/index.js",
  "outputPath":path.resolve(__dirname, '../asset'),
  "publicPath":"./",
  "output":{
    "crossOriginLoading":"anonymous"
  },
  "extraBabelPlugins": [
      "transform-runtime",
      "transform-decorators-legacy",
      "transform-class-properties",
      ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": true }]
    ],
  "env": {
    "development": {
      "extraBabelPlugins": [
        "dva-hmr",
        "transform-runtime"
      ]
    },
    "production": {
      "extraBabelPlugins": [
        "transform-runtime"
      ]
    }
  }
}
