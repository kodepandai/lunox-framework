import type { ObjectOf } from "../Types";

class Response {
  protected original: any;
  protected status: number;
  protected headers: ObjectOf<string>;
  constructor(content: any, status = 200, headers: ObjectOf<string> = {}) {
    this.original = content;
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

  public setHeader(key: string, value: string) {
    this.headers = {
      ...this.headers,
      [key]: value,
    };
    return this;
  }
}

export default Response;
