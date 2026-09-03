'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Inbox,
  Save,
  Loader2,
  Mail,
  ExternalLink,
  Building2,
  DollarSign,
  Tag,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type InquiryStatus = 'New' | 'Read' | 'Replied' | 'Archived'

type Inquiry = {
  id: string
  name: string
  email: string
  company: string | null
  offerAmount: number | null
  intendedUse: string | null
  message: string
  status: InquiryStatus
  adminNotes: string
  domainName: string | null
  domainSlug: string | null
  createdAt: string
}

const STATUSES: InquiryStatus[] = ['New', 'Read', 'Replied', 'Archived']

function statusBadge(s: InquiryStatus) {
  const map: Record<InquiryStatus, string> = {
    New: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Read: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Replied: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Archived: 'bg-muted text-muted-foreground border-border',
  }
  return map[s]
}

export function InquiriesList({
  inquiries,
  total,
  page,
  limit,
  filters,
  backend,
}: {
  inquiries: Inquiry[]
  total: number
  page: number
  limit: number
  filters: { status: string }
  backend: 'redis' | 'prisma'
}) {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()
  const [, startTransition] = useTransition()

  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [draftStatus, setDraftStatus] = useState<Record<string, InquiryStatus>>({})
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({})

  function applyStatusFilter(status: string) {
    const sp = new URLSearchParams(params.toString())
    if (status && status !== 'all') sp.set('status', status)
    else sp.delete('status')
    sp.delete('page')
    startTransition(() => router.push(`/admin/inquiries?${sp.toString()}`))
  }

  function getStatus(i: Inquiry): InquiryStatus {
    return draftStatus[i.id] ?? i.status
  }
  function getNotes(i: Inquiry): string {
    return draftNotes[i.id] ?? i.adminNotes
  }
  function isDirty(i: Inquiry): boolean {
    const sDirty = draftStatus[i.id] !== undefined && draftStatus[i.id] !== i.status
    const nDirty = draftNotes[i.id] !== undefined && draftNotes[i.id] !== i.adminNotes
    return sDirty || nDirty
  }

  async function save(i: Inquiry) {
    const patch: Record<string, unknown> = {}
    const s = draftStatus[i.id]
    const n = draftNotes[i.id]
    if (s !== undefined && s !== i.status) patch.status = s
    if (n !== undefined && n !== i.adminNotes) patch.adminNotes = n
    if (Object.keys(patch).length === 0) return

    setSaving((p) => ({ ...p, [i.id]: true }))
    try {
      const res = await fetch(`/api/admin/inquiries/${i.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast({
          variant: 'destructive',
          title: 'Save failed',
          description: data.error ?? 'Unknown error',
        })
        return
      }
      toast({ title: 'Saved', description: `Inquiry from ${i.name} updated.` })
      setDraftStatus((p) => {
        const n = { ...p }
        delete n[i.id]
        return n
      })
      setDraftNotes((p) => {
        const n = { ...p }
        delete n[i.id]
        return n
      })
      router.refresh()
    } catch {
      toast({ variant: 'destructive', title: 'Save failed', description: 'Network error.' })
    } finally {
      setSaving((p) => ({ ...p, [i.id]: false }))
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={filters.status || 'all'}
            onValueChange={applyStatusFilter}
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
          <div className="text-xs text-muted-foreground hidden sm:block">
            Backend: <Badge variant="outline" className="font-mono text-[10px]">{backend}</Badge>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Showing {inquiries.length} of {total} · page {page} of {totalPages}
        </div>
      </div>

      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center text-center text-sm text-muted-foreground">
            <Inbox className="h-8 w-8 mb-3 opacity-50" />
            No inquiries yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {inquiries.map((i) => {
            const dirty = isDirty(i)
            const isSaving = !!saving[i.id]
            return (
              <Card key={i.id} className={cn(dirty && 'border-amber-500/40')}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                        <span>{i.name}</span>
                        <Badge variant="outline" className={cn('font-normal', statusBadge(getStatus(i)))}>
                          {getStatus(i)}
                        </Badge>
                        {dirty && <span className="text-amber-500 text-xs">●</span>}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                          <Mail className="h-3 w-3" />
                          {i.email}
                        </a>
                        {i.company && (
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {i.company}
                          </span>
                        )}
                        {i.offerAmount != null && (
                          <span className="inline-flex items-center gap-1 text-emerald-500">
                            <DollarSign className="h-3 w-3" />
                            {i.offerAmount.toLocaleString()}
                          </span>
                        )}
                        {i.intendedUse && (
                          <span className="inline-flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {i.intendedUse}
                          </span>
                        )}
                        {i.domainName && i.domainSlug && (
                          <a
                            href={`/d/${i.domainSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-foreground"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {i.domainName}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(i.createdAt).toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-md bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                    {i.message}
                  </div>

                  <div className="grid gap-3 md:grid-cols-[200px_1fr_auto]">
                    <Select
                      value={getStatus(i)}
                      onValueChange={(v) =>
                        setDraftStatus((p) => ({ ...p, [i.id]: v as InquiryStatus }))
                      }
                      disabled={isSaving}
                    >
                      <SelectTrigger className="h-9">
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

                    <Textarea
                      placeholder="Admin notes (private)…"
                      value={getNotes(i)}
                      onChange={(e) =>
                        setDraftNotes((p) => ({ ...p, [i.id]: e.target.value }))
                      }
                      disabled={isSaving}
                      className="min-h-9 h-9 resize-none"
                      rows={1}
                    />

                    <Button
                      onClick={() => save(i)}
                      disabled={!dirty || isSaving}
                      variant={dirty ? 'default' : 'outline'}
                      size="sm"
                      className={cn(!dirty && 'opacity-50')}
                    >
                      {isSaving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      <span className="ml-1">Save</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              const sp = new URLSearchParams(params.toString())
              sp.set('page', String(page - 1))
              router.push(`/admin/inquiries?${sp.toString()}`)
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
              router.push(`/admin/inquiries?${sp.toString()}`)
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}