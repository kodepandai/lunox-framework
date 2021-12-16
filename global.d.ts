/// <reference types="svelte" />
/// <reference types="vite/client" />
import type { ObjectOf } from "src/Types";
import type Repository from "src/Config/Repository";
import type Application from "src/Foundation/Application";
import type Env from "src/Support/Env";
import type Response from "src/Http/Response";
import type ViewFactory from "src/View/Factory";

declare global {
  interface Window {
    _view: string;
    _data: ObjectOf<any>;
  }
  var app: <T extends string | null | any = null>(
    abstract: T | string | null = null
  ) => T extends null ? Application : T;
  var base_path: Application["basePath"];
  var storage_path: Application["storagePath"];
  var config = <T = any>(key?: string, defaultValue?: T) => T;
  var env: Env["get"];
  var get_current_dir: (importMetaUrl: string) => string;
  var view: ViewFactory['make']
}
