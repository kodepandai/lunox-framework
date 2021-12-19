import type Application from "../Foundation/Application";
import type { Request as ServerRequest } from "polka";
import SessionManager from "../Session/SessionManager";
import type { ObjectOf } from "../Types";
import type UploadedFile from "./UploadedFile";

interface ExtendedRequest extends ServerRequest {
  session?: any;
}
class Request {
  protected app: Application;
  public files: ObjectOf<UploadedFile> = {};

  protected req: ExtendedRequest;

  protected data: ObjectOf<any>;

  protected sessionManager: SessionManager | null = null;

  constructor(app: Application, req: ExtendedRequest) {
    this.app = app;
    this.req = req;
    const query = typeof req.query == "object" ? req.query : {};
    this.data = { ...query, ...req.body };
  }

  public get(key: string) {
    return this.data[key] || null;
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
    if (this.sessionManager == null) {
      this.sessionManager = new SessionManager(this.app);
      this.sessionManager.setSession(this.req.session || {});
    }
    return this.sessionManager;
  }
}

export default Request;
