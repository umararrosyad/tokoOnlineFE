/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

import router from '@/router'
import pinia from '@/stores'
// Plugins
import vuetify from './vuetify'
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

export function registerPlugins (app) {
  pinia.use(piniaPluginPersistedstate);
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
}
