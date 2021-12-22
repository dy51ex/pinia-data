import axios, { AxiosInstance } from "axios";

interface Dictionary<T> {
  [index: string]: T;
}

const keyBy = <T>(array: any[], key: string | number): Dictionary<T> => {
  return array.reduce((acc, cur) => {
    acc[cur[key]] = cur;
    return acc;
  }, {});
};

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface EntityOptions {
  plunarName?: string;
  axiosInstance?: AxiosInstance;
  idKey?: string;
}

export class EntityAdapter<
  T extends {
    [key: EntityAdapter<T>["idKey"]]: string | number;
  }
> {
  get entities() {
    return this._entities;
  }
  set entities(value) {
    this.entitiesMap = keyBy<T>(value, this.idKey);
    this._entities = value;
  }
  private _entities: T[] = [];
  public loading = false;
  private plunarName: string;
  private axios: AxiosInstance;
  private idKey: string = "id";
  private entitiesMap: any = {};
  constructor(
    private entityName: string,
    private options: EntityOptions = { axiosInstance: axios }
  ) {
    this.axios = options.axiosInstance || axios;
    this.plunarName = this.options.plunarName || `${this.entityName}s`;
    this.idKey = this.options.idKey || "id";
  }
  public state(state?: { entities: T[]; loading?: boolean }) {
    if (state) {
      this.entities = state.entities;
      this.loading = state.loading || false;
    }
    return {
      entities: this.entities,
      loading: this.loading,
    };
  }

  actions() {
    return {
      getAll: this.getAll.bind(this),
      getById: this.getById.bind(this),
      add: this.add.bind(this),
      delete: this.delete.bind(this),
      update: this.update.bind(this),
      getWithQuery: this.getWithQuery.bind(this),

      findById: this.findById.bind(this),
    };
  }

  async add(entity: PartialBy<T, EntityAdapter<T>["idKey"]>) {
    this.loading = true;
    let result: T | undefined;
    try {
      result = (await this.axios.post(this.plunarName, entity)).data;
      if (!result) {
        return null;
      }
      this.entities.push(result);
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
    return result || null;
  }

  async update(entity: PartialBy<T, EntityAdapter<T>["idKey"]>) {
    this.loading = true;
    let result: T | undefined;
    try {
      result = (
        await this.axios.put(`${this.plunarName}/${entity[this.idKey]}`, entity)
      ).data;
      if (!result) {
        return null;
      }
      if (!this.entitiesMap[result.id]) {
        this.entities.push(result);
        return result;
      }
      this.entities.splice(this.getIndex(result.id), 1, result);
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
    return result || null;
  }

  private getIndex(id: string | number) {
    return this.entities.findIndex((entity) => entity[this.idKey] === id);
  }

  async delete(id: number | string) {
    this.loading = true;
    try {
      await this.axios.delete(`${this.plunarName}/${id}`);
      this.entities.splice(this.getIndex(id), 1);
      return this.entities;
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
    return this.entities;
  }

  async getAll() {
    this.loading = true;
    try {
      this.entities = (await this.axios.get(this.plunarName)).data;
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
    return this.entities;
  }

  async getById(id: number | string) {
    this.loading = true;
    let result: T | undefined;
    try {
      result = (await this.axios.get<T>(`${this.plunarName}/${id}`)).data;
      if (!result) {
        return null;
      }
      if (!this.entitiesMap[id]) {
        this.entities.push(result);
        return result;
      }
      this.entities.splice(this.getIndex(id), 1, result);
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
    return result || null;
  }

  async getWithQuery(queryParams: Record<string, unknown>) {
    this.loading = true;
    let result: T[] | undefined;
    try {
      result = (
        await this.axios.get<T[]>(this.plunarName, { params: queryParams })
      ).data;
      if (!result) {
        return [];
      }
      !this.entitiesMap; // ?
      result.forEach((entity) => {
        if (!this.entitiesMap[entity[this.idKey]]) {
          this.entities.push(entity);
          return;
        }
        this.entities.splice(this.getIndex(entity[this.idKey]), 1, entity);
      });
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
    return result || [];
  }

  findById(id: number | string) {
    return this.entitiesMap[id];
  }
}

export const useEntity = <
  T extends {
    [key: EntityAdapter<T>["idKey"] | string]: any;
  }
>(
  entityName: string,
  options: EntityOptions = {}
) => {
  const service = new EntityAdapter<T>(entityName, options);
  return {
    state: (state?: { entities: T[]; loading?: boolean }) =>
      service.state(state),
    actions: service.actions(),
  };
};
