import { createStudentAccountSchema, updateStudentAccountSchema, setStudentPasswordSchema, bulkStudentActionSchema, } from '@elitequest/shared';
import { classIdParamSchema } from './student.validators.js';
import { idParamSchema } from '../classes/class.validators.js';
import { getAuthUser } from '../auth/auth.middleware.js';
import { listStudentsByClass, getStudentAccountById, createStudentAccount, updateStudentAccount, setStudentPassword, deleteStudentAccount, bulkStudentAction, importStudentsFromXlsx, exportStudentsToXlsx, } from './student.service.js';
// Rosters are readable by any lecturer (they may teach the class); all
// mutations are advisor/admin only (enforced in the service).
export async function index(req, res, next) {
    try {
        const { id: classId } = classIdParamSchema.parse(req.params);
        res.json({ data: await listStudentsByClass(classId) });
    }
    catch (err) {
        next(err);
    }
}
export async function store(req, res, next) {
    try {
        const { id: classId } = classIdParamSchema.parse(req.params);
        const input = createStudentAccountSchema.parse(req.body);
        const user = getAuthUser(req);
        res.status(201).json({ data: await createStudentAccount(user, classId, input) });
    }
    catch (err) {
        next(err);
    }
}
export async function show(req, res, next) {
    try {
        const { id } = idParamSchema.parse(req.params);
        res.json({ data: await getStudentAccountById(id) });
    }
    catch (err) {
        next(err);
    }
}
export async function update(req, res, next) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const input = updateStudentAccountSchema.parse(req.body);
        const user = getAuthUser(req);
        res.json({ data: await updateStudentAccount(user, id, input) });
    }
    catch (err) {
        next(err);
    }
}
export async function setPassword(req, res, next) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const input = setStudentPasswordSchema.parse(req.body);
        const user = getAuthUser(req);
        await setStudentPassword(user, id, input.password);
        res.json({ data: null });
    }
    catch (err) {
        next(err);
    }
}
export async function remove(req, res, next) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const user = getAuthUser(req);
        await deleteStudentAccount(user, id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
export async function bulk(req, res, next) {
    try {
        const { id: classId } = classIdParamSchema.parse(req.params);
        const input = bulkStudentActionSchema.parse(req.body);
        const user = getAuthUser(req);
        res.json({ data: await bulkStudentAction(user, classId, input) });
    }
    catch (err) {
        next(err);
    }
}
export async function importXlsx(req, res, next) {
    try {
        const { id: classId } = classIdParamSchema.parse(req.params);
        if (!Buffer.isBuffer(req.body)) {
            throw new Error('Expected raw XLSX body');
        }
        const user = getAuthUser(req);
        res.json({ data: await importStudentsFromXlsx(user, classId, req.body) });
    }
    catch (err) {
        next(err);
    }
}
export async function exportXlsx(req, res, next) {
    try {
        const { id: classId } = classIdParamSchema.parse(req.params);
        const user = getAuthUser(req);
        const buffer = await exportStudentsToXlsx(user, classId);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="class-${classId}-students.xlsx"`);
        res.send(buffer);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=student.controller.js.map