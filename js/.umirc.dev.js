// ref: https://umijs.org/config/
/**
 * 请修改define和base、publicPath的相关配置，以适配您的实际环境
 */
export default {
    define:{
        'process.env.APIDOCS_HOST':'http://localhost/mygithub/kuga/docs',
        'process.env.API_HOST':'http://acc.api.kuga.wang/v3/gateway',
    },
    outputPath:'../dist',
    publicPath:'/mygithub/kuga/docs/dist/',
    base:'/mygithub/kuga/docs/dist/',
    treeShaking: true,
    plugins: [
      // ref: https://umijs.org/plugin/umi-plugin-react.html
      ['umi-plugin-react', {
        antd: true,
        dva: true,
        dynamicImport: { webpackChunkName: true },
        title: 'Kuga APIDoc',
        dll: true,
        
        routes: {
          exclude: [
            /models\//,
            /services\//,
            /model\.(t|j)sx?$/,
            /service\.(t|j)sx?$/,
            /components\//,
          ],
        },
      }],
    ],
  }
  