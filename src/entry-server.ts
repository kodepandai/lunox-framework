export const makeRender = (modules:any, viewPath:string)=>async (url: any, props: any) => {
  let View:any = null;
  await Promise.all(
    Object.keys(modules).map(async (m) => {
      if (m == `${viewPath}/${url}.svelte`) {
        View = (await modules[m]()).default;
      }
    })
  );
  return await View.render(props);
};
