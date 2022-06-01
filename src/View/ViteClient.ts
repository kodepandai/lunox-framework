import ViewException from "./ViewException";

type TransformViewClient = (
  view: string,
  component: any,
  props: any
) => Promise<any>;

export const makeViewTransform =
  (transformView: TransformViewClient) =>
    async (modules: any, viewPath = "/app/resources/view") => {
      await Promise.all(
        Object.keys(modules).map(async (m) => {
          if (m == `${viewPath}/${window._ctx.view}.${m.split(".").pop()}`) {
            const component = (await modules[m]()).default;
            try {
              transformView(window._ctx.view, component, window._ctx.data);
            } catch (error) {
              throw new ViewException(window._ctx.view, error as Error);
            }
          }
        })
      );
    };
