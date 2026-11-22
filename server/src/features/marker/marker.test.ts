import { describe, it, expect } from 'vitest';
import { scoreResponse } from './marker.js';
import type { QuestionData } from '@elitequest/shared';

describe('scoreResponse', () => {
  it('marks MCQ single correct', () => {
    const data: QuestionData = {
      type: 'mcq_single',
      prompt: '2+2',
      options: [{ id: 'a', text: '3' }, { id: 'b', text: '4' }],
      correct_option_id: 'b',
    };
    expect(scoreResponse(data, 'b', 1)).toBe(1);
    expect(scoreResponse(data, 'a', 1)).toBe(0);
  });

  it('marks MCQ multi full and partial', () => {
    const data: QuestionData = {
      type: 'mcq_multi',
      prompt: 'Select primes',
      options: [{ id: 'a', text: '2' }, { id: 'b', text: '3' }, { id: 'c', text: '4' }],
      correct_option_ids: ['a', 'b'],
      allow_partial: true,
      partial_points: 0,
    };
    expect(scoreResponse(data, ['a', 'b'], 2)).toBe(2);
    expect(scoreResponse(data, ['a'], 2)).toBe(1);
  });

  it('marks short answer case-insensitive', () => {
    const data: QuestionData = {
      type: 'short_answer',
      prompt: 'Capital of France',
      accepted_answers: ['Paris'],
      case_sensitive: false,
    };
    expect(scoreResponse(data, 'paris', 1)).toBe(1);
    expect(scoreResponse(data, 'London', 1)).toBe(0);
  });

  it('marks fill in the blanks', () => {
    const data: QuestionData = {
      type: 'fill_blanks',
      prompt: 'Fill',
      segments: [
        { text: 'The sky is ', blank: true, answer: 'blue' },
        { text: '.', blank: false },
      ],
    };
    expect(scoreResponse(data, ['blue'], 1)).toBe(1);
    expect(scoreResponse(data, ['red'], 1)).toBe(0);
  });

  it('marks matching', () => {
    const data: QuestionData = {
      type: 'matching',
      prompt: 'Match',
      left_items: [{ id: '1', text: 'A' }, { id: '2', text: 'B' }],
      right_items: [{ id: 'x', text: 'X' }, { id: 'y', text: 'Y' }],
      correct_pairs: { '1': 'x', '2': 'y' },
    };
    expect(scoreResponse(data, { '1': 'x', '2': 'y' }, 2)).toBe(2);
    expect(scoreResponse(data, { '1': 'y', '2': 'y' }, 2)).toBe(1);
  });

  it('marks grouping', () => {
    const data: QuestionData = {
      type: 'grouping',
      prompt: 'Group',
      groups: [{ id: 'g1', name: 'Group 1' }],
      items: [{ id: 'i1', text: 'Item 1', group_id: 'g1' }],
    };
    expect(scoreResponse(data, { i1: 'g1' }, 1)).toBe(1);
    expect(scoreResponse(data, { i1: 'g2' }, 1)).toBe(0);
  });
});
