import type { ObjectOf } from "./Types";

const makeView = async (modules: any, viewPath: string) => {
  let View = null;
  await Promise.all(
    Object.keys(modules).map(async (m) => {
      if (m == `${viewPath}/${window._view}.svelte`) {
        const component = (await modules[m]()).default;
        View = new component({
          target: document.getElementById("app"),
          hydrate: true,
          props: {
            ...(window._data as ObjectOf<any>),
            session: (key: string) => {
              if (typeof window != "undefined") {
                const keys = key.split(".");
                return keys.reduce(
                  (prev, x) => prev?.[x],
                  window._session as any
                );
              }
            },
            old: (key: string) => {
              if (typeof window != "undefined") {
                const keys = key.split(".");
                return keys.reduce((prev, x) => prev?.[x], window._old as any);
              }
            },
          },
        });
      }
    })
  );
  return View;
};
export { makeView };
