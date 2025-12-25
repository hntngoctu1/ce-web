 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Send, Archive, Trash2, X, Loader2, EyeOff } from 'lucide-react';

interface BlogBulkActionsProps {
  selectedIds: string[];
  onClear: () => void;
}

export function BlogBulkActions({ selectedIds, onClear }: BlogBulkActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    action: string;
    title: string;
    description: string;
  } | null>(null);

  const count = selectedIds.length;

  async function executeAction(action: string) {
    try {
      setLoading(action);
      const res = await fetch('/api/blog/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, postIds: selectedIds }),
      });

      const data = await res.json();

      if (res.ok) {
        onClear();
        router.refresh();
      } else {
        alert(data.error || 'Failed to perform action');
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Failed to perform action');
    } finally {
      setLoading(null);
      setConfirmAction(null);
    }
  }

  if (count === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-lg bg-slate-900 px-4 py-3 text-white shadow-xl">
        <span className="font-medium">
          {count} post{count > 1 ? 's' : ''} selected
        </span>

        <div className="h-6 w-px bg-slate-700" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-800"
            onClick={() => executeAction('publish')}
            disabled={loading !== null}
          >
            {loading === 'publish' ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-1 h-4 w-4" />
            )}
            Publish
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-800"
            onClick={() => executeAction('unpublish')}
            disabled={loading !== null}
          >
            {loading === 'unpublish' ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <EyeOff className="mr-1 h-4 w-4" />
            )}
            Unpublish
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-800"
            onClick={() => executeAction('archive')}
            disabled={loading !== null}
          >
            {loading === 'archive' ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Archive className="mr-1 h-4 w-4" />
            )}
            Archive
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:bg-red-900/50 hover:text-red-300"
            onClick={() =>
              setConfirmAction({
                action: 'delete',
                title: 'Delete Posts',
                description: `Are you sure you want to delete ${count} post${count > 1 ? 's' : ''}? This action cannot be undone.`,
              })
            }
            disabled={loading !== null}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>

        <div className="h-6 w-px bg-slate-700" />

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-slate-800"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction.action)}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading === 'delete' ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
