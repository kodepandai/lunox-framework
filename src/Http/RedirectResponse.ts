import type { ObjectOf } from "../Types";
import type Request from "./Request";
import Response from "./Response";

class RedirectResponse extends Response {
  protected request!: Request;
  protected isWithInput = false;
  protected session: ObjectOf<any> = {};
  protected url: string;

  constructor(url: string) {
    super({}, 302, {
      Location: url,
    });
    this.url = url;
    return this;
  }

  public setRequest(req: Request) {
    if (this.url == "__back") {
      const _req = req.getOriginalRequest();
      const location = _req.headers.referrer || _req.headers.referer || "/";
      this.setHeader("Location", location as string);
    }

    if (this.isWithInput) {
      req.session().put("__old", req.all());
    }
    req.session().put("__session", this.session);
  }

  public withInput() {
    this.isWithInput = true;
    return this;
  }

  public with(session: ObjectOf<any>) {
    this.session = session;
    return this;
  }
}

export default RedirectResponse;
