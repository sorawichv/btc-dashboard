import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192x192.png', 'icon-512x512.png'],
      manifest: {
        name: 'BTC Portfolio Dashboard',
        short_name: 'BTC Port',
        description: 'ติดตามพอร์ตและเป้าหมาย Bitcoin ของคุณ',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        start_url: '/',      // <-- สำคัญมากสำหรับ PC
        id: '/',             // <-- สำคัญสำหรับ Chrome ยุคใหม่
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable' // <-- ต้องมีเพื่อให้ระบบรู้ว่ารองรับทุกหน้าจอ
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
