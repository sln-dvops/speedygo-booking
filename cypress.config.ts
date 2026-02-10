import { defineConfig } from "cypress"
import * as dotenv from "dotenv"
import * as fs from "fs"
import * as path from "path"

// Load environment variables from .env.local if it exists
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`)
  dotenv.config({ path: envPath })
} else {
  console.log("No .env.local file found, using process.env")
  dotenv.config()
}

// Get the base URL from environment variables or use the fallback
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://9d86-23-27-185-189.ngrok-free.app"
console.log(`Using base URL: ${baseUrl}`)

export default defineConfig({
  e2e: {
    baseUrl,
    setupNodeEvents(on, config) {
      // Add the BASE_URL to Cypress.env
      config.env = config.env || {}
      config.env.BASE_URL = baseUrl

      // Log environment setup
      console.log("Cypress environment configuration:", config.env)

      return config
    },
    viewportWidth: 1280,
    viewportHeight: 1280,
    defaultCommandTimeout: 15000, // Increased timeout for slower networks
    pageLoadTimeout: 120000,
    // Retry failed tests
    retries: {
      runMode: 0,
      openMode: 0,
    },
    // Add experimental features for better stability
    experimentalRunAllSpecs: true,
    // Enable cross-origin testing
    chromeWebSecurity: false,
  },
})

