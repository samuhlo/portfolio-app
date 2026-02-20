import { z } from 'zod'

export const projectSchema = z.object({
  id: z.string(),
})
