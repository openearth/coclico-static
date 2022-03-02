const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  chainWebpack: config => {
    config.module.rules.delete('svg')
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.svg$/,
          loader: 'vue-html-loader'
        },
        {
          test: /\.md$/,
          use: [
            {
              loader: 'vue-html-loader'
            },
            {
              loader: 'markdown-loader',
              options: {
                pedantic: true,
              }
            }
          ]
        }
      ]
    }
  }

})
