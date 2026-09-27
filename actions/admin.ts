'use server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/dal'
import { slugify } from '@/lib/slug'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(2, 'Name is required').max(60),
  icon: z.string().max(10).optional(),
  description: z.string().max(300).optional(),
})

export interface CategoryState {
  ok: boolean
  error?: string
}

export async function createCategory(
  _: CategoryState | undefined,
  formData: FormData
) {
  await requireAdmin()
  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    icon: formData.get('icon') || undefined,
    description: formData.get('description') || undefined,
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((e) => e.message).join('; ') }
  }
  try {
    await prisma.category.create({
      data: { ...parsed.data, slug: slugify(parsed.data.name) },
    })
    revalidatePath('/admin/categories')
    revalidatePath('/')
    return { ok: true }
  } catch (err) {
    console.error('createCategory error', err)
    return { ok: false, error: 'Could not create the category.' }
  }
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = formData.get('id')?.toString()
  if (!id) return
  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath('/admin/categories')
    revalidatePath('/')
  } catch (err) {
    console.error('deleteCategory error', err)
  }
}
