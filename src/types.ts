export type Framework = 'playwright-ts' | 'playwright-js' | 'cypress';

export interface GenerationOptions {
  pom: boolean;
  robustSelectors: boolean;
  includeViewport: boolean;
}

export interface ScriptItem {
  id: string;
  name: string;
  criteria: string;
  code: string;
  notes: string;
  framework: Framework;
  timestamp: number;
}

export interface Template {
  id: string;
  title: string;
  criteria: string;
  framework: Framework;
  description: string;
}
