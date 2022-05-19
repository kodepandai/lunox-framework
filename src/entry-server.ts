import type { Request } from "./Http/Request";
import {readFileSync} from "fs";
import path from "path";
import ViewException from "./View/ViewException";
const defaultViewPath = config("view.paths", ["/app/resources/view"])[0];

export const makeRender =
  (modules: any, viewPath=defaultViewPath) =>
    async (url: any, props: any, req: Request, cb: (props: any) => any) => {
      const manifest = process.env.NODE_ENV=="production"? JSON.parse(readFileSync(base_path("client/manifest.json"), "utf-8")):{};
      let View: any = null;
      let preloadLinks = "";
      await Promise.all(
        Object.keys(modules).map(async (m) => {
          const fullViewPath = `${viewPath}/${url}.${m.split(".").pop()}`;
          if (m == fullViewPath){
            const module = await modules[m]();
            if(module.onServer){
              const serverProps = await module.onServer(req);
              props = { ...props, ...serverProps };
            }
            View = module.default;
            if(process.env.NODE_ENV=="production"){
              preloadLinks = renderPreloadLinks(fullViewPath.replace(/^\//, ""), manifest);
            }
          }
        })
      );
      cb(props);
      const html = await transformView(url, View, props, config("view.engine", "svelte"));
      return [html, preloadLinks];
    };

const renderPreloadLinks = (viewPath: string, manifest:any) => {
  let links = "";
  const seen = new Set();
  const {imports, css, file} = manifest[path.join(viewPath)];
  if(file && !seen.has(file)){
    if(!seen.has(file)){
      seen.add(file);
      links += renderPreloadLink(file);
    }
  }
  if(css){
    css.forEach((_css: string)=>{
      if(!seen.has(_css)){
        seen.add(_css);
        links += renderPreloadLink(_css);

      }
    });
  }
  if(imports){
    imports.filter((m: string)=>m!="index.html").forEach((m: string)=>{
      links+=renderPreloadLinks(m, manifest);
    });
  }
  return links;
};

function renderPreloadLink(file: string) {
  file = "/"+file;
  if (file.endsWith(".js")) {
    return `<link rel="modulepreload" crossorigin href="${file}">`;
  } else if (file.endsWith(".css")) {
    return `<link rel="stylesheet" href="${file}">`;
  } else if (file.endsWith(".woff")) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
  } else if (file.endsWith(".woff2")) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
  } else if (file.endsWith(".gif")) {
    return ` <link rel="preload" href="${file}" as="image" type="image/gif">`;
  } else if (file.endsWith(".jpg") || file.endsWith(".jpeg")) {
    return ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`;
  } else if (file.endsWith(".png")) {
    return ` <link rel="preload" href="${file}" as="image" type="image/png">`;
  } else {
    // TODO
    return "";
  }
}


const transformView = async (url: string, View: any, props: any, engine: "react"|"svelte")=>{
  // eslint-disable-next-line no-useless-catch
  try {
    if(engine=="react"){
      const {Helmet} = (await import("react-helmet")) as any;
      const ReactDomServer = (await import("react-dom/server")).default;
      const JsxRuntime = (await import("react/jsx-runtime")).default;
      const html =  ReactDomServer.renderToString((JsxRuntime as any).jsx(View||"", props)) as string;
      const {style, title, meta, link, script} = Helmet.renderStatic();
      return {
        html,
        head: `<head>
        ${title.toString()}
        ${meta.toString()}
        ${link.toString()}
        ${script.toString()}
        </head>
        `,
        css: {
          code: style.toString()
        }
      };
    }
    if(engine == "svelte"){
      return await View.render(props) as {html: string, head: string, css: {code: string}};
    }
  } catch (error) {
    throw new ViewException(url);
  }
};
