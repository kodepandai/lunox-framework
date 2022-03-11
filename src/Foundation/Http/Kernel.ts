import { STATUS_CODES } from "http";
import sirv from "sirv";
import path from "path";
import polka, { Request, NextHandler, Response, IError } from "polka";

import type { Bootstrapper } from "../../Contracts/Foundation/Boostrapper";
import type { Middleware } from "../../Contracts/Http/Middleware";
import HttpRequest from "../../Http/Request";
import HttpResponse from "../../Http/Response";
import Route from "../../Support/Facades/Route";
import type { Class, ObjectOf } from "../../Types";
import type Application from "../Application";
import BootProviders from "../Bootstrap/BootProviders";
import LoadConfiguration from "../Bootstrap/LoadConfiguration";
import LoadEnvirontmentVariabel from "../Bootstrap/LoadEnvirontmentVariabel";
import RegisterFacades from "../Bootstrap/RegisterFacades";
import RegisterProviders from "../Bootstrap/RegisterProviders";
import HandleException from "../Bootstrap/HandleException";
import type { Handler } from "../../Contracts/Exception/Handler";
import formidable from "formidable";
import UploadedFile from "../../Http/UploadedFile";
import ViewFactory from "../../View/Factory";
import RedirectResponse from "../../Http/RedirectResponse";
import NotFoundHttpException from "../../Http/NotFoundHttpException";

class Kernel {
  protected app: Application;
  protected middleware: (Middleware|Class<Middleware>)[] = [];
  protected middlewareGroups: ObjectOf<(Middleware|Class<Middleware>)[]> = {};
  protected routeMiddleware: ObjectOf<Middleware|Class<Middleware>> = {};

  protected bootstrappers: Class<Bootstrapper>[] = [
    LoadEnvirontmentVariabel,
    LoadConfiguration,
    HandleException,
    RegisterFacades,
    RegisterProviders,
    BootProviders,
  ];

  constructor(app: Application) {
    this.app = app;
  }

  async start() {
    const server = polka({
      onError: async (err, req, res) => {
        this.reportException(err);
        const response = await this.renderException(
          (req as any)._httpRequest,
          err
        );
        return this.send(
          res,
          response.getStatus(),
          response.getOriginal(),
          response.getHeaders()
        );
      },
      onNoMatch: () => {
        throw new NotFoundHttpException("URL not found");
      },
    });

    this.app.instance("server", server);

    await this.app.bootstrapWith(this.bootstrappers);

    server.use((req, res, next) => {
      // create Http\Request on first middleware
      // and inject it to rest of middleware
      const request = new HttpRequest(this.app, req);
      (req as any)._httpRequest = request;
      if (req.method.toLowerCase() == "get") return next();

      const form = formidable({ multiples: true });
      form.parse(req, (err, fields, files) => {
        if (err) {
          throw err;
        }

        request.files = Object.keys(files).reduce((prev, key) => {
          prev[key] = new UploadedFile(files[key]);
          return prev;
        }, {} as ObjectOf<any>);
        request.merge({ ...fields, ...request.files });
        (req as any)._httpRequest = request;
        next();
      });
    });

    // run global middlewares
    const globalMiddlewares = this.middleware.map((middleware) =>
      this.handleMiddleware(middleware)
    );
    server.use(...globalMiddlewares);

    const port = env("PORT") || 8000;

    const routes = Route.getRoutes();
    await Promise.all(
      routes.map((route) => {
        // run route middlewares
        const routeMiddlewares = route.middleware.reduce(
          (collect, middleware) => {
            // if route has middleware group, append it to routeMiddlewares
            if (
              typeof middleware == "string" &&
              this.middlewareGroups[middleware]
            ) {
              collect = [
                ...collect,
                ...this.middlewareGroups[middleware].map((m) =>
                  this.handleMiddleware(m)
                ),
              ];
            } else {
              collect = [...collect, this.handleMiddleware(middleware)];
            }
            return collect;
          },
          [] as any[]
        );

        server[route.method](
          path.join(route.uri),
          ...routeMiddlewares,
          async (req, res) => {
            const httpRequest = (req as any)._httpRequest as HttpRequest;
            let response = await route.action(
              httpRequest,
              ...Object.values(req.params)
            );

            if (response instanceof ViewFactory) {
              response = await response.render(httpRequest);
            }

            if (response instanceof RedirectResponse) {
              response.setRequest(httpRequest);
            }
            if (response instanceof HttpResponse) {
              // make sure all session is saved
              await httpRequest.session().save();

              return this.send(
                res,
                response.getStatus(),
                response.getOriginal(),
                response.getHeaders()
              );
            }
            if (["object", "number", "boolean"].includes(typeof response)) {
              return res.end(JSON.stringify(response));
            }
            return res.end(response);
          }
        );
      })
    );

    if (process.env.NODE_ENV != "production") {
      const { createServer } = (await import("vite")).default;
      const vite = await createServer({
        server: { middlewareMode: "ssr" },
      });
      this.app.instance("vite", vite);
      // use vite's connect instance as middleware
      server.use(vite.middlewares);
    } else {
      const dir = base_path("client");
      const serve = sirv(dir, {
        maxAge: 31536000, // 1Y
        immutable: true,
      });
      server.use(serve);
    }

    // serve public directory
    const pub = sirv(base_path("public"), {
      maxAge: 331536000, // 1Y,
      dev: process.env.NODE_ENV != "production",
    });
    server.use(pub);

    server.listen(port, () => {
      console.log("server run on port: " + port);
    });
  }

