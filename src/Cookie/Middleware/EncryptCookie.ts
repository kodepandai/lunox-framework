import type { Middleware } from "../../Contracts/Http/Middleware";
import cookie from "cookie";

const EncryptCookie: Middleware = {
  handle: async (req, next) => {
    const x = cookie.parse(
      (req.getOriginalRequest().headers?.cookie as string) || ""
    );
    console.log("decrypt cookie", x);
    return next(req);
  },
  handleAfter: async (res) => {
    console.log("encrypt cookie");
    return res;
  },
};

export default EncryptCookie;
