import { useEntity } from "../index";
import axios from "axios";
import Vue from "vue";
import CompositionApi from "@vue/composition-api";

Vue.use(CompositionApi);

jest.mock("axios");

describe("pinia-data", () => {
  const FAKE_ENTITY_NAME = "FAKE_ENTITY_NAME";
  const FAKE_ENTITY = { id: 1, name: FAKE_ENTITY_NAME };
  let entityService: ReturnType<typeof useEntity>;

  beforeEach(() => {
    entityService = useEntity(FAKE_ENTITY_NAME);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("return entities with getAll", async () => {
      axios.get = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: [{ ...FAKE_ENTITY }] }));
      const result = await entityService.actions.getAll();
      expect(result).toEqual([FAKE_ENTITY]);
      expect(entityService.state().entities).toEqual([FAKE_ENTITY]);
    });

    it("return empty array and write error in console when request rejected", async () => {
      axios.get = jest.fn().mockReturnValue(Promise.reject());
      const result = await entityService.actions.getAll();
      expect(result).toEqual([]);
      expect(entityService.state().entities).toEqual([]);
    });
  });

  describe("getById", () => {
    it("return entity with getById", async () => {
      axios.get = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: { ...FAKE_ENTITY } }));
      const result = await entityService.actions.getById(1);
      expect(result).toEqual(FAKE_ENTITY);
      expect(entityService.state().entities).toEqual([FAKE_ENTITY]);
    });
    it("return null if server response with empty data", async () => {
      axios.get = jest.fn().mockReturnValue(Promise.resolve({ data: null }));
      const result = await entityService.actions.getById(1);
      expect(result).toEqual(null);
      expect(entityService.state().entities).toEqual([]);
    });
    it("return entity and replace it in state", async () => {
      entityService.state({
        entities: [{ id: 1, name: "FAKE_OLD_NAME" }],
      });
      axios.get = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: { ...FAKE_ENTITY } }));
      const result = await entityService.actions.getById(1);
      expect(result).toEqual(FAKE_ENTITY);
      expect(entityService.state().entities).toEqual([FAKE_ENTITY]);
    });
    it("return empty array and write error in console when request rejected", async () => {
      axios.get = jest.fn().mockReturnValue(Promise.reject());
      const result = await entityService.actions.getById(1);
      expect(result).toEqual(null);
      expect(entityService.state().entities).toEqual([]);
    });
  });

  describe("add", () => {
    it("return entity with add after success save", async () => {
      axios.post = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: { ...FAKE_ENTITY } }));
      const result = await entityService.actions.add({ ...FAKE_ENTITY });
      expect(result).toEqual(FAKE_ENTITY);
      expect(entityService.state().entities).toEqual([FAKE_ENTITY]);
    });

    it("return entity after success save", async () => {
      axios.post = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: { ...FAKE_ENTITY } }));
      const result = await entityService.actions.add({ ...FAKE_ENTITY });
      expect(result).toEqual(FAKE_ENTITY);
      expect(entityService.state().entities).toEqual([FAKE_ENTITY]);
    });

    it("return null if server response with empty data", async () => {
      axios.post = jest.fn().mockReturnValue(Promise.resolve({ data: null }));
      const result = await entityService.actions.add({ ...FAKE_ENTITY });
      expect(result).toEqual(null);
      expect(entityService.state().entities).toEqual([]);
    });

    it("return empty array on add and write error in console when request rejected", async () => {
      axios.post = jest.fn().mockReturnValue(Promise.reject());
      const result = await entityService.actions.add({ ...FAKE_ENTITY });
      expect(result).toEqual(null);
      expect(entityService.state().entities).toEqual([]);
    });
  });

  describe("update", () => {
    it("return entity with update after success save", async () => {
      axios.put = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: { ...FAKE_ENTITY } }));
      const result = await entityService.actions.update({ ...FAKE_ENTITY });
      expect(result).toEqual(FAKE_ENTITY);
      expect(entityService.state().entities).toEqual([FAKE_ENTITY]);
    });

    it("return entity after success save", async () => {
      axios.put = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: { ...FAKE_ENTITY } }));
      const result = await entityService.actions.update({ ...FAKE_ENTITY });
      expect(result).toEqual(FAKE_ENTITY);
      expect(entityService.state().entities).toEqual([FAKE_ENTITY]);
    });

    it("return null if server response with empty data", async () => {
      axios.put = jest.fn().mockReturnValue(Promise.resolve({ data: null }));
      const result = await entityService.actions.update({ ...FAKE_ENTITY });
      expect(result).toEqual(null);
      expect(entityService.state().entities).toEqual([]);
    });

    it("return empty array and write error in console when request rejected", async () => {
      axios.put = jest.fn().mockReturnValue(Promise.reject());
      const result = await entityService.actions.update({ ...FAKE_ENTITY });
      expect(result).toEqual(null);
      expect(entityService.state().entities).toEqual([]);
    });

    it("return entity and replace it in state", async () => {
      entityService.state({
        entities: [{ id: 1, name: "FAKE_OLD_NAME" }],
      });
      axios.put = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: { ...FAKE_ENTITY } }));
      const result = await entityService.actions.update({ ...FAKE_ENTITY });
      expect(result).toEqual(FAKE_ENTITY);
      expect(entityService.state().entities).toEqual([FAKE_ENTITY]);
    });
  });

  describe("getWithQuery", () => {
    it("return value with query reqult", async () => {
      axios.get = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: [{ ...FAKE_ENTITY }] }));
      const result = await entityService.actions.getWithQuery({ id: 1 });
      expect(result).toEqual([FAKE_ENTITY]);
      expect(entityService.state().entities).toEqual([FAKE_ENTITY]);
    });
    it("return null if server response with empty data", async () => {
      axios.get = jest.fn().mockReturnValue(Promise.resolve({ data: null }));
      const result = await entityService.actions.getWithQuery({ id: 1 });
      expect(result).toEqual([]);
      expect(entityService.state().entities).toEqual([]);
    });
    it("return empty array and write error in console when request rejected", async () => {
      axios.get = jest.fn().mockReturnValue(Promise.reject());
      const result = await entityService.actions.getWithQuery({ id: 1 });
      expect(result).toEqual([]);
      expect(entityService.state().entities).toEqual([]);
    });
    it("return entity and replace it in state", async () => {
      entityService.state({
        entities: [{ id: 1, name: "FAKE_OLD_NAME" }],
      });
      axios.get = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: [{ ...FAKE_ENTITY }] }));
      const result = await entityService.actions.getWithQuery({ id: 1 });
      expect(result).toEqual([FAKE_ENTITY]);
      expect(entityService.state().entities).toEqual([FAKE_ENTITY]);
    });
  });

  describe("delete", () => {
    it("delete entity and return all existed entities", async () => {
      entityService.state({
        entities: [{ id: 1, name: "FAKE_OLD_NAME" }],
      });
      axios.delete = jest.fn().mockReturnValue(Promise.resolve());
      const result = await entityService.actions.delete(1);
      expect(result).toEqual([]);
      expect(entityService.state().entities).toEqual([]);
    });

    it("return entities array and write error in console when request rejected", async () => {
      axios.delete = jest.fn().mockReturnValue(Promise.reject());
      const result = await entityService.actions.delete(1);
      expect(result).toEqual([]);
      expect(entityService.state().entities).toEqual([]);
    });
  });
});
