import type { Actor } from '../../shared/permissions.js';
import type { Campaign, CampaignDetail, CampaignResults, CreateCampaign, UpdateCampaign } from '@elitequest/shared';
export declare function listCampaignsByClass(classId: number): Promise<Campaign[]>;
export declare function getCampaignById(id: number): Promise<Campaign>;
export declare function getCampaignDetail(id: number): Promise<CampaignDetail>;
export declare function createCampaign(user: Actor, input: CreateCampaign): Promise<Campaign>;
export declare function updateCampaign(id: number, input: UpdateCampaign): Promise<Campaign>;
export declare function deleteCampaign(id: number): Promise<void>;
export declare function addQuizToCampaign(user: Actor, campaignId: number, quizId: number): Promise<CampaignDetail>;
export declare function removeQuizFromCampaign(campaignId: number, quizId: number): Promise<CampaignDetail>;
export declare function reorderPlaylist(campaignId: number, quizIds: number[]): Promise<CampaignDetail>;
export declare function getCampaignResults(campaignId: number): Promise<CampaignResults>;
//# sourceMappingURL=campaign.service.d.ts.map