import type Request from "../../Http/Request";
import type {Middleware as PolkaMiddleware} from "polka";

export type NativeMiddleware = PolkaMiddleware
export type MiddlewareHandler = (
  req: Request,
  next: (req: Request, nativeMiddleware?: NativeMiddleware) => void,
  ...args: any[]
) => Promise<any>;

export interface Middleware {
  handle: MiddlewareHandler;
}
