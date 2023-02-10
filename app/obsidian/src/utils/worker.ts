import type { WorkerPool } from "@aidenlx/workerpool";

export const createWorkerProxy = <API>(pool: WorkerPool) => {
  const placeholder = {} as Record<string, any>;
  const addProxiedMethod = (name: string) =>
    (placeholder[name] ??= (...args: any[]) => pool.exec(name, args));

  pool
    // @ts-expect-error https://github.com/josdejong/workerpool/blob/11bd7fd37853626c265ae02de396f12436c2fc6c/src/Pool.js#L167-L171
    .exec("methods")
    .then((methods: string[]) => methods.forEach(addProxiedMethod));

  return new Proxy(placeholder, {
    get(_target, prop) {
      if (typeof prop !== "string") return undefined;
      // cache the resulting function
      return addProxiedMethod(prop);
    },
  }) as API;
};
