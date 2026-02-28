import { z } from 'zod/v4'

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
})

function getEnv() {
  const result = envSchema.safeParse(import.meta.env)
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format())
    throw new Error('Invalid environment variables')
  }
  return result.data
}

export const env = getEnv()
