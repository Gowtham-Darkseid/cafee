import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import { sendReservationConfirmationMail } from './server/reservation-mailer.js'

function readJson(req) {
  return new Promise((resolveBody, reject) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      if (!body) {
        resolveBody({})
        return
      }

      try {
        resolveBody(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON payload.'))
      }
    })

    req.on('error', reject)
  })
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      {
        name: 'local-reservation-mail-api',
        apply: 'serve',
        configureServer(server) {
          server.middlewares.use('/api/send-reservation-email', async (req, res) => {
            if (req.method === 'OPTIONS') {
              res.statusCode = 200
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
              res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
              res.end(JSON.stringify({ ok: true }))
              return
            }

            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, message: 'Method not allowed' }))
              return
            }

            try {
              const payload = await readJson(req)
              const result = await sendReservationConfirmationMail({
                mailUser: env.MAIL_USER || process.env.MAIL_USER,
                mailAppPassword: env.MAIL_APP_PASSWORD || process.env.MAIL_APP_PASSWORD,
                payload
              })

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, message: 'Reservation mail sent.', ...result }))
            } catch (error) {
              res.statusCode = error.statusCode || 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, message: error.message || 'Unable to send reservation mail.' }))
            }
          })
        }
      }
    ],
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
  }
})
