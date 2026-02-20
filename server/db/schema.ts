import { pgTable, varchar } from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: varchar('id', { length: 255 }).primaryKey(),
})
