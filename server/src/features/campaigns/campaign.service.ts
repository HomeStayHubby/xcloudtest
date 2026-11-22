import { database } from '../../db/database.js';
import { allAsync, getAsync, runAsync } from '../../db/promises.js';
import { badRequest, notFound } from '../../shared/errors.js';
import type { Actor } from '../../shared/permissions.js';
import { parseQuizSettings } from '../../db/json-helpers.js';
import { getClassById } from '../classes/class.service.js';
import { getQuizById, assertQuizOwner } from '../quizzes/quiz.service.js';
import type {
  User,
  Campaign,
  CampaignDetail,
  CampaignResults,
  CreateCampaign,
  UpdateCampaign,
  Quiz,
} from '@elitequest/shared';

export async function listCampaignsByClass(classId: number): Promise<Campaign[]> {
  await getClassById(classId);
  const rows = await allAsync<Campaign>(
    database,
    'SELECT * FROM campaigns WHERE class_id = ? ORDER BY created_at DESC, id DESC',
    classId
  );
  return rows;
}

export async function getCampaignById(id: number): Promise<Campaign> {
  const row = await getAsync<Campaign>(database, 'SELECT * FROM campaigns WHERE id = ?', id);
  if (!row) {
    throw notFound('Campaign');
  }
  return row;
}

type PlaylistRow = Omit<Quiz, 'settings'> & {
  settings: string;
  quiz_id: number;
  position: number;
};

export async function getCampaignDetail(id: number): Promise<CampaignDetail> {
  const campaign = await getCampaignById(id);
  const rows = await allAsync<PlaylistRow>(
    database,
    `SELECT cq.quiz_id, cq.position, z.*
     FROM campaign_quizzes cq
     JOIN quizzes z ON z.id = cq.quiz_id
     WHERE cq.campaign_id = ?
     ORDER BY cq.position, cq.id`,
    id
  );
  return {
    ...campaign,
    items: rows.map((row) => {
      const { quiz_id, position, ...quizRow } = row;
      return {
        quiz_id,
        position,
        quiz: {
          ...quizRow,
          settings: parseQuizSettings(quizRow.settings),
        },
      };
    }),
  };
}

export async function createCampaign(user: Actor, input: CreateCampaign): Promise<Campaign> {
  await getClassById(input.class_id);

  await runAsync(
    database,
    'INSERT INTO campaigns (class_id, created_by, title, description) VALUES (?, ?, ?, ?)',
    input.class_id,
    user.id,
    input.title,
    input.description ?? null
  );

  const created = await getAsync<{ id: number }>(database, 'SELECT last_insert_rowid() as id');
  if (!created) {
    throw new Error('Failed to create campaign');
  }
  return getCampaignById(created.id);
}

export async function updateCampaign(id: number, input: UpdateCampaign): Promise<Campaign> {
  const existing = await getCampaignById(id);

  const title = input.title ?? existing.title;
  const description = input.description !== undefined ? input.description : existing.description;

  await runAsync(
    database,
    'UPDATE campaigns SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    title,
    description ?? null,
    id
  );

  return getCampaignById(id);
}

export async function deleteCampaign(id: number): Promise<void> {
  await getCampaignById(id);
  await runAsync(database, 'DELETE FROM campaigns WHERE id = ?', id);
}

export async function addQuizToCampaign(user: Actor, campaignId: number, quizId: number): Promise<CampaignDetail> {
  await getCampaignById(campaignId);
  // Only the quiz owner (or an admin) may add their quiz to a campaign.
  await assertQuizOwner(user, quizId);

  const existing = await getAsync<{ id: number }>(
    database,
    'SELECT id FROM campaign_quizzes WHERE campaign_id = ? AND quiz_id = ?',
    campaignId,
    quizId
  );
  if (existing) {
    throw badRequest('Quiz is already in this campaign');
  }

  const last = await getAsync<{ position: number }>(
    database,
    'SELECT COALESCE(MAX(position), -1) AS position FROM campaign_quizzes WHERE campaign_id = ?',
    campaignId
  );
  const nextPosition = (last?.position ?? -1) + 1;

  await runAsync(
    database,
    'INSERT INTO campaign_quizzes (campaign_id, quiz_id, position) VALUES (?, ?, ?)',
    campaignId,
    quizId,
    nextPosition
  );

  return getCampaignDetail(campaignId);
}

