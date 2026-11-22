import type { Request, Response, NextFunction } from 'express';
export declare function index(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function store(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function show(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function update(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function setPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function remove(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function bulk(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function importXlsx(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function exportXlsx(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=student.controller.d.ts.map