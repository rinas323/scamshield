'use client'
import { useActionState } from 'react'
import { createCategory } from '@/actions/admin'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CreateCategoryForm() {
  const [state, action, pending] = useActionState(createCategory, undefined)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add category</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="e.g. IT / Software" required maxLength={60} />
          </div>
          <div>
            <Label htmlFor="icon">Icon (emoji)</Label>
            <Input id="icon" name="icon" placeholder="💼" maxLength={10} />
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" name="description" placeholder="Used to group listings." rows={2} maxLength={300} />
          </div>
          {state?.error && (
            <p className="text-sm text-rose-600">{state.error}</p>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? 'Saving…' : 'Save category'}
            </Button>
            {state?.ok && <span className="text-sm text-emerald-700">Saved.</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