  private handleMiddleware(middleware: string | Middleware| Class<Middleware>) {

    let middlewareInstance: Middleware|Class<Middleware> = (typeof middleware == "string"
      ? this.routeMiddleware[middleware]
      : middleware); 
    if(is_class(middlewareInstance)){
      middlewareInstance = new (middlewareInstance as Class<Middleware>)();
    }
    return (_req: Request, res: Response, next: NextHandler) => {
      try {
        return (middlewareInstance as Middleware).handle(
          (_req as any)._httpRequest,
          (req: HttpRequest, nativeMiddleware) => {
            // update instance of request from middleware next function
            (_req as any)._httpRequest = req;
            if (nativeMiddleware) {
              return nativeMiddleware(_req, res, next);
            }
            return next();
          }
        );
      } catch (error) {
        if (error instanceof Error) {
          return next(error);
        }
      }
    };
  }

  private send(
    res: Response,
    code = 200,
    data: any = "",
    headers: ObjectOf<string> = {}
  ) {
    const TYPE = "content-type";
    const OSTREAM = "application/octet-stream";
    // eslint-disable-next-line prefer-const
    let k: any;
    const obj: ObjectOf<any> = {};
    for (k in headers) {
      obj[k.toLowerCase()] = headers[k];
    }

    let type = obj[TYPE] || res.getHeader(TYPE);

    if (!!data && typeof data.pipe === "function") {
      res.setHeader(TYPE, type || OSTREAM);
      return data.pipe(res);
    }

    if (data instanceof Buffer) {
      type = type || OSTREAM; // prefer given
    } else if (typeof data === "object") {
      data = JSON.stringify(data);
      type = type || "application/json;charset=utf-8";
    } else {
      data = data || STATUS_CODES[code];
    }

    obj[TYPE] = type || "text/html;charset=utf-8";
    obj["content-length"] = Buffer.byteLength(data);

    res.writeHead(code, obj);
    res.end(data);
  }

  protected reportException(e: string | IError) {
    if (typeof e == "string") {
      e = new Error(e);
    }
    return this.app.make<Handler>("ExceptionHandler").report(e);
  }

  protected async renderException(req: HttpRequest, e: string | IError) {
    if (typeof e == "string") {
      e = new Error(e);
    }
    return await this.app.make<Handler>("ExceptionHandler").render(req, e);
  }
}

export default Kernel;
