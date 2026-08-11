import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
// basic-ssl serves dev over HTTPS (self-signed cert) — required for iOS to
// show the DeviceOrientation permission prompt when testing on a phone.
export default defineConfig({
  plugins: [react(), basicSsl()],
})
