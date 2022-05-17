const makeView = async (
  modules: any,
  viewPath = "/app/view/resources/view"
) => {
  let View = null;
  await Promise.all(
    Object.keys(modules).map(async (m) => {
      if (m == `${viewPath}/${window._view}.svelte`) {
        const component = (await modules[m]()).default;
        View = new component({
          target: document.getElementById("app"),
          hydrate: true,
          props: window._data,
        });
      }
    })
  );
  return View;
};
export { makeView };
