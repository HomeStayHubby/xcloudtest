import type { ResponseAnswer } from '@elitequest/shared';
import type { AggregationData, BrainstormEntry, WordCloudEntry } from '../types/live.types.js';

export async function submitAnswer(questionId: number, answer: ResponseAnswer | null): Promise<unknown> {
  const response = await fetch(`/api/v1/questions/${questionId}/responses`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer: answer ?? '' }),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message ?? 'Failed to submit answer');
  }
  return response.json();
}

export async function getAggregation(questionId: number): Promise<AggregationData> {
  const response = await fetch(`/api/v1/questions/${questionId}/aggregation`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to load aggregation');
  }
  const json = (await response.json()) as { data: AggregationData };
  return json.data;
}

export async function upvoteIdea(questionId: number, idea: string): Promise<AggregationData> {
  const response = await fetch(`/api/v1/questions/${questionId}/upvote`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea }),
  });
  if (!response.ok) {
    throw new Error('Failed to upvote');
  }
  const json = (await response.json()) as { data: AggregationData };
  return json.data;
}

export async function setResponseScore(responseId: number, score: number): Promise<void> {
  const response = await fetch(`/api/v1/responses/${responseId}/score`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score }),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message ?? 'Failed to set score');
  }
}

export async function setQuestionScores(questionId: number, score: number): Promise<number> {
  const response = await fetch(`/api/v1/questions/${questionId}/scores`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score }),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message ?? 'Failed to set scores');
  }
  const json = (await response.json()) as { data: { updated: number } };
  return json.data.updated;
}

export type { AggregationData, BrainstormEntry, WordCloudEntry };
