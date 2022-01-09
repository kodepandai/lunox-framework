import type Application from "../Foundation/Application";
import type { ObjectOf } from "../Types";
import type UploadedFile from "./UploadedFile";
import type { ExtendedRequest } from "../Contracts/Request";
import SessionManager from "../Session/SessionManager";
import type { AuthManager } from "../Auth/AuthManager";
import AuthManagerClass from "../Auth/AuthManager";
import type { StatefulGuard } from "../Contracts/Auth/StatefulGuard";

class Request {
  protected app: Application;
  public files: ObjectOf<UploadedFile> = {};

  protected req: ExtendedRequest;

  protected data: ObjectOf<any>;

  protected sessionManager?: SessionManager;

  protected authManager?: AuthManager & StatefulGuard;

  constructor(app: Application, req: ExtendedRequest) {
    this.app = app;
    this.req = req;
    const query = typeof req.query == "object" ? req.query : {};
    this.data = { ...query, ...req.body };
  }

  public get(key: string) {
    return this.data[key] || null;
  }

  public only(keys: string[]): ObjectOf<any>{
    return keys.reduce((result, key)=>{
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

  public auth() {
    if (this.authManager) {
      return this.authManager;
    }
    return (this.authManager = new AuthManagerClass(this.app).setRequest(this));
  }
}

export default Request;
