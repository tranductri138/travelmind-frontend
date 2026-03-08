import { MessageSquare, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/cn'
import { formatRelative } from '@/lib/format'
import type { ChatConversation } from '@/types/chat'

interface ConversationListProps {
  conversations: ChatConversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <Button onClick={onNew} className="w-full" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No conversations yet
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                'group flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/50 transition-colors',
                activeId === conv.id && 'bg-muted',
              )}
              onClick={() => onSelect(conv.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{conv.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRelative(conv.updatedAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-7 w-7 shrink-0 transition-opacity hover:text-destructive',
                  activeId === conv.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(conv.id)
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
