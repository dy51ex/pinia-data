# Pinia-Data


## How to use

```
import { useEntity } from "pinia-data";
import { createPinia, defineStore } from  "pinia";
...other vue imports

interface MyEntity {
	id: number;
	name: string;
	value: string;
}

const pinia = createPinia();
...other vue initializations

const useStore = defineStore("myTestStore", useEntity<MyEntity>("test"));
Or with additional state/actions/getters:
const entity = useEntity<MyEntity>("test")
const useStore = defineStore(
	"myTestStore",
	{
		state: () => ({
			...entity.state(),
			// any additional state
		}),
		actions: {
			...entity.actions,
			// any additional actions
		}
		getters: {
			// any additional getters
		},
	}
);

const store = useStore();
```

## Available methods

```
store.getAll(): T[]                       `GET` /api/tests/
store.getById(id: number | string): T     `GET` /api/tests/5
store.add(entity: T): T                   `POST` /api/tests/
store.delete(id: number | string): void   `DELETE` /api/tests/5
store.update(entity: T): T                `PUT` /api/tests/5
store.getWithQuery(Record<any>): T[]      `GET` /api/tests/?id=1

store.findById(id: number | string): T    find entity in local state
```

## Options

```
interface EntityOptions {
  plunarName?: string;
  axiosInstance?: AxiosInstance;
  idKey?: string;
  onError?: { [key in EntityMethod]?: () => void };
  onSuccess?: { [key in EntityMethod]?: () => void };
}

example:
const axiosInstance = axios.create({
	baseURL: "http://localhost:3000/api",
});
useEntity<MyEntity>(
	"test",
	{
		plunarName: 'heroes' <-- add 'es', becouse `heroes`, not `heros`,
		axiosInsance: axiosInstance,
		idKey: 'testId' <-- if entity key not `id`,
		onError: {
			add: () => console.error('something wrong'),
		}
	}
))
```
