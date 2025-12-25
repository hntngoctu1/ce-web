/**
 * AI Content Service
 *
 * Central service for AI content operations.
 * Provider is selected based on AI_PROVIDER environment variable.
 *
 * Supported providers:
 * - mock (default): Returns placeholder content for testing
 * - openai: OpenAI GPT (future)
 * - anthropic: Anthropic Claude (future)
 */

import type { AiProvider, AiJobType } from './types';
import { MockAiProvider } from './mock-provider';

export * from './types';

// Provider registry
const providers: Record<string, () => AiProvider> = {
  mock: () => new MockAiProvider(),
  // Future providers:
  // openai: () => new OpenAiProvider(),
  // anthropic: () => new AnthropicProvider(),
};

/**
 * Get the configured AI provider
 */
export function getAiProvider(): AiProvider {
  const providerName = process.env.AI_PROVIDER || 'mock';

  const factory = providers[providerName];
  if (!factory) {
    console.warn(`Unknown AI provider: ${providerName}, falling back to mock`);
    return new MockAiProvider();
  }

  return factory();
}

/**
 * Check if AI features are enabled (non-mock provider configured)
 */
export function isAiEnabled(): boolean {
  const provider = process.env.AI_PROVIDER || 'mock';
  return provider !== 'mock' && !!process.env.AI_API_KEY;
}

/**
 * Get human-readable job type label
 */
export function getJobTypeLabel(type: AiJobType): string {
  const labels: Record<AiJobType, string> = {
    GENERATE_DRAFT: 'Generate Draft',
    TRANSLATE: 'Translate',
    SUMMARIZE: 'Summarize',
    SEO_OPTIMIZE: 'SEO Optimize',
    REWRITE: 'Rewrite',
  };
  return labels[type] || type;
}

/**
 * Get job type icon name (for lucide-react)
 */
export function getJobTypeIcon(type: AiJobType): string {
  const icons: Record<AiJobType, string> = {
    GENERATE_DRAFT: 'Wand2',
    TRANSLATE: 'Languages',
    SUMMARIZE: 'FileText',
    SEO_OPTIMIZE: 'Search',
    REWRITE: 'RefreshCw',
  };
  return icons[type] || 'Sparkles';
}
