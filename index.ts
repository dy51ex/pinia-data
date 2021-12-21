import { ref, computed, Ref } from "@vue/composition-api";
import axios, { AxiosInstance } from "axios";
import keyBy from "lodash/keyBy";
import Vue from "vue";
import CompositionApi from "@vue/composition-api";

Vue.use(CompositionApi);

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface EntityOptions {
  plunarName?: string;
  axionsInstance?: AxiosInstance;
  idKey?: string;
}

export class EntityAdapter<
  T extends Record<string, unknown> & {
    [key: EntityAdapter<T>["idKey"]]: string | number;
  }
> {
  public entities = ref<T[]>([]) as Ref<T[]>; // issue https://github.com/vuejs/vue-next/issues/2136
  public loading = ref<boolean>(false);
  private plunarName: string;
  private axios: AxiosInstance;
  private idKey: string = "id";
  private entitiesMap = computed(() => keyBy(this.entities.value, this.idKey));

  constructor(
    private entityName: string,
    private options: EntityOptions = { axionsInstance: axios }
  ) {
    this.axios = options.axionsInstance || axios;
    this.plunarName = this.options.plunarName || `${this.entityName}s`;
    this.idKey = this.options.idKey || "id";
  }

  public state(state?: { entities: T[]; loading?: boolean }) {
    if (state) {
      this.entities.value = state.entities;
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

  async add(entity: PartialBy<T, EntityAdapter<T>["idKey"]>) {
    this.loading.value = true;
    let result: T | undefined;
    try {
      result = (await this.axios.post(this.plunarName, entity)).data;
      if (!result) {
        return null;
      }
      this.entities.value.push(result);
    } catch (error) {
      console.error(error);
    }
    this.loading.value = false;
    return result || null;
  }

  async update(entity: PartialBy<T, EntityAdapter<T>["idKey"]>) {
    this.loading.value = true;
    let result: T | undefined;
    try {
      result = (
        await this.axios.put(`${this.plunarName}/${entity[this.idKey]}`, entity)
      ).data;
      if (!result) {
        return null;
      }
      if (!this.entitiesMap.value[result.id]) {
        this.entities.value.push(result);
        return result;
      }
      this.entities.value.splice(this.getIndex(result.id), 1, result);
    } catch (error) {
      console.error(error);
    }
    this.loading.value = false;
    return result || null;
  }

  private getIndex(id: string | number) {
    return this.entities.value.findIndex((entity) => entity[this.idKey] === id);
  }

  async delete(id: number | string) {
    this.loading.value = true;
    try {
      await this.axios.delete(`${this.plunarName}/${id}`);
      this.entities.value.splice(this.getIndex(id), 1);
      return this.entities;
    } catch (error) {
      console.error(error);
    }
    this.loading.value = false;
    return this.entities;
  }

  async getAll() {
    this.loading.value = true;
    try {
      this.entities.value = (await this.axios.get(this.plunarName)).data;
    } catch (error) {
      console.error(error);
    }
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
      if (!this.entitiesMap.value[id]) {
        this.entities.value.push(result);
        return result;
      }
      this.entities.value.splice(this.getIndex(id), 1, result);
    } catch (error) {
      console.error(error);
    }
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
        if (!this.entitiesMap.value[entity[this.idKey]]) {
          this.entities.value.push(entity);
          return;
        }
        this.entities.value.splice(
          this.getIndex(entity[this.idKey]),
          1,
          entity
        );
      });
    } catch (error) {
      console.error(error);
    }
    this.loading.value = false;
    return result || [];
  }

  findById(id: number | string) {
    return this.entitiesMap.value[id];
  }
}

export const useEntity = <
  T extends Record<string, unknown> & {
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
