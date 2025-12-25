'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Languages,
  Wand2,
  Search,
  Rss,
  FileText,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface AiJob {
  id: string;
  type: string;
  status: string;
  input: string;
  output: string | null;
  error: string | null;
  postId: string | null;
  locale: string | null;
  createdAt: string;
  post?: { id: string; titleEn: string; slug: string } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  QUEUED: { label: 'Queued', color: 'bg-slate-100 text-slate-700', icon: Clock },
  RUNNING: { label: 'Running', color: 'bg-blue-100 text-blue-700', icon: Loader2 },
  DONE: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function BlogAIPage() {
  const [jobs, setJobs] = useState<AiJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<AiJob | null>(null);

  // Form states
  const [generateTopic, setGenerateTopic] = useState('');
  const [generateUrl, setGenerateUrl] = useState('');
  const [translateContent, setTranslateContent] = useState('');
  const [translateFrom, setTranslateFrom] = useState<'en' | 'vi'>('en');
  const [translateTo, setTranslateTo] = useState<'en' | 'vi'>('vi');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoContent, setSeoContent] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function executeJob(type: string, input: Record<string, unknown>) {
    try {
      setExecuting(type);
      const res = await fetch('/api/ai/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, input }),
      });

      const data = await res.json();

      if (res.ok) {
        // Refresh jobs list
        await fetchJobs();
        // Show result
        if (data.job) {
          setSelectedJob(data.job);
        }
      } else {
        alert(data.error || 'AI operation failed');
      }
    } catch (error) {
      console.error('AI job failed:', error);
      alert('Failed to execute AI operation');
    } finally {
      setExecuting(null);
    }
  }

  function handleGenerateDraft() {
    if (!generateTopic && !generateUrl) {
      alert('Please enter a topic or source URL');
      return;
    }
    executeJob('GENERATE_DRAFT', {
      topic: generateTopic,
      sourceUrl: generateUrl,
      targetLocale: 'en',
    });
  }

  function handleTranslate() {
    if (!translateContent) {
      alert('Please enter content to translate');
      return;
    }
    executeJob('TRANSLATE', {
      content: translateContent,
      fromLocale: translateFrom,
      toLocale: translateTo,
    });
  }

  function handleSeoOptimize() {
    if (!seoTitle || !seoContent) {
      alert('Please enter title and content');
      return;
    }
    executeJob('SEO_OPTIMIZE', {
      title: seoTitle,
      content: seoContent,
      targetKeywords: seoKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function formatOutput(output: string | null): React.ReactNode {
    if (!output) return null;
    try {
      const parsed = JSON.parse(output);
      return (
        <pre className="max-h-64 overflow-auto rounded bg-slate-50 p-3 text-xs">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch {
      return <p className="text-sm">{output}</p>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <Sparkles className="h-8 w-8 text-purple-500" />
            AI Content Assistant
          </h1>
          <p className="text-muted-foreground">
            AI-powered tools to help you create, translate, and optimize content.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Provider: Mock (Demo)
        </Badge>
      </div>

      <Tabs defaultValue="generate">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="translate" className="gap-2">
            <Languages className="h-4 w-4" />
            Translate
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <Rss className="h-4 w-4" />
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-500" />
                Generate Draft
              </CardTitle>
              <CardDescription>
                Create a blog post draft from a topic or source URL.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic or Title</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Benefits of Industrial Adhesives"
                  value={generateTopic}
                  onChange={(e) => setGenerateTopic(e.target.value)}
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">— or —</div>
              <div>
                <Label htmlFor="sourceUrl">Source URL</Label>
                <Input
                  id="sourceUrl"
                  placeholder="https://example.com/article"
                  value={generateUrl}
                  onChange={(e) => setGenerateUrl(e.target.value)}
                />
              </div>
              <Button
                onClick={handleGenerateDraft}
                disabled={executing === 'GENERATE_DRAFT'}
                className="w-full"
              >
                {executing === 'GENERATE_DRAFT' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Draft
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-blue-500" />
                Translate Content
              </CardTitle>
              <CardDescription>Translate content between English and Vietnamese.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From</Label>
                  <Select
                    value={translateFrom}
                    onValueChange={(v) => setTranslateFrom(v as 'en' | 'vi')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To</Label>
                  <Select
                    value={translateTo}
                    onValueChange={(v) => setTranslateTo(v as 'en' | 'vi')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="translateContent">Content</Label>
                <Textarea
                  id="translateContent"
                  placeholder="Paste content to translate..."
                  value={translateContent}
                  onChange={(e) => setTranslateContent(e.target.value)}
                  rows={6}
                />
              </div>
              <Button
                onClick={handleTranslate}
                disabled={executing === 'TRANSLATE'}
                className="w-full"
              >
                {executing === 'TRANSLATE' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Languages className="mr-2 h-4 w-4" />
                )}
                Translate
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-green-500" />
                SEO Optimization
              </CardTitle>
              <CardDescription>
                Get SEO suggestions for title, meta description, and keywords.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">Article Title</Label>
                <Input
                  id="seoTitle"
                  placeholder="Your article title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="seoContent">Article Content</Label>
                <Textarea
                  id="seoContent"
                  placeholder="Paste your article content..."
                  value={seoContent}
                  onChange={(e) => setSeoContent(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="seoKeywords">Target Keywords (comma separated)</Label>
                <Input
                  id="seoKeywords"
                  placeholder="keyword1, keyword2, keyword3"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSeoOptimize}
                disabled={executing === 'SEO_OPTIMIZE'}
                className="w-full"
              >
                {executing === 'SEO_OPTIMIZE' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Optimize SEO
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <Card className="opacity-75">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rss className="h-5 w-5 text-orange-500" />
                Content Import
              </CardTitle>
              <CardDescription>
                Import and summarize content from RSS feeds or URLs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
                <Rss className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="text-sm">RSS import and auto-publish pipeline coming in Phase 3.</p>
                <p className="mt-2 text-xs">
                  This will allow you to subscribe to feeds and automatically create draft posts.
                </p>
              </div>
              <Button disabled className="w-full">
                <Rss className="mr-2 h-4 w-4" />
                Import Content (Phase 3)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Jobs History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Job History
            </CardTitle>
            <CardDescription>Recent AI content generation requests.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Sparkles className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No AI jobs yet.</p>
              <p className="mt-2 text-sm">Use the tools above to generate content.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const status = statusConfig[job.status] || statusConfig.QUEUED;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={job.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-slate-50"
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="flex items-center gap-4">
                      <Badge className={status.color}>
                        <StatusIcon
                          className={`mr-1 h-3 w-3 ${job.status === 'RUNNING' ? 'animate-spin' : ''}`}
                        />
                        {status.label}
                      </Badge>
                      <div>
                        <p className="font-medium">{job.type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(job.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedJob && (
                <>
                  <Badge className={statusConfig[selectedJob.status]?.color || ''}>
                    {statusConfig[selectedJob.status]?.label}
                  </Badge>
                  {selectedJob.type.replace('_', ' ')}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedJob && new Date(selectedJob.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Input</Label>
                <pre className="mt-1 max-h-40 overflow-auto rounded bg-slate-50 p-3 text-xs">
                  {JSON.stringify(JSON.parse(selectedJob.input || '{}'), null, 2)}
                </pre>
              </div>

              {selectedJob.output && (
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <Label className="text-sm font-medium">Output</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedJob.output || '')}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  {formatOutput(selectedJob.output)}
                </div>
              )}

              {selectedJob.error && (
                <div>
                  <Label className="text-sm font-medium text-red-600">Error</Label>
                  <p className="mt-1 rounded bg-red-50 p-3 text-sm text-red-600">
                    {selectedJob.error}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedJob(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configuration Note */}
      <Card className="bg-slate-50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Currently using <code>mock</code> provider for demonstration. To
            enable real AI features, set environment variables:
          </p>
          <pre className="mt-2 rounded bg-white p-2 text-xs">
            AI_PROVIDER=openai{'\n'}
            AI_API_KEY=your-api-key{'\n'}
            AI_MODEL=gpt-4
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
