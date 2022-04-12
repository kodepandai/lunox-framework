import type Application from "../Foundation/Application";
import type { ObjectOf } from "../Types";
import type UploadedFile from "./UploadedFile";
import type { ExtendedRequest } from "../Contracts/Request";
import SessionManager from "../Session/SessionManager";
import type { AuthManager } from "../Auth/AuthManager";
import AuthManagerClass from "../Auth/AuthManager";
import type { StatefulGuard } from "../Contracts/Auth/StatefulGuard";
import Str from "../Support/Str";
import Validator from "../Support/Facades/Validator";
import cookie from "cookie";
import type { Macro } from "../Support/Traits/Macroable";
import Macroable from "../Support/Traits/Macroable";
import { useMagic } from "../Support";

interface RequestCookies {
  [key: string]: any;
  set: (key: string, value: any) => void;
}
export class Request extends Macroable {
  // redeclare static macros to avoid all macros being merged
  protected static macros: ObjectOf<Macro> = {};

  protected app: Application;
  public files: ObjectOf<UploadedFile> = {};

  protected req: ExtendedRequest;

  protected data: ObjectOf<any>;

  protected sessionManager: SessionManager | null;

  protected authManager: (AuthManager & StatefulGuard) | null;

  protected _cookies: ObjectOf<any> | null;

  constructor(app: Application, req: ExtendedRequest) {
    super();
    this.app = app;
    this.req = req;
    const query = typeof req?.query == "object" ? req.query : {};
    this.data = { ...query, ...req?.body };
    this.sessionManager = null;
    this.authManager = null;
    this._cookies = null;
  }

  public get(key: string, defaultValue = null) {
    return this.data[key] || defaultValue;
  }

  public input(key: string, defaultValue = null) {
    return this.get(key, defaultValue);
  }

  public header(key: string) {
    return this.req.headers[key.toLowerCase()];
  }

  public only(keys: string[]): ObjectOf<any> {
    return keys.reduce((result, key) => {
      result[key] = this.data[key as any];
      return result;
    }, {} as ObjectOf<any>);
  }

  public all(): any {
    return this.data;
  }

  public allFiles(): ObjectOf<UploadedFile> {
    return this.files;
  }

  public file(key: string) {
    return this.files[key] || null;
  }

  public method() {
    return this.req.method;
  }

  public merge(newData: ObjectOf<any>) {
    this.data = { ...this.data, ...newData };
    return this;
  }

  public getOriginalRequest() {
    return this.req;
  }

  public instance() {
    return this;
  }

  public session() {
    if (this.sessionManager) {
      return this.sessionManager;
    }
    return (this.sessionManager = new SessionManager(this.app).setRequest(
      this
    ));
  }

  public get cookies() {
    if (!this._cookies) {
      this._cookies = cookie.parse((this.req.headers?.cookie as string) || "");
      Object.defineProperty(this._cookies, "set", {
        value: this.setCookie.bind(this),
      });
    }
    return this._cookies as RequestCookies;
  }

  public setCookie(key: string, value: any) {
    if (!this._cookies) {
      this._cookies = {};
    }
    this._cookies[key] = value;
  }

  public auth() {
    if (this.authManager) {
      return this.authManager;
    }
    return (this.authManager = new AuthManagerClass(this.app).setRequest(this));
  }

  public wantsJson() {
    const acceptable = this.getOriginalRequest().headers.accept || "";
    return Str.contains(acceptable, ["/json", "+json"]);
  }

  public async validate(
    rules: ObjectOf<string>,
    messages: ObjectOf<string> = {},
    customAttributes: ObjectOf<string> = {}
  ) {
    return await Validator.make(
      this.data,
      rules,
      messages,
      customAttributes
    ).validate();
  }

  public is(...patterns: any[]) {
    return Str.is(patterns, this.req.url.replace("/", ""));
  }
}

export interface Request {
  macro: (name: string, macro: Macro) => any;
  [key: string]: any;
}
export default useMagic<typeof Request>(Request);
