import type Request from "../../Http/Request";
import type { Middleware as PolkaMiddleware } from "polka";

export type NativeMiddleware = PolkaMiddleware;
export type NextFunction = (req: Request, nativeMiddleware?: NativeMiddleware) => void
export interface Middleware {
  handle(
    req: Request,
    next: NextFunction,
    ...args: any[]
  ): Promise<any>
}
