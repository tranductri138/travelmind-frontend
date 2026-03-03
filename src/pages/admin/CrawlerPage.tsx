import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pagination } from '@/components/common/Pagination'
import { TableSkeleton } from '@/components/common/LoadingSkeleton'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/config/query-keys'
import { adminHotelEditPath } from '@/config/routes'
import { formatRelative } from '@/lib/format'
import { Play, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CrawlJob {
  id: string
  url: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  extractReviews: boolean
  hotelId: string | null
  result: Record<string, unknown> | null
  error: string | null
  createdAt: string
  updatedAt: string
}

interface CrawlJobsResponse {
  data: CrawlJob[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

const statusVariant = (status: CrawlJob['status']) => {
  switch (status) {
    case 'COMPLETED':
      return 'default' as const
    case 'RUNNING':
    case 'PENDING':
      return 'secondary' as const
    case 'FAILED':
      return 'destructive' as const
  }
}

export function CrawlerPage() {
  const [url, setUrl] = useState('')
  const [extractReviews, setExtractReviews] = useState(false)
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: jobsData, isLoading } = useQuery<CrawlJobsResponse>({
    queryKey: [...queryKeys.crawler.list, page],
    queryFn: () =>
      apiClient
        .get('/crawler/jobs', { params: { page, limit: 10 } })
        .then((r) => r.data),
  })

  const hasActiveJobs = jobsData?.data.some(
    (j) => j.status === 'PENDING' || j.status === 'RUNNING',
  )

  useEffect(() => {
    if (hasActiveJobs) {
      pollingRef.current = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.crawler.all })
      }, 3000)
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveJobs])

  const triggerMutation = useMutation({
    mutationFn: (body: { url: string; extractReviews: boolean }) =>
      apiClient.post('/crawler/trigger', body),
    onSuccess: () => {
      toast.success('Crawl job started')
      setUrl('')
      queryClient.invalidateQueries({ queryKey: queryKeys.crawler.all })
    },
    onError: () => {
      toast.error('Failed to start crawl job')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    triggerMutation.mutate({ url: url.trim(), extractReviews })
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Data Crawler</h1>

      <Card>
        <CardHeader>
          <CardTitle>Scrape Hotel Data</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Hotel Page URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://www.booking.com/hotel/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="extractReviews"
                checked={extractReviews}
                onCheckedChange={(checked) =>
                  setExtractReviews(checked === true)
                }
              />
              <Label htmlFor="extractReviews" className="cursor-pointer">
                Extract reviews
              </Label>
            </div>
            <Button type="submit" disabled={triggerMutation.isPending || !url.trim()}>
              {triggerMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {triggerMutation.isPending ? 'Starting...' : 'Start Crawl'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crawl Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : !jobsData?.data.length ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No crawl jobs yet. Enter a URL above to get started.
            </p>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobsData.data.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="max-w-xs truncate font-mono text-xs">
                        {job.url}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(job.status)}>
                          {job.status === 'RUNNING' && (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          {job.status}
                        </Badge>
                        {job.error && (
                          <p className="text-xs text-destructive mt-1 max-w-xs truncate">
                            {job.error}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {job.hotelId ? (
                          <Link
                            to={adminHotelEditPath(job.hotelId)}
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            View Hotel
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatRelative(job.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {jobsData?.meta && jobsData.meta.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                page={jobsData.meta.page}
                totalPages={jobsData.meta.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
