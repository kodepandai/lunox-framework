import type Request from "./Http/Request";

export const makeRender =
  (modules: any, viewPath: string) => async (url: any, props: any, req: Request, cb: (props:any)=>any) => {
    let View: any = null;
    await Promise.all(
      Object.keys(modules).map(async (m) => {
        if (m == `${viewPath}/${url}.svelte`) {
          const module = (await modules[m]());
          const serverProps = await module.onServer(req);
          props = {...props, ...serverProps};
          View = module.default;
        }
      })
    );
    cb(props);
    return await View.render(props);
  };
