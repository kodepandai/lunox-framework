import HttpException from "../../Http/HttpException";
import RedirectResponse from "../../Http/RedirectResponse";
import type Container from "../../Container/Container";
import type Request from "../../Http/Request";
import type HttpResponse from "../../Http/Response";
import Response from "../../Support/Facades/Response";
import type { Class, ObjectOf } from "../../Types";
import ValidationException from "../../Validation/ValidationException";
import { TokenMismatchException } from "../../Session";

type renderUsing<E> = (e: E, req: Request) => HttpResponse;
type reportUsing<E> = (e: E) => void;
interface renderCallback<E> {
  exception: Class<E>;
  renderUsing: renderUsing<E>;
}
interface reportCallback<E> {
  exception: Class<E>;
  reportUsing: reportUsing<E>;
}
class Handler {
  protected container: Container;
  protected reportCallbacks: reportCallback<any>[] = [];
  protected renderCallbacks: renderCallback<any>[] = [];
  protected dontReport: Class<Error>[] = [];
  protected internalDontReport: Class<Error>[] = [
    HttpException,
    ValidationException,
    TokenMismatchException,
  ];

  constructor(container: Container) {
    this.container = container;
    this.register();
  }

  protected async render(req: Request, e: any) {
    let response: any = null;
    this.renderCallbacks.forEach(({ exception, renderUsing }) => {
      if (e instanceof exception) {
        response = renderUsing(e, req);
      }
    });
    if (response instanceof RedirectResponse) {
      response.setRequest(req);
      // make sure all session is saved
      await req.session().save();
    }
    if (response) return response;

    let statusCode = 500;
    let headers: ObjectOf<string> = {};

    if (e instanceof HttpException) {
      statusCode = e.getStatusCode();
      headers = e.getHeaders();

      if (!req.wantsJson()) {
        // TODO: render error to view, and we can customize it
        return Response.make(e.message, statusCode, headers);
      }
    }

    const err: ObjectOf<any> = { message: e.message };
    if (env("APP_DEBUG")) {
      err.stack = e.stack;
    }
    return Response.make(err, statusCode, headers);
  }

  protected report(e: any) {
    if (this.shouldntReport(e)) return;
    // TODO: make logger
    let report = (e: any) => {
      console.log(e);
    };
    this.reportCallbacks.forEach(({ exception, reportUsing }) => {
      if (e instanceof exception) {
        report = reportUsing;
      }
    });
    report(e);
  }

  public reportable<E = Error>(
    exception: Class<E>,
    reportUsing: reportUsing<E>
  ) {
    this.reportCallbacks.push({ exception, reportUsing });
  }

  public renderable<E = Error>(
    exception: Class<E>,
    renderUsing: renderUsing<E>
  ) {
    this.renderCallbacks.push({ exception, renderUsing });
  }

  protected register() {}

  protected shouldntReport(e: Class<Error>) {
    const dontReport = [...this.dontReport, ...this.internalDontReport];
    return dontReport.findIndex((x) => e instanceof x) >= 0;
  }
}

export default Handler;
