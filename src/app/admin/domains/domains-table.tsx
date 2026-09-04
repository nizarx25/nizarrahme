'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Star, StarOff, Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type Domain = {
  id: string
  name: string
  slug: string
  category: string
  status: string
  featured: boolean
  price: number | null
  showPrice: boolean
  saleType: string
}

const STATUSES = ['Available', 'Negotiating', 'Sold'] as const

export function DomainsTable({
  domains,
  total,
  page,
  limit,
  filters,
  readOnlyMode = false,
}: {
  domains: Domain[]
  total: number
  page: number
  limit: number
  filters: { search: string; status: string; featured: string }
  readOnlyMode?: boolean
}) {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()
  const [, startTransition] = useTransition()

  const [search, setSearch] = useState(filters.search)
  const [editing, setEditing] = useState<Record<string, Partial<Domain>>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [adding, setAdding] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleting, setDeleting] = useState<Record<string, boolean>>({})

  type NewDomainForm = {
    name: string
    category: string
    extension: string
    status: string
    saleType: string
    price: string
    showPrice: boolean
    featured: boolean
    shortDescription: string
  }
  const emptyForm: NewDomainForm = {
    name: '',
    category: 'Brandable',
    extension: '',
    status: 'Available',
    saleType: 'Make an Offer',
    price: '',
    showPrice: false,
    featured: false,
    shortDescription: '',
  }
  const [form, setForm] = useState<NewDomainForm>(emptyForm)

  function resetForm() {
    setForm(emptyForm)
  }

  function applyFilters(next: { search?: string; status?: string; featured?: string }) {
    const sp = new URLSearchParams(params.toString())
    if (next.search !== undefined) {
      if (next.search) sp.set('search', next.search)
      else sp.delete('search')
    }
    if (next.status !== undefined) {
      if (next.status) sp.set('status', next.status)
      else sp.delete('status')
    }
    if (next.featured !== undefined) {
      if (next.featured) sp.set('featured', next.featured)
      else sp.delete('featured')
    }
    sp.delete('page')
    startTransition(() => router.push(`/admin/domains?${sp.toString()}`))
  }

  function setField<K extends keyof Domain>(id: string, key: K, value: Domain[K]) {
    setEditing((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }))
  }

  function getValue<K extends keyof Domain>(d: Domain, key: K): Domain[K] | undefined {
    const edit = editing[d.id]
    if (edit && key in edit) return edit[key] as Domain[K]
    return d[key]
  }

  async function save(d: Domain) {
    const patch = editing[d.id]
    if (!patch || Object.keys(patch).length === 0) return
    setSaving((s) => ({ ...s, [d.id]: true }))
    try {
      const res = await fetch(`/api/admin/domains/${d.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast({ variant: 'destructive', title: 'Save failed', description: data.error ?? 'Unknown error' })
        return
      }
      toast({ title: 'Saved', description: `${d.name} updated.` })
      setEditing((prev) => {
        const next = { ...prev }
        delete next[d.id]
        return next
      })
      router.refresh()
    } catch {
      toast({ variant: 'destructive', title: 'Save failed', description: 'Network error.' })
    } finally {
      setSaving((s) => ({ ...s, [d.id]: false }))
    }
  }

  async function createDomain() {
    if (readOnlyMode) return
    const name = form.name.trim()
    if (!name) {
      toast({ variant: 'destructive', title: 'Name is required' })
      return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category: form.category,
          extension: form.extension || undefined,
          status: form.status,
          saleType: form.saleType,
          price: form.price === '' ? null : Number(form.price),
          showPrice: form.showPrice,
          featured: form.featured,
          shortDescription: form.shortDescription,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast({ variant: 'destructive', title: 'Create failed', description: data.error ?? 'Unknown error' })
        return
      }
      toast({ title: 'Domain added', description: `${name} was created.` })
      setCreateOpen(false)
      resetForm()
      router.refresh()
    } catch {
      toast({ variant: 'destructive', title: 'Create failed', description: 'Network error.' })
    } finally {
      setAdding(false)
    }
  }

  async function deleteDomain(d: Domain) {
    if (readOnlyMode) return
    const confirmed = typeof window !== 'undefined'
      ? window.confirm(`Delete ${d.name}? This cannot be undone.`)
      : true
    if (!confirmed) return
    setDeleting((s) => ({ ...s, [d.id]: true }))
    try {
      const res = await fetch(`/api/admin/domains?id=${encodeURIComponent(d.id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast({ variant: 'destructive', title: 'Delete failed', description: data.error ?? 'Unknown error' })
        return
      }
      toast({ title: 'Domain deleted', description: `${d.name} was removed.` })
      router.refresh()
    } catch {
      toast({ variant: 'destructive', title: 'Delete failed', description: 'Network error.' })
    } finally {
      setDeleting((s) => ({ ...s, [d.id]: false }))
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-4">
      {readOnlyMode && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300">
          Read-only snapshot mode: the catalog is coming from the bundled Vercel JSON data. Changes are disabled until a live database is configured.
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form
          className="flex items-center gap-2 flex-1"
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters({ search })
          }}
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or category…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
        </form>

        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => applyFilters({ status: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.featured || 'all'}
          onValueChange={(v) => applyFilters({ featured: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Featured only</SelectItem>
            <SelectItem value="false">Not featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-muted-foreground">
          Showing {domains.length} of {total} domains · page {page} of {totalPages}
        </div>
        <Dialog open={createOpen} onOpenChange={(open) => {
          setCreateOpen(open)
          if (open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={readOnlyMode}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add domain</DialogTitle>
              <DialogDescription>
                Create a new domain entry. Slug is generated automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="d-name">Name</Label>
                <Input
                  id="d-name"
                  placeholder="example.com"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="d-category">Category</Label>
                  <Input
                    id="d-category"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="d-extension">Extension</Label>
                  <Input
                    id="d-extension"
                    placeholder=".com"
                    value={form.extension}
                    onChange={(e) => setForm((f) => ({ ...f, extension: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Sale type</Label>
                  <Input
                    value={form.saleType}
                    onChange={(e) => setForm((f) => ({ ...f, saleType: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5 col-span-2">
                  <Label htmlFor="d-price">Price (USD)</Label>
                  <Input
                    id="d-price"
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Show price</Label>
                  <Select
                    value={form.showPrice ? 'true' : 'false'}
                    onValueChange={(v) => setForm((f) => ({ ...f, showPrice: v === 'true' }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Hide</SelectItem>
                      <SelectItem value="true">Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="d-desc">Short description</Label>
                <Input
                  id="d-desc"
                  value={form.shortDescription}
                  onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="h-4 w-4"
                />
                Mark as featured
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={adding}>
                Cancel
              </Button>
              <Button onClick={createDomain} disabled={adding}>
                {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span className="ml-1">{adding ? 'Creating…' : 'Create'}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price (USD)</TableHead>
              <TableHead>Show price</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.map((d) => {
              const dirty = !!editing[d.id] && Object.keys(editing[d.id]).length > 0
              const isSaving = !!saving[d.id]
              return (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">
                    {d.name}
                    {dirty && <span className="ml-2 text-xs text-amber-500">●</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.category}</TableCell>
                  <TableCell>
                    <Select
                      value={String(getValue(d, 'status'))}
                      onValueChange={(v) => setField(d.id, 'status', v)}
                      disabled={isSaving || readOnlyMode}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      className="h-8 w-24"
                      value={getValue(d, 'price') ?? ''}
                      onChange={(e) => {
                        const v = e.target.value
                        setField(d.id, 'price', v === '' ? null : Number(v))
                      }}
                      disabled={isSaving || readOnlyMode}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={String(getValue(d, 'showPrice'))}
                      onValueChange={(v) => setField(d.id, 'showPrice', v === 'true')}
                      disabled={isSaving || readOnlyMode}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Show</SelectItem>
                        <SelectItem value="false">Hide</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setField(d.id, 'featured', !getValue(d, 'featured'))}
                      disabled={isSaving || readOnlyMode}
                      aria-label="Toggle featured"
                    >
                      {getValue(d, 'featured') ? (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant={dirty ? 'default' : 'outline'}
                        disabled={!dirty || isSaving || readOnlyMode}
                        onClick={() => save(d)}
                        className={cn(!dirty && 'opacity-50')}
                      >
                        {isSaving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        <span className="ml-1">Save</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        disabled={readOnlyMode || !!saving[d.id]}
                        onClick={() => deleteDomain(d)}
                        aria-label={`Delete ${d.name}`}
                      >
                        {deleting[d.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {domains.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-sm text-muted-foreground py-12">
                  No domains match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              const sp = new URLSearchParams(params.toString())
              sp.set('page', String(page - 1))
              router.push(`/admin/domains?${sp.toString()}`)
            }}
          >
            Previous
          </Button>
          <div className="text-xs text-muted-foreground px-2">
            {page} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              const sp = new URLSearchParams(params.toString())
              sp.set('page', String(page + 1))
              router.push(`/admin/domains?${sp.toString()}`)
            }}
          >
            Next
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs">
        <Badge variant="secondary" className="font-normal">
          {total}
        </Badge>
        <span className="text-muted-foreground">total domains</span>
      </div>
    </div>
  )
}