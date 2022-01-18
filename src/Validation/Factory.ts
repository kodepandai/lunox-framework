import type Application from "../Foundation/Application";
import type { ObjectOf } from "../Types";
import Validator from "./Validator";
import pkg from "node-input-validator/cjs/index";

class Factory {
  protected app: Application;

  constructor(app: Application) {
    this.app = app;
  }
  public make(
    data: ObjectOf<any>,
    rules: ObjectOf<string>,
    messages: ObjectOf<string> = {},
    customAttributes: ObjectOf<string> = {}
  ) {
    return new Validator(data, rules, messages, customAttributes);
  }

  public extend(
    ruleName: string,
    handle: (args: string[] | undefined, value: any) => Promise<boolean>
  ) {
    return pkg.extend(ruleName, (args) => ({
      name: ruleName,
      handler: (value: any) => handle(args, value),
    }));
  }
}
export default Factory;
