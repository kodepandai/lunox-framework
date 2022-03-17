import type { ObjectOf } from "../Types";
import type { Response as ServerResponse } from "polka";

class Response {
  protected original: any;
  protected status: number;
  protected headers: ObjectOf<any>;
  protected res?: ServerResponse;
  constructor(content: any, status = 200, headers: ObjectOf<string> = {}) {
    if (content instanceof Response) {
      this.original = content.getOriginal();
    } else {
      this.original = content;
    }
    this.status = status;
    this.headers = headers;
  }

  public getOriginal() {
    return this.original;
  }

  public getStatus() {
    return this.status;
  }

  public getHeaders() {
    return this.headers;
  }

  public setOriginal(data: any) {
    this.original = data;
    return this;
  }

  public setServerResponse(res: ServerResponse) {
    this.res = res;
    this.res.statusCode = this.status;
    return this;
  }

  public getServerResponse() {
    return this.res;
  }

  public setHeader(key: string, value: string) {
    if (this.res) {
      this.res.setHeader(key, value);
    } else {
      this.headers = {
        ...this.headers,
        [key]: value,
      };
    }
    return this;
  }
}

export default Response;
