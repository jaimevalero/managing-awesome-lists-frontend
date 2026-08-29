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
    },
    // Nitro vigila public/ en dev. Ahi viven ~50.000 json generados por el backend, que
    // agotan el limite de inotify del sistema (ENOSPC) y no se editan a mano nunca
    watchOptions: {
      ignored: ['**/dist/**', '**/public/topic/**', '**/public/related/**', '**/public/awesome/**']
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
    server: {
      watch: {
        // public/topic y public/related son ~50.000 ficheros de datos generados por el
        // backend. Vigilarlos en dev agota el limite de inotify del sistema (ENOSPC) y
        // no sirve de nada: no se editan a mano, se regeneran con la pasada del backend
        ignored: ['**/dist/**', '**/public/topic/**', '**/public/related/**', '**/public/awesome/**'],
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
