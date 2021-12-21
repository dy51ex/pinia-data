var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@vue/composition-api", "axios", "lodash/keyBy"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useEntity = exports.EntityAdapter = void 0;
    const composition_api_1 = require("@vue/composition-api");
    const axios_1 = __importDefault(require("axios"));
    const keyBy_1 = __importDefault(require("lodash/keyBy"));
    class EntityAdapter {
        constructor(entityName, options = { axionsInstance: axios_1.default }) {
            this.entityName = entityName;
            this.options = options;
            this.entities = (0, composition_api_1.ref)([]); // issue https://github.com/vuejs/vue-next/issues/2136
            this.loading = (0, composition_api_1.ref)(false);
            this.idKey = "id";
            this.entitiesMap = (0, composition_api_1.computed)(() => (0, keyBy_1.default)(this.entities.value, this.idKey));
            this.axios = options.axionsInstance || axios_1.default;
            this.plunarName = this.options.plunarName || `${this.entityName}s`;
            this.idKey = this.options.idKey || "id";
        }
        state(state) {
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
        add(entity) {
            return __awaiter(this, void 0, void 0, function* () {
                this.loading.value = true;
                let result;
                try {
                    result = (yield this.axios.post(this.plunarName, entity)).data;
                    if (!result) {
                        return null;
                    }
                    this.entities.value.push(result);
                }
                catch (error) {
                    console.error(error);
                }
                this.loading.value = false;
                return result || null;
            });
        }
        update(entity) {
            return __awaiter(this, void 0, void 0, function* () {
                this.loading.value = true;
                let result;
                try {
                    result = (yield this.axios.put(`${this.plunarName}/${entity[this.idKey]}`, entity)).data;
                    if (!result) {
                        return null;
                    }
                    if (!this.entitiesMap.value[result.id]) {
                        this.entities.value.push(result);
                        return result;
                    }
                    this.entities.value.splice(this.getIndex(result.id), 1, result);
                }
                catch (error) {
                    console.error(error);
                }
                this.loading.value = false;
                return result || null;
            });
        }
        getIndex(id) {
            return this.entities.value.findIndex((entity) => entity[this.idKey] === id);
        }
        delete(id) {
            return __awaiter(this, void 0, void 0, function* () {
                this.loading.value = true;
                try {
                    yield this.axios.delete(`${this.plunarName}/${id}`);
                    this.entities.value.splice(this.getIndex(id), 1);
                    return this.entities;
                }
                catch (error) {
                    console.error(error);
                }
                this.loading.value = false;
                return this.entities;
            });
        }
        getAll() {
            return __awaiter(this, void 0, void 0, function* () {
                this.loading.value = true;
                try {
                    this.entities.value = (yield this.axios.get(this.plunarName)).data;
                }
                catch (error) {
                    console.error(error);
                }
                this.loading.value = false;
                return this.entities;
            });
        }
        getById(id) {
            return __awaiter(this, void 0, void 0, function* () {
                this.loading.value = true;
                let result;
                try {
                    result = (yield this.axios.get(`${this.plunarName}/${id}`)).data;
                    if (!result) {
                        return null;
                    }
                    if (!this.entitiesMap.value[id]) {
                        this.entities.value.push(result);
                        return result;
                    }
                    this.entities.value.splice(this.getIndex(id), 1, result);
                }
                catch (error) {
                    console.error(error);
                }
                this.loading.value = false;
                return result || null;
            });
        }
        getWithQuery(queryParams) {
            return __awaiter(this, void 0, void 0, function* () {
                this.loading.value = true;
                let result;
                try {
                    result = (yield this.axios.get(this.plunarName, { params: queryParams })).data;
                    if (!result) {
                        return [];
                    }
                    result.forEach((entity) => {
                        if (!this.entitiesMap.value[entity[this.idKey]]) {
                            this.entities.value.push(entity);
                            return;
                        }
                        this.entities.value.splice(this.getIndex(entity[this.idKey]), 1, entity);
                    });
                }
                catch (error) {
                    console.error(error);
                }
                this.loading.value = false;
                return result || [];
            });
        }
        findById(id) {
            return this.entitiesMap.value[id];
        }
    }
    exports.EntityAdapter = EntityAdapter;
    const useEntity = (entityName, options = {}) => {
        const service = new EntityAdapter(entityName, options);
        return {
            state: (state) => service.state(state),
            actions: service.actions(),
        };
    };
    exports.useEntity = useEntity;
});
