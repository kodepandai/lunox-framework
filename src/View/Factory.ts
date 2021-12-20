import type Request from "../Http/Request";
import type { ViteDevServer } from "vite";
import path from "path";
import fs from "fs";
import Response from "../Support/Facades/Response";
import type { ObjectOf } from "../Types";
import type Application from "../Foundation/Application";

class Factory {
  protected app: Application;
  protected path!: string;
  protected data: ObjectOf<any> = {};

  constructor(app: Application) {
    this.app = app;
  }

  public async make(_path: string, data: ObjectOf<any> = {}): Promise<Factory> {
    this.path = _path.split(".").join(path.sep);
    this.data = data;
    return this;
  }

  public async render(req: Request) {
    const isProd = env("NODE_ENV") == "production";
    const url = req.getOriginalRequest().originalUrl;
    let template = "";
    let render: any = null;
    const session = (key: string) => req.session().get(key);
    const old = (key: string) => req.session().old(key);
    if (!isProd) {
      const vite = this.app.make<ViteDevServer>("vite");
      template = fs.readFileSync(base_path("../index.html"), "utf-8");
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule(base_path("entry-server"))).render;
    } else {
      template = fs.readFileSync(base_path("client/index.html"), "utf-8");
      render = (await import(base_path("server/entry-server"))).render;
    }
    const context = { ...this.data, session, old };
    let rendered = false;
    let appHtml;
    while (!rendered) {
      try {
        appHtml = await render(this.path, context);
        rendered = true;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message == "Cannot read property 'default' of null"
        ) {
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
      .replace("$$view", this.path)
      .replace("$$data", JSON.stringify(this.data))
      .replace("$$old", JSON.stringify(req.session().get("__old") || {}))
      .replace("$$session", JSON.stringify(req.session().all(true) || {}));
    req.session().forget("__old");
    req.session().forget("__session");

    return Response.make(html, 200, {
      "Content-Type": "text/html",
    });
  }
}
export default Factory;
