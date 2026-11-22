import type { User, LoginUser } from '@elitequest/shared';
export declare function getUserById(id: number): Promise<User | undefined>;
export declare function authenticateUser(input: LoginUser): Promise<User>;
//# sourceMappingURL=auth.service.d.ts.map