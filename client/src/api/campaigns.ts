import { api } from './client.js';
import type {
  Campaign,
  CampaignDetail,
  CampaignResults,
  CreateCampaign,
  UpdateCampaign,
} from '@elitequest/shared';

export type { Campaign, CampaignDetail, CampaignResults, CreateCampaign, UpdateCampaign };

export function listCampaigns(classId: number): Promise<Campaign[]> {
  return api.get<Campaign[]>(`/campaigns?class_id=${classId}`);
}

export function getCampaign(id: number): Promise<CampaignDetail> {
  return api.get<CampaignDetail>(`/campaigns/${id}`);
}

export function createCampaign(input: CreateCampaign): Promise<Campaign> {
  return api.post<Campaign>('/campaigns', input);
}

export function updateCampaign(id: number, input: UpdateCampaign): Promise<Campaign> {
  return api.patch<Campaign>(`/campaigns/${id}`, input);
}

export function deleteCampaign(id: number): Promise<void> {
  return api.delete<void>(`/campaigns/${id}`);
}

export function addQuizToCampaign(campaignId: number, quizId: number): Promise<CampaignDetail> {
  return api.post<CampaignDetail>(`/campaigns/${campaignId}/quizzes`, { quiz_id: quizId });
}

export function removeQuizFromCampaign(campaignId: number, quizId: number): Promise<CampaignDetail> {
  return api.delete<CampaignDetail>(`/campaigns/${campaignId}/quizzes/${quizId}`);
}

export function reorderPlaylist(campaignId: number, quizIds: number[]): Promise<CampaignDetail> {
  return api.put<CampaignDetail>(`/campaigns/${campaignId}/quizzes/order`, { quiz_ids: quizIds });
}

export function getCampaignResults(campaignId: number): Promise<CampaignResults> {
  return api.get<CampaignResults>(`/campaigns/${campaignId}/results`);
}
