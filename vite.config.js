import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        menu: resolve(__dirname, 'menu.html'),
        locate: resolve(__dirname, 'locate.html'),
        reserve: resolve(__dirname, 'reserve.html'),
        shop: resolve(__dirname, 'shop.html')
      }
    }
  }
})
