import { quizIdParamSchema, groupIdParamSchema, groupStudentParamsSchema, } from './group.validators.js';
import { createGroupSchema, updateGroupSchema, addGroupMemberSchema } from '@elitequest/shared';
import { getAuthUser } from '../auth/auth.middleware.js';
import { listGroupsByQuiz, getGroupById, createGroup, updateGroup, deleteGroup, listGroupMembers, addGroupMember, removeGroupMember, } from './group.service.js';
export async function index(req, res, next) {
    try {
        const { quizId } = quizIdParamSchema.parse(req.params);
        const groups = await listGroupsByQuiz(getAuthUser(req), quizId);
        res.json({ data: groups });
    }
    catch (err) {
        next(err);
    }
}
export async function show(req, res, next) {
    try {
        const { id } = groupIdParamSchema.parse(req.params);
        res.json({ data: await getGroupById(id) });
    }
    catch (err) {
        next(err);
    }
}
export async function store(req, res, next) {
    try {
        const { quizId } = quizIdParamSchema.parse(req.params);
        const input = createGroupSchema.parse(req.body);
        res.status(201).json({ data: await createGroup(getAuthUser(req), quizId, input) });
    }
    catch (err) {
        next(err);
    }
}
export async function update(req, res, next) {
    try {
        const { id } = groupIdParamSchema.parse(req.params);
        const input = updateGroupSchema.parse(req.body);
        res.json({ data: await updateGroup(getAuthUser(req), id, input) });
    }
    catch (err) {
        next(err);
    }
}
export async function remove(req, res, next) {
    try {
        const { id } = groupIdParamSchema.parse(req.params);
        await deleteGroup(getAuthUser(req), id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
export async function listMembers(req, res, next) {
    try {
        const { id } = groupIdParamSchema.parse(req.params);
        res.json({ data: await listGroupMembers(getAuthUser(req), id) });
    }
    catch (err) {
        next(err);
    }
}
export async function addMember(req, res, next) {
    try {
        const { id } = groupIdParamSchema.parse(req.params);
        const { student_id } = addGroupMemberSchema.parse(req.body);
        res.status(201).json({ data: await addGroupMember(getAuthUser(req), id, student_id) });
    }
    catch (err) {
        next(err);
    }
}
export async function removeMember(req, res, next) {
    try {
        const { id, studentId } = groupStudentParamsSchema.parse(req.params);
        await removeGroupMember(getAuthUser(req), id, studentId);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=group.controller.js.map