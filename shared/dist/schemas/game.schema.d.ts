import { z } from 'zod';
declare const wheelSegmentSchema: z.ZodObject<{
    label: z.ZodString;
    weight: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    label: string;
    weight: number;
}, {
    label: string;
    weight?: number | undefined;
}>;
export declare const wheelSettingsSchema: z.ZodObject<{
    segments: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        weight: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        weight: number;
    }, {
        label: string;
        weight?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    segments: {
        label: string;
        weight: number;
    }[];
}, {
    segments: {
        label: string;
        weight?: number | undefined;
    }[];
}>;
declare const jeopardyCellSchema: z.ZodObject<{
    id: z.ZodString;
    category_id: z.ZodString;
    points: z.ZodNumber;
    prompt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    prompt: string;
    points: number;
    category_id: string;
}, {
    id: string;
    prompt: string;
    points: number;
    category_id: string;
}>;
declare const jeopardyCategorySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
}, {
    id: string;
    name: string;
}>;
export declare const jeopardySettingsSchema: z.ZodObject<{
    categories: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>, "many">;
    cells: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        category_id: z.ZodString;
        points: z.ZodNumber;
        prompt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        prompt: string;
        points: number;
        category_id: string;
    }, {
        id: string;
        prompt: string;
        points: number;
        category_id: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    categories: {
        id: string;
        name: string;
    }[];
    cells: {
        id: string;
        prompt: string;
        points: number;
        category_id: string;
    }[];
}, {
    categories: {
        id: string;
        name: string;
    }[];
    cells: {
        id: string;
        prompt: string;
        points: number;
        category_id: string;
    }[];
}>;
export declare const gameSettingsSchema: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
    segments: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        weight: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        weight: number;
    }, {
        label: string;
        weight?: number | undefined;
    }>, "many">;
    kind: z.ZodLiteral<"wheel_of_fortune">;
}, "strip", z.ZodTypeAny, {
    segments: {
        label: string;
        weight: number;
    }[];
    kind: "wheel_of_fortune";
}, {
    segments: {
        label: string;
        weight?: number | undefined;
    }[];
    kind: "wheel_of_fortune";
}>, z.ZodObject<{
    categories: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>, "many">;
    cells: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        category_id: z.ZodString;
        points: z.ZodNumber;
        prompt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        prompt: string;
        points: number;
        category_id: string;
    }, {
        id: string;
        prompt: string;
        points: number;
        category_id: string;
    }>, "many">;
    kind: z.ZodLiteral<"jeopardy">;
}, "strip", z.ZodTypeAny, {
    categories: {
        id: string;
        name: string;
    }[];
    cells: {
        id: string;
        prompt: string;
        points: number;
        category_id: string;
    }[];
    kind: "jeopardy";
}, {
    categories: {
        id: string;
        name: string;
    }[];
    cells: {
        id: string;
        prompt: string;
        points: number;
        category_id: string;
    }[];
    kind: "jeopardy";
}>]>;
export declare const gameSchema: z.ZodObject<{
    id: z.ZodNumber;
    class_id: z.ZodNumber;
    name: z.ZodString;
    type: z.ZodEnum<["wheel_of_fortune", "jeopardy"]>;
    settings: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        segments: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            weight: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            weight: number;
        }, {
            label: string;
            weight?: number | undefined;
        }>, "many">;
        kind: z.ZodLiteral<"wheel_of_fortune">;
    }, "strip", z.ZodTypeAny, {
        segments: {
            label: string;
            weight: number;
        }[];
        kind: "wheel_of_fortune";
    }, {
        segments: {
            label: string;
            weight?: number | undefined;
        }[];
        kind: "wheel_of_fortune";
    }>, z.ZodObject<{
        categories: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>, "many">;
        cells: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            category_id: z.ZodString;
            points: z.ZodNumber;
            prompt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }, {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }>, "many">;
        kind: z.ZodLiteral<"jeopardy">;
    }, "strip", z.ZodTypeAny, {
        categories: {
            id: string;
            name: string;
        }[];
        cells: {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }[];
        kind: "jeopardy";
    }, {
        categories: {
            id: string;
            name: string;
        }[];
        cells: {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }[];
        kind: "jeopardy";
    }>]>;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    id: number;
    class_id: number;
    created_at: string | Date;
    type: "wheel_of_fortune" | "jeopardy";
    name: string;
    settings: {
        segments: {
            label: string;
            weight: number;
        }[];
        kind: "wheel_of_fortune";
    } | {
        categories: {
            id: string;
            name: string;
        }[];
        cells: {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }[];
        kind: "jeopardy";
    };
}, {
    id: number;
    class_id: number;
    created_at: string | Date;
    type: "wheel_of_fortune" | "jeopardy";
    name: string;
    settings: {
        segments: {
            label: string;
            weight?: number | undefined;
        }[];
        kind: "wheel_of_fortune";
    } | {
        categories: {
            id: string;
            name: string;
        }[];
        cells: {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }[];
        kind: "jeopardy";
    };
}>;
export declare const createGameSchema: z.ZodObject<Omit<{
    id: z.ZodNumber;
    class_id: z.ZodNumber;
    name: z.ZodString;
    type: z.ZodEnum<["wheel_of_fortune", "jeopardy"]>;
    settings: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        segments: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            weight: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            weight: number;
        }, {
            label: string;
            weight?: number | undefined;
        }>, "many">;
        kind: z.ZodLiteral<"wheel_of_fortune">;
    }, "strip", z.ZodTypeAny, {
        segments: {
            label: string;
            weight: number;
        }[];
        kind: "wheel_of_fortune";
    }, {
        segments: {
            label: string;
            weight?: number | undefined;
        }[];
        kind: "wheel_of_fortune";
    }>, z.ZodObject<{
        categories: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>, "many">;
        cells: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            category_id: z.ZodString;
            points: z.ZodNumber;
            prompt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }, {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }>, "many">;
        kind: z.ZodLiteral<"jeopardy">;
    }, "strip", z.ZodTypeAny, {
        categories: {
            id: string;
            name: string;
        }[];
        cells: {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }[];
        kind: "jeopardy";
    }, {
        categories: {
            id: string;
            name: string;
        }[];
        cells: {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }[];
        kind: "jeopardy";
    }>]>;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "id" | "created_at">, "strip", z.ZodTypeAny, {
    class_id: number;
    type: "wheel_of_fortune" | "jeopardy";
    name: string;
    settings: {
        segments: {
            label: string;
            weight: number;
        }[];
        kind: "wheel_of_fortune";
    } | {
        categories: {
            id: string;
            name: string;
        }[];
        cells: {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }[];
        kind: "jeopardy";
    };
}, {
    class_id: number;
    type: "wheel_of_fortune" | "jeopardy";
    name: string;
    settings: {
        segments: {
            label: string;
            weight?: number | undefined;
        }[];
        kind: "wheel_of_fortune";
    } | {
        categories: {
            id: string;
            name: string;
        }[];
        cells: {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }[];
        kind: "jeopardy";
    };
}>;
export declare const updateGameSchema: z.ZodObject<Omit<{
    class_id: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<["wheel_of_fortune", "jeopardy"]>>;
    name: z.ZodOptional<z.ZodString>;
    settings: z.ZodOptional<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        segments: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            weight: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            weight: number;
        }, {
            label: string;
            weight?: number | undefined;
        }>, "many">;
        kind: z.ZodLiteral<"wheel_of_fortune">;
    }, "strip", z.ZodTypeAny, {
        segments: {
            label: string;
            weight: number;
        }[];
        kind: "wheel_of_fortune";
    }, {
        segments: {
            label: string;
            weight?: number | undefined;
        }[];
        kind: "wheel_of_fortune";
    }>, z.ZodObject<{
        categories: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>, "many">;
        cells: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            category_id: z.ZodString;
            points: z.ZodNumber;
            prompt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }, {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }>, "many">;
        kind: z.ZodLiteral<"jeopardy">;
    }, "strip", z.ZodTypeAny, {
        categories: {
            id: string;
            name: string;
        }[];
        cells: {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }[];
        kind: "jeopardy";
    }, {
        categories: {
            id: string;
            name: string;
        }[];
        cells: {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }[];
        kind: "jeopardy";
    }>]>>;
}, "class_id" | "type">, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    settings?: {
        segments: {
            label: string;
            weight: number;
        }[];
        kind: "wheel_of_fortune";
    } | {
        categories: {
            id: string;
            name: string;
        }[];
        cells: {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }[];
        kind: "jeopardy";
    } | undefined;
}, {
    name?: string | undefined;
    settings?: {
        segments: {
            label: string;
            weight?: number | undefined;
        }[];
        kind: "wheel_of_fortune";
    } | {
        categories: {
            id: string;
            name: string;
        }[];
        cells: {
            id: string;
            prompt: string;
            points: number;
            category_id: string;
        }[];
        kind: "jeopardy";
    } | undefined;
}>;
export type WheelSegment = z.infer<typeof wheelSegmentSchema>;
export type JeopardyCategory = z.infer<typeof jeopardyCategorySchema>;
export type JeopardyCell = z.infer<typeof jeopardyCellSchema>;
export type GameSettings = z.infer<typeof gameSettingsSchema>;
export type Game = z.infer<typeof gameSchema>;
export type CreateGame = z.infer<typeof createGameSchema>;
export type UpdateGame = z.infer<typeof updateGameSchema>;
export {};
//# sourceMappingURL=game.schema.d.ts.map