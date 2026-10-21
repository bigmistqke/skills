/** The new core behind the old entry points: `verbalize` and `verbalizeDefinition`, with every pass on. */
import type { Readings } from '../readings.ts';
import { say, sayDefinition } from './index.ts';
import { PASSES } from './passes/index.ts';

export function verbalize(source: string, readings: Readings, layout: 'text' | 'markdown' = 'text', self?: string): string {
  return say(source, readings, { layout, self, passes: PASSES });
}

export function verbalizeDefinition(source: string, readings: Readings, layout: 'text' | 'markdown' = 'text', self?: string): string {
  return sayDefinition(source, readings, { layout, self, passes: PASSES });
}
