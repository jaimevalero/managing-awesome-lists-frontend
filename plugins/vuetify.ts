// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
export const staticPrimaryColor = '#8C57FF'

const myCustomLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    'primary': staticPrimaryColor,
    'on-primary': '#fff',
    'primary-darken-1': '#7E4EE6',
    'secondary': '#8A8D93',
    'secondary-darken-1': '#7C7F84',
    'on-secondary': '#fff',
    'success': '#56CA00',
    'success-darken-1': '#4DB600',
    'on-success': '#fff',
    'info': '#16B1FF',
    'info-darken-1': '#149FE6',
    'on-info': '#fff',
    'warning': '#FFB400',
    'warning-darken-1': '#E6A200',
    'on-warning': '#fff',
    'error': '#FF4C51',
    'error-darken-1': '#E64449',
    'on-error': '#fff',
    'background': '#f4f5fa',
    'on-background': '#2E263D',
    'surface': '#fff',
    'on-surface': '#2E263D',
    'grey-50': '#FAFAFA',
    'grey-100': '#F5F5F5',
    'grey-200': '#EEEEEE',
    'grey-300': '#E0E0E0',
    'grey-400': '#BDBDBD',
    'grey-500': '#9E9E9E',
    'grey-600': '#757575',
    'grey-700': '#616161',
    'grey-800': '#424242',
    'grey-900': '#212121',
    'perfect-scrollbar-thumb': '#dbdade',
    'skin-bordered-background': '#fff',
    'skin-bordered-surface': '#fff',
    'expansion-panel-text-custom-bg': '#fafafa',
    'track-bg': '#F0F2F8',
    'chat-bg': '#F7F6FA',
  },
}

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'myCustomLightTheme',
      themes: {
        myCustomLightTheme,
      },
    },
  })
  app.vueApp.use(vuetify)
})
