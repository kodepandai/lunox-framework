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
                return (window._session as any)[key];
              }
            },
            old: (key: string) => {
              if (typeof window != "undefined") {
                return (window._old as any)[key];
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
