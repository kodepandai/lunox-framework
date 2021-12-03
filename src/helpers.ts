import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import type { ViteDevServer } from "vite";
import Response from "./Support/Facades/Response";
import type { ObjectOf } from "./Types";
import type Repository from "./Config/Repository";
import type { HttpRequest } from "global";

global.get_current_dir = (importMetaUrl: string) => {
  return path.dirname(fileURLToPath(importMetaUrl));
};

global.base_path = (_path: string) => app().basePath(_path);

global.config = <T = any>(key = "", defaultValue: T) =>
  app<Repository>("config").get(key, defaultValue);

global.storage_path = (_path: string) => app().storagePath(_path);

global.request = () => app<HttpRequest>("request");

global.view = async (_path, data: ObjectOf<any> = {}) => {
  _path = _path.split(".").join(path.sep);
  const isProd = env("NODE_ENV") == "production";
  const url = request().getOriginalRequest().originalUrl;
  let template = "";
  let render: any = null;
  if (!isProd) {
    const vite = app<ViteDevServer>("vite");
    template = fs.readFileSync(base_path("../index.html"), "utf-8");
    template = await vite.transformIndexHtml(url, template);
    render = (await vite.ssrLoadModule(base_path("entry-server"))).render;
  } else {
    template = fs.readFileSync(base_path("client/index.html"), "utf-8");
    render = (await import(base_path("server/entry-server"))).render;
  }
  const context = { view: _path, ...data };
  let rendered = false;
  let appHtml;
  while (!rendered) {
    try {
      appHtml = await render(_path, context);
      rendered = true;
    } catch (error) {
      if(error instanceof Error && error.message == "Cannot read property 'default' of null"){
        // I don't know, just rerender and it will be fine
      } else {
        throw error;
      }
    }
  }
  const html = template
    .replace("<!--app-html-->", appHtml.html)
    .replace("<!--app-head-->", appHtml.head)
    .replace("/*style*/", appHtml.css.code)
    .replace("$$view", _path)
    .replace("$$data", JSON.stringify(data));
  return Response.make(html, 200, {
    "Content-Type": "text/html",
  });
};
