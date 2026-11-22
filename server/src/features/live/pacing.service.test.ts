import { describe, it, expect, beforeEach } from 'vitest';
import {
  advanceQuestion,
  getCurrentQuestionIndex,
  resetPacing,
  retreatQuestion,
  setCurrentQuestionIndex,
} from './pacing.service.js';

describe('pacing service', () => {
  beforeEach(() => {
    resetPacing(1);
    resetPacing(2);
  });

  it('starts at index 0', () => {
    expect(getCurrentQuestionIndex(1)).toBe(0);
  });

  it('advances and retreats within bounds', () => {
    expect(advanceQuestion(1, 3)).toBe(1);
    expect(advanceQuestion(1, 3)).toBe(2);
    expect(advanceQuestion(1, 3)).toBe(2); // stays at max
    expect(retreatQuestion(1)).toBe(1);
    expect(retreatQuestion(1)).toBe(0);
    expect(retreatQuestion(1)).toBe(0); // stays at 0
  });

  it('tracks different quizzes independently', () => {
    setCurrentQuestionIndex(2, 5);
    expect(getCurrentQuestionIndex(1)).toBe(0);
    expect(getCurrentQuestionIndex(2)).toBe(5);
  });

  it('resets pacing', () => {
    setCurrentQuestionIndex(1, 2);
    resetPacing(1);
    expect(getCurrentQuestionIndex(1)).toBe(0);
  });
});
