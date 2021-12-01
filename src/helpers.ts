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
    render = (await vite.ssrLoadModule("lunox/dist/entry-server")).render;
  } else {
    template = fs.readFileSync(base_path("client/index.html"), "utf-8");
    render = (await import("./entry-server")).render;
  }
  const context = { view: _path, ...data };
  const appHtml = await render(url, context);
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
