import { Ref } from "@vue/composition-api";
import { AxiosInstance } from "axios";
declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
declare type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export interface EntityOptions {
    plunarName?: string;
    axionsInstance?: AxiosInstance;
    idKey?: string;
}
export declare class EntityAdapter<T extends Record<string, unknown> & {
    [key: EntityAdapter<T>["idKey"]]: string | number;
}> {
    private entityName;
    private options;
    entities: Ref<T[]>;
    loading: Ref<boolean>;
    private plunarName;
    private axios;
    private idKey;
    private entitiesMap;
    constructor(entityName: string, options?: EntityOptions);
    state(state?: {
        entities: T[];
        loading?: boolean;
    }): {
        entities: Ref<T[]>;
        loading: Ref<boolean>;
    };
    actions(): {
        getAll: () => Promise<Ref<T[]>>;
        getById: (id: string | number) => Promise<T | null>;
        add: (entity: PartialBy<T, string>) => Promise<T | null>;
        delete: (id: string | number) => Promise<Ref<T[]>>;
        update: (entity: PartialBy<T, string>) => Promise<T | null>;
        getWithQuery: (queryParams: Record<string, unknown>) => Promise<T[]>;
        findById: (id: string | number) => T;
    };
    add(entity: PartialBy<T, EntityAdapter<T>["idKey"]>): Promise<T | null>;
    update(entity: PartialBy<T, EntityAdapter<T>["idKey"]>): Promise<T | null>;
    private getIndex;
    delete(id: number | string): Promise<Ref<T[]>>;
    getAll(): Promise<Ref<T[]>>;
    getById(id: number | string): Promise<T | null>;
    getWithQuery(queryParams: Record<string, unknown>): Promise<T[]>;
    findById(id: number | string): T;
}
export declare const useEntity: <T extends Record<string, unknown> & {
    [key: string]: string | number;
}>(entityName: string, options?: EntityOptions) => {
    state: (state?: {
        entities: T[];
        loading?: boolean | undefined;
    } | undefined) => {
        entities: Ref<T[]>;
        loading: Ref<boolean>;
    };
    actions: {
        getAll: () => Promise<Ref<T[]>>;
        getById: (id: number | string) => Promise<T | null>;
        add: (entity: PartialBy<T, string>) => Promise<T | null>;
        delete: (id: number | string) => Promise<Ref<T[]>>;
        update: (entity: PartialBy<T, string>) => Promise<T | null>;
        getWithQuery: (queryParams: Record<string, unknown>) => Promise<T[]>;
        findById: (id: number | string) => T;
    };
};
export {};
