/**
 * Mock AI Provider
 * Returns placeholder content for testing without real AI API calls.
 * Replace with OpenAI/Anthropic/etc. provider in production.
 */

import type {
  AiProvider,
  AiGenerateDraftInput,
  AiGenerateDraftOutput,
  AiTranslateInput,
  AiTranslateOutput,
  AiSummarizeInput,
  AiSummarizeOutput,
  AiSeoOptimizeInput,
  AiSeoOptimizeOutput,
  AiRewriteInput,
  AiRewriteOutput,
} from './types';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockAiProvider implements AiProvider {
  name = 'mock';

  async generateDraft(input: AiGenerateDraftInput): Promise<AiGenerateDraftOutput> {
    await delay(1500); // Simulate API call

    const topic = input.topic || input.sourceUrl || 'Untitled Topic';
    const slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

    return {
      title: `[AI Draft] ${topic}`,
      excerpt: `This is an AI-generated draft about "${topic}". Replace this with actual content from your AI provider.`,
      content: `
        <h2>Introduction</h2>
        <p>This is a placeholder article about <strong>${topic}</strong>. When you configure a real AI provider (OpenAI, Anthropic, etc.), this will be replaced with actual generated content.</p>
        
        <h2>Key Points</h2>
        <ul>
          <li>Point 1: Placeholder content for demonstration</li>
          <li>Point 2: Configure AI_PROVIDER environment variable</li>
          <li>Point 3: Add your API key to enable real generation</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Remember to replace the mock provider with a real implementation for production use.</p>
      `.trim(),
      suggestedSlug: slug,
    };
  }

  async translate(input: AiTranslateInput): Promise<AiTranslateOutput> {
    await delay(1000);

    const direction = `${input.fromLocale.toUpperCase()} → ${input.toLocale.toUpperCase()}`;

    return {
      translatedTitle: input.title ? `[Translated ${direction}] ${input.title}` : undefined,
      translatedExcerpt: input.excerpt ? `[Translated ${direction}] ${input.excerpt}` : undefined,
      translatedContent: `
        <p><em>[Mock Translation ${direction}]</em></p>
        <p>This is a placeholder translation. Configure a real AI provider to get actual translations.</p>
        <hr />
        <p><strong>Original content:</strong></p>
        ${input.content}
      `.trim(),
    };
  }

  async summarize(input: AiSummarizeInput): Promise<AiSummarizeOutput> {
    await delay(800);

    const wordCount = input.content.split(/\s+/).length;
    const maxLen = input.maxLength || 150;

    return {
      summary: `[Mock Summary] This article contains approximately ${wordCount} words. Configure a real AI provider for actual summarization. Maximum summary length: ${maxLen} characters.`,
    };
  }

  async seoOptimize(input: AiSeoOptimizeInput): Promise<AiSeoOptimizeOutput> {
    await delay(1200);

    const baseKeywords = input.targetKeywords || [];
    const titleWords = input.title.toLowerCase().split(/\s+/).slice(0, 3);

    return {
      seoTitle: `${input.title} | Best Practices & Guide`,
      seoDescription:
        `Discover everything about ${input.title.toLowerCase()}. ${input.excerpt || 'Learn more in this comprehensive guide.'}`.slice(
          0,
          160
        ),
      suggestedKeywords: [
        ...baseKeywords,
        ...titleWords.filter((w) => w.length > 3),
        'guide',
        'best practices',
      ].slice(0, 10),
      contentSuggestions: [
        'Add more headings (H2, H3) for better structure',
        'Include relevant images with alt text',
        'Add internal links to related content',
        'Consider adding a FAQ section',
      ],
    };
  }

  async rewrite(input: AiRewriteInput): Promise<AiRewriteOutput> {
    await delay(1000);

    const tone = input.tone || 'professional';

    return {
      rewrittenContent: `
        <p><em>[Mock Rewrite - ${tone} tone]</em></p>
        <p>This is a placeholder rewrite. Configure a real AI provider to get actual content rewriting.</p>
        <hr />
        <p><strong>Original content:</strong></p>
        ${input.content}
      `.trim(),
    };
  }
}

// Singleton instance
export const mockProvider = new MockAiProvider();
