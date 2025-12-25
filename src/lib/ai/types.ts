// AI Content Pipeline Types

export type AiJobType = 'GENERATE_DRAFT' | 'TRANSLATE' | 'SUMMARIZE' | 'SEO_OPTIMIZE' | 'REWRITE';

export type AiJobStatus = 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED';

export interface AiGenerateDraftInput {
  topic?: string;
  outline?: string;
  sourceUrl?: string;
  targetLocale?: 'en' | 'vi';
}

export interface AiTranslateInput {
  content: string;
  fromLocale: 'en' | 'vi';
  toLocale: 'en' | 'vi';
  title?: string;
  excerpt?: string;
}

export interface AiSummarizeInput {
  content: string;
  maxLength?: number;
  locale?: 'en' | 'vi';
}

export interface AiSeoOptimizeInput {
  title: string;
  content: string;
  excerpt?: string;
  targetKeywords?: string[];
  locale?: 'en' | 'vi';
}

export interface AiRewriteInput {
  content: string;
  tone?: 'professional' | 'casual' | 'formal';
  locale?: 'en' | 'vi';
}

export interface AiGenerateDraftOutput {
  title: string;
  excerpt: string;
  content: string; // HTML or JSON
  suggestedSlug: string;
}

export interface AiTranslateOutput {
  translatedTitle?: string;
  translatedExcerpt?: string;
  translatedContent: string;
}

export interface AiSummarizeOutput {
  summary: string;
}

export interface AiSeoOptimizeOutput {
  seoTitle: string;
  seoDescription: string;
  suggestedKeywords: string[];
  contentSuggestions?: string[];
}

export interface AiRewriteOutput {
  rewrittenContent: string;
}

export type AiInput =
  | AiGenerateDraftInput
  | AiTranslateInput
  | AiSummarizeInput
  | AiSeoOptimizeInput
  | AiRewriteInput;

export type AiOutput =
  | AiGenerateDraftOutput
  | AiTranslateOutput
  | AiSummarizeOutput
  | AiSeoOptimizeOutput
  | AiRewriteOutput;

export interface AiProvider {
  name: string;

  generateDraft(input: AiGenerateDraftInput): Promise<AiGenerateDraftOutput>;
  translate(input: AiTranslateInput): Promise<AiTranslateOutput>;
  summarize(input: AiSummarizeInput): Promise<AiSummarizeOutput>;
  seoOptimize(input: AiSeoOptimizeInput): Promise<AiSeoOptimizeOutput>;
  rewrite(input: AiRewriteInput): Promise<AiRewriteOutput>;
}
