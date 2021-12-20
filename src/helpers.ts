import path from "path";
import { fileURLToPath } from "url";
import type Repository from "./Config/Repository";
import RedirectResponse from "./Http/RedirectResponse";
import View from "./Support/Facades/View";

global.get_current_dir = (importMetaUrl: string) => {
  return path.dirname(fileURLToPath(importMetaUrl));
};

global.base_path = (_path: string) => app().basePath(_path);

global.config = <T = any>(key = "", defaultValue: T) =>
  app<Repository>("config").get(key, defaultValue);

global.storage_path = (_path: string) => app().storagePath(_path);

global.view = View.make;

global.redirect = (url: string) => new RedirectResponse(url);
global.back = () => new RedirectResponse("__back");
