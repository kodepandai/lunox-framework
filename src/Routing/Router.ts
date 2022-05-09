import Macroable, { Macro } from "../Support/Traits/Macroable";
import type { Middleware, MiddlewareStack } from "../Contracts/Http/Middleware";
import type { Method, RouteCallback, Routes } from "../Contracts/Routing/Route";
import type { CallBack, ObjectOf } from "../Types";
import type { ExtendedController } from "./Controller";
import type { IOptions } from "./ControllerMiddlewareOptions";
import { useMagic } from "../Support";
import { pathToFileURL } from "url";

type RouteAction = RouteCallback | [typeof ExtendedController, string];
export class Router extends Macroable {
  protected routes: Routes[];
  protected prefixStack: string[];
  protected middlewareStack: MiddlewareStack[];
  protected deep: number;
  protected calledAction: string;

  // redeclare static macros to avoid all macros being merged
  protected static macros: ObjectOf<Macro> = {};

  constructor() {
    super();
    this.routes = [];
    this.prefixStack = [];
    this.middlewareStack = [];
    this.calledAction = "";
    this.deep = 0;
  }

  private addRoutes =
    (method: Method) => (uri: string, action: RouteAction) => {
      let controllerMiddlewares: (string | Middleware)[] = [];
      if (Array.isArray(action)) {
        const [ControllerClass, controllerMethod] = action;
        const controller = new ControllerClass();
        action = (req, ...params) =>
          controller.callAction(controllerMethod, [req, ...params]);
        controllerMiddlewares = controller
          .getMiddleware()
          .filter((m) => {
            return this.methodIncludedByOptions(controllerMethod, m.options);
          })
          .map((m) => m.middleware);
      }
      this.routes.push({
        uri: this.prefixStack.join("") + uri,
        method,
        action,
        middleware: this.flattenMiddleware([
          ...this.middlewareStack,
          ...controllerMiddlewares,
        ]),
      });
      this.calledAction = "addRoutes";
      return this;
    };

  public get = this.addRoutes("get");
  public post = this.addRoutes("post");
  public delete = this.addRoutes("delete");
  public patch = this.addRoutes("patch");
  public put = this.addRoutes("put");
  public all = this.addRoutes("all");

  public getRoutes() {
    return this.routes;
  }

  public prefix(prefix: string) {
    this.prefixStack.push(prefix);
    this.calledAction = "prefix";
    return this;
  }

  public middleware(middleware: MiddlewareStack) {
    this.middlewareStack.push(middleware);
    if (this.calledAction == "addRoutes") {
      this.routes[this.routes.length - 1].middleware = this.flattenMiddleware(
        this.middlewareStack
      );
      this.middlewareStack.pop();
    }
    this.calledAction = "middleware";
    return this;
  }
  public async group(callback: string | CallBack) {
    this.deep++;
    if (this.deep > this.middlewareStack.length) {
      this.middlewareStack.push(null);
    }
    if (typeof callback == "string") {
      if (app().runingUnitTests()) {
        await import(pathToFileURL(callback).href);
      } else {
        await import(pathToFileURL(callback + ".js").href);
      }
    } else {
      if (typeof callback == "function") {
        await callback();
      }
    }
    this.middlewareStack.pop();
    this.prefixStack.pop();
    this.calledAction = "group";
    this.deep--;
  }

  private flattenMiddleware(middlewareStack: MiddlewareStack[]) {
    return middlewareStack.reduce(
      (flatten: (Middleware | string)[], middleware) => {
        if (middleware == null) return flatten;
        if (Array.isArray(middleware)) {
          return [...flatten, ...middleware];
        } else {
          return [...flatten, middleware];
        }
      },
      []
    );
  }
  protected facadeCalled() {
    this.calledAction = "";
  }

  /**
   * determine if the given options should included in particular method
   */
  private methodIncludedByOptions(method: string, options: IOptions) {
    return (
      (options.only.includes(method) && !options.except.includes(method)) ||
      (!options.except.includes(method) && options.only.length == 0)
    );
  }
}

export interface Router {
  macro: (name: string, macro: Macro) => any;
  [key: string]: any;
}
// export default Router;
export default useMagic<typeof Router>(Router);