export async function removeQuizFromCampaign(campaignId: number, quizId: number): Promise<CampaignDetail> {
  await getCampaignById(campaignId);

  const existing = await getAsync<{ id: number }>(
    database,
    'SELECT id FROM campaign_quizzes WHERE campaign_id = ? AND quiz_id = ?',
    campaignId,
    quizId
  );
  if (!existing) {
    throw notFound('Playlist item');
  }

  await runAsync(
    database,
    'DELETE FROM campaign_quizzes WHERE campaign_id = ? AND quiz_id = ?',
    campaignId,
    quizId
  );

  return getCampaignDetail(campaignId);
}

export async function reorderPlaylist(campaignId: number, quizIds: number[]): Promise<CampaignDetail> {
  const detail = await getCampaignDetail(campaignId);

  const playlistIds = new Set(detail.items.map((item) => item.quiz_id));
  const requestedIds = new Set(quizIds);
  for (const quizId of quizIds) {
    if (!playlistIds.has(quizId)) {
      throw badRequest(`Quiz ${quizId} is not in this campaign`);
    }
  }
  if (requestedIds.size !== playlistIds.size) {
    throw badRequest('Playlist order must include every quiz exactly once');
  }

  await runAsync(database, 'BEGIN TRANSACTION');
  try {
    for (let index = 0; index < quizIds.length; index++) {
      await runAsync(
        database,
        'UPDATE campaign_quizzes SET position = ? WHERE campaign_id = ? AND quiz_id = ?',
        index,
        campaignId,
        quizIds[index]
      );
    }
    await runAsync(database, 'COMMIT');
  } catch (err) {
    await runAsync(database, 'ROLLBACK');
    throw err;
  }

  return getCampaignDetail(campaignId);
}

export async function getCampaignResults(campaignId: number): Promise<CampaignResults> {
  const campaign = await getCampaignById(campaignId);

  const individuals = await allAsync<CampaignResults['individuals'][number]>(
    database,
    `SELECT s.id AS student_id,
            s.display_name,
            COALESCE(SUM(r.score), 0) AS total_score,
            COUNT(r.id) AS responses
     FROM users s
     JOIN responses r ON r.student_id = s.id
     JOIN questions q ON q.id = r.question_id
     JOIN quizzes z ON z.id = q.quiz_id
     JOIN campaign_quizzes cq ON cq.quiz_id = z.id
     WHERE cq.campaign_id = ? AND s.class_id = ? AND s.role = 'student'
     GROUP BY s.id, s.display_name
     ORDER BY total_score DESC, s.display_name`,
    campaignId,
    campaign.class_id
  );

  const groups = await allAsync<CampaignResults['groups'][number]>(
    database,
    `SELECT g.id AS group_id,
            g.name AS group_name,
            COALESCE(SUM(r.score), 0) AS total_score,
            COUNT(r.id) AS responses
     FROM groups g
     JOIN responses r ON r.group_id = g.id
     JOIN questions q ON q.id = r.question_id
     JOIN quizzes z ON z.id = q.quiz_id
     JOIN campaign_quizzes cq ON cq.quiz_id = z.id
     WHERE cq.campaign_id = ?
       AND g.quiz_id IN (SELECT quiz_id FROM campaign_quizzes WHERE campaign_id = ?)
     GROUP BY g.id, g.name
     ORDER BY total_score DESC, g.name`,
    campaignId,
    campaignId
  );

  const perQuiz = await allAsync<CampaignResults['per_quiz'][number]>(
    database,
    `SELECT z.id AS quiz_id,
            z.title AS quiz_title,
            COUNT(r.id) AS responses,
            COALESCE(SUM(r.score), 0) AS total_score
     FROM campaign_quizzes cq
     JOIN quizzes z ON z.id = cq.quiz_id
     LEFT JOIN questions q ON q.quiz_id = z.id
     LEFT JOIN responses r ON r.question_id = q.id
     WHERE cq.campaign_id = ?
     GROUP BY z.id, z.title
     ORDER BY cq.position, cq.id`,
    campaignId
  );

  return { campaign_id: campaignId, class_id: campaign.class_id, individuals, groups, per_quiz: perQuiz };
}
