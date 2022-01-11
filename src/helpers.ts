/* eslint-disable no-var */
import type { ObjectOf } from "./Types";
import type Repository from "./Config/Repository";
import type Application from "./Foundation/Application";
import type Env from "./Support/Env";
import type ViewFactory from "./View/Factory";
import RedirectResponse from "./Http/RedirectResponse";
import path from "path";
import { fileURLToPath } from "url";
import View from "./Support/Facades/View";
import crypto from "crypto";

declare global {
  interface Window {
    _view: string;
    _data: ObjectOf<any> | string;
  }
  var app: <T extends string | null | any = null>(
    abstract?: T | string | null,
    params?: any
  ) => T extends null ? Application : T;
  var base_path: Application["basePath"];
  var storage_path: Application["storagePath"];
  var config: <T = any>(key?: string | undefined, defaultValue?: T) => T;
  var env: Env["get"];
  var get_current_dir: (importMetaUrl: string) => string;
  var view: ViewFactory["make"];
  var redirect: (url: string) => RedirectResponse;
  var back: () => RedirectResponse;
  var sha1: (value: string) => string;
}

global.get_current_dir = (importMetaUrl: string) => {
  return path.dirname(fileURLToPath(importMetaUrl));
};

global.base_path = (_path: string) => app().basePath(_path);

global.config = <T = any>(key = "", defaultValue?: T) =>
  app<Repository>("config").get(key, defaultValue);

global.storage_path = (_path: string) => app().storagePath(_path);

global.view = View.make;

global.redirect = (url: string) => new RedirectResponse(url);

global.back = () => new RedirectResponse("__back");

global.sha1 = (value) => crypto.createHash("sha1").update(value).digest("hex");
