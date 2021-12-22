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

type EntityMethod =
  | "add"
  | "update"
  | "delete"
  | "getAll"
  | "getById"
  | "getWithQuery";

export interface EntityOptions {
  plunarName?: string;
  axiosInstance?: AxiosInstance;
  idKey?: string;
  onError?: { [key in EntityMethod]?: () => void };
  onSuccess?: { [key in EntityMethod]?: () => void };
}

export class EntityAdapter<
  T extends { [key: EntityAdapter<T>["idKey"]]: string | number }
> {
  private onSuccess: EntityOptions["onSuccess"] = {};
  private onError: EntityOptions["onError"] = {};
  private entities: T[] = [];
  public loading = { value: false };
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
    this.onError = options.onError;
    this.onSuccess = options.onSuccess;
  }

  private get _entities() {
    return this.entities;
  }

  private set _entities(value) {
    this.entitiesMap = keyBy<T>(value, this.idKey);
    this.entities.splice(0, this.entities.length, ...value);
  }

  public state(state?: { entities: T[]; loading?: boolean }) {
    if (state) {
      this._entities = state.entities;
      this.loading.value = state.loading || false;
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

  private getIndex(id: string | number) {
    return this._entities.findIndex((entity) => entity[this.idKey] === id);
  }

  async add(entity: T) {
    this.loading.value = true;
    let result: T | undefined;
    try {
      result = (await this.axios.post(this.plunarName, entity)).data;
      if (!result) {
        return null;
      }
      this._entities.push(result);
    } catch (error) {
      this.onError?.add && this.onError.add();
    }

    this.onSuccess?.add && this.onSuccess.add();
    this.loading.value = false;
    return result || null;
  }

  async update(entity: T) {
    this.loading.value = true;
    let result: T | undefined;
    try {
      result = (
        await this.axios.put(`${this.plunarName}/${entity[this.idKey]}`, entity)
      ).data;
      if (!result) {
        return null;
      }
      if (!this.entitiesMap[result.id]) {
        this._entities.push(result);
        return result;
      }
      this._entities.splice(this.getIndex(result.id), 1, result);
    } catch (error) {
      this.onError?.update && this.onError.update();
    }
    this.onSuccess?.update && this.onSuccess.update();
    this.loading.value = false;
    return result || null;
  }

  async delete(id: number | string) {
    this.loading.value = true;
    try {
      await this.axios.delete(`${this.plunarName}/${id}`);
      this._entities.splice(this.getIndex(id), 1);
      return this.entities;
    } catch (error) {
      this.onError?.delete && this.onError.delete();
    }
    this.onSuccess?.delete && this.onSuccess.delete();
    this.loading.value = false;
    return this.entities;
  }

  async getAll() {
    this.loading.value = true;
    try {
      this._entities = (await this.axios.get(this.plunarName)).data;
    } catch (error) {
      this.onError?.getAll && this.onError.getAll();
    }
    this.onSuccess?.getAll && this.onSuccess.getAll();
    this.loading.value = false;
    return this.entities;
  }

  async getById(id: number | string) {
    this.loading.value = true;
    let result: T | undefined;
    try {
      result = (await this.axios.get<T>(`${this.plunarName}/${id}`)).data;
      if (!result) {
        return null;
      }
      if (!this.entitiesMap[id]) {
        this._entities.push(result);
        return result;
      }
      this._entities.splice(this.getIndex(id), 1, result);
    } catch (error) {
      this.onError?.getById && this.onError.getById();
    }
    this.onSuccess?.getById && this.onSuccess.getById();
    this.loading.value = false;
    return result || null;
  }

  async getWithQuery(queryParams: Record<string, unknown>) {
    this.loading.value = true;
    let result: T[] | undefined;
    try {
      result = (
        await this.axios.get<T[]>(this.plunarName, { params: queryParams })
      ).data;
      if (!result) {
        return [];
      }
      result.forEach((entity) => {
        if (!this.entitiesMap[entity[this.idKey]]) {
          this._entities.push(entity);
          return;
        }
        this._entities.splice(this.getIndex(entity[this.idKey]), 1, entity);
      });
    } catch (error) {
      this.onError?.getWithQuery && this.onError.getWithQuery();
    }
    this.onSuccess?.getWithQuery && this.onSuccess.getWithQuery();
    this.loading.value = false;
    return result || [];
  }

  findById(id: number | string) {
    return this.entitiesMap[id];
  }
}

export const useEntity = <T extends { [key: string]: any }>(
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
