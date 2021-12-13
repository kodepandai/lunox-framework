/// <reference types="svelte" />
/// <reference types="vite/client" />
import type { ObjectOf } from "./dist/Types";
import type Repository from "./dist/Config/Repository";
import type Application from "./dist/Foundation/Application";
import type Env from "./dist/Support/Env";
import type Request from "./dist/Http/Request";
import type Response from "./dist/Http/Response";

declare class HttpRequest extends Request {}

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
  var view: (path: string, data?: ObjectOf<any>) => Promise<Response>;
  var request: () => HttpRequest;
}
