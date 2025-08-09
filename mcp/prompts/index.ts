#!/usr/bin/env node
/**
 * AI Virtual Lab Generator - Unified Prompt System
 * Centralizes all prompts for ML and Science lab generation
 */

// Re-export all prompt templates and topic data from science, ml, and visual prompt modules
export * from './science.js';
export * from './ml.js';
export * from './visual.js';

// Import the types we need for cross-domain helpers
import { ML_PROMPT_TEMPLATES } from './ml.js';
import { SCIENCE_PROMPT_TEMPLATES } from './science.js';

// Cross-domain prompt helper function
export function getPromptByDomain(domain: 'science' | 'ml', promptType: string, variables: any = {}) {
  let template: string;
  
  if (domain === 'science') {
    template = (SCIENCE_PROMPT_TEMPLATES as any)[promptType];
  } else if (domain === 'ml') {
    template = (ML_PROMPT_TEMPLATES as any)[promptType];
  } else {
    throw new Error(`Unsupported domain: ${domain}`);
  }
  
  if (!template) {
    throw new Error(`Prompt type "${promptType}" not found for domain "${domain}"`);
  }
  
  // Replace variables in template
  let result = template;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });
  
  return result;
}