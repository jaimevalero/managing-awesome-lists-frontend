import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
	  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'robots', content: 'index, follow' }
      ]
    }
  },
	  nitro: {
    storage: {
      data: {
        driver: 'vercelKV'
        /* Vercel KV driver options */
      }
    }
  },
  devtools: { enabled: true },
  css: [  '~/assets/styles.css' ],
  buildModules: [
    '@nuxtjs/fontawesome',
  ],
  modules: [
    '@nuxt/ui',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  fontawesome: {
    component: 'fa',
    icons: {
      solid: true,
      brands: true
    }
  }
})
