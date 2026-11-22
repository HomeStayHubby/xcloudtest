import type { Actor } from '../../shared/permissions.js';
import type { Group, CreateGroup, UpdateGroup, GroupMember, StudentAccount } from '@elitequest/shared';
export type GroupWithMembers = Group & {
    members: StudentAccount[];
};
export declare function listGroupsByQuiz(user: Actor, quizId: number): Promise<GroupWithMembers[]>;
export declare function getGroupById(id: number): Promise<Group>;
export declare function createGroup(user: Actor, quizId: number, input: CreateGroup): Promise<Group>;
export declare function updateGroup(user: Actor, id: number, input: UpdateGroup): Promise<Group>;
export declare function deleteGroup(user: Actor, id: number): Promise<void>;
export declare function listGroupMembers(user: Actor, groupId: number): Promise<StudentAccount[]>;
export declare function addGroupMember(user: Actor, groupId: number, studentId: number): Promise<GroupMember>;
export declare function removeGroupMember(user: Actor, groupId: number, studentId: number): Promise<void>;
export declare function getStudentGroup(quizId: number, studentId: number): Promise<Group | undefined>;
//# sourceMappingURL=group.service.d.ts.map