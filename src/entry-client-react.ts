import ViewException from "./View/ViewException";

const makeView = async (modules: any, viewPath = "/app/resources/view") => {
  await Promise.all(
    Object.keys(modules).map(async (m) => {
      if (m == `${viewPath}/${window._view}.${m.split(".").pop()}`) {
        const component = (await modules[m]()).default;
        transformView(window._view, component, window._data);
      }
    })
  );
};

const transformView = async (view: string, component: any, props: any) => {
  try {
    const target = document.getElementById("app");
    const { createRoot } = await import("react-dom/client");
    const { createElement } = await import("react");
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const root = createRoot(target!);
    return root.render(createElement(component, props, null));
  } catch (error) {
    throw new ViewException(view);
  }
};

export { makeView };
