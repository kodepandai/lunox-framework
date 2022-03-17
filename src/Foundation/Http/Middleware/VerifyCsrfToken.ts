import Encrypter from "../../../Encryption/Encrypter";
import type Application from "../../../Foundation/Application";
import type Request from "../../../Http/Request";
import type {
  Middleware,
  NextFunction,
} from "../../../Contracts/Http/Middleware";
import { TokenMismatchException } from "../../../Session";
import cookie from "cookie";
import type { SessionConfig } from "../../../Contracts/Config";
import { DecryptException } from "src/Encryption";
import type Response from "src/Http/Response";

class VerifyCsrfToken implements Middleware {
  protected app!: Application;
  protected encrypter!: Encrypter;
  protected except: string[] = [];
  protected addHttpCookie = true;

  constructor() {
    this.app = app();
    this.encrypter = app<Encrypter>("encrypter");
  }
  async handle(req: Request, next: NextFunction) {
    if (
      this.isReading(req) ||
      this.runningUnitTests() ||
      this.inExceptArray(req) ||
      this.tokensMatch(req)
    ) {
      const res = next(req);
      if (this.shouldAddXsrfTokenCookie()) {
        this.addCookieToResponse(req, res);
      }
      return res;
    }
    throw new TokenMismatchException("CSRF token mismatch.");
  }

  protected isReading(req: Request) {
    return ["HEAD", "GET", "OPTIONS"].includes(req.method());
  }

  protected runningUnitTests() {
    this.app.runningInConsole() && this.app.runingUnitTests();
  }

  protected inExceptArray(req: Request) {
    return this.except.some((except) => {
      if (except !== "/") {
        // trim backslash
        except = except.replace(/^\/|\/$/g, "");
      }
      if (req.is(except)) {
        return true;
      }
      return false;
    });
  }

  protected tokensMatch(req: Request) {
    const token = this.getTokenFromRequest(req);
    console.log(req.session().token(), token);
    return Encrypter.hashEquals(req.session().token(), token);
  }

  protected getTokenFromRequest(req: Request) {
    let token = req.input("_token") || req.header("X-CSRF-TOKEN");
    console.log("a", token);
    const header = req.header("X-XSRF-TOKEN");
    if (!token && header) {
      try {
        token = this.encrypter.decrypt(header as string, false);
        console.log("b", token);
      } catch (e) {
        if (e instanceof DecryptException) {
          token = "";
        }
        console.log("c", token);
      }
      console.log("d", token);
    }

    return token;
  }

  public shouldAddXsrfTokenCookie() {
    return this.addHttpCookie;
  }

  protected addCookieToResponse(req: Request, res: Response) {
    console.log("adding csrf");
    const config = this.app.config.get<SessionConfig>("session");
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("XSRF-TOKEN", req.session().token(), {
        httpOnly: config.http_only,
        maxAge: config.lifetime * 60 * 1000,
        path: config.path,
        secure: config.secure,
        sameSite: config.same_site == null ? undefined : config.same_site,
        domain: config.domain == null ? undefined : config.domain,
      })
    );
  }
}

export default VerifyCsrfToken;
