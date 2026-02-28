import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/api/client'
import { Play, RefreshCw } from 'lucide-react'

export function CrawlerPage() {
  const [status, setStatus] = useState<string>('idle')

  const triggerMutation = useMutation({
    mutationFn: () => apiClient.post('/crawler/trigger'),
    onSuccess: () => setStatus('running'),
  })

  const checkStatus = useMutation({
    mutationFn: () => apiClient.get('/crawler/status'),
    onSuccess: ({ data }) => setStatus(data.data?.status || 'unknown'),
  })

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Data Crawler</h1>

      <Card>
        <CardHeader>
          <CardTitle>Crawler Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={status === 'running' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => triggerMutation.mutate()}
              disabled={triggerMutation.isPending || status === 'running'}
            >
              <Play className="h-4 w-4 mr-2" />
              {triggerMutation.isPending ? 'Triggering...' : 'Trigger Crawl'}
            </Button>
            <Button
              variant="outline"
              onClick={() => checkStatus.mutate()}
              disabled={checkStatus.isPending}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
