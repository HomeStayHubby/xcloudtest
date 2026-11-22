import { joinClassSchema } from '@elitequest/shared';
import { joinClass } from './join.service.js';
export async function store(req, res, next) {
    try {
        const input = joinClassSchema.parse(req.body);
        const student = await joinClass(input);
        req.session.studentId = student.id;
        res.json({ data: student });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
//# sourceMappingURL=join.controller.js.map