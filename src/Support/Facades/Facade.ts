import type Application from "../../Foundation/Application";
import type { Class, ObjectOf } from "../../Types";

abstract class Facade {
  protected static facadeId: string | null = null;

  protected static app: Application;

  protected static resolvedInstance: ObjectOf<any> = {};

  public static setApplicationFacade(app: Application) {
    this.app = app;
  }

  public static getFacadeAccessor(): Class<any> | string {
    throw new Error("Facade does not implement getFacadeAccessor method.");
  }

  static __getStatic(name: string, abstract: string) {
    return (...args: any) => {
      const target = this.resolveFacadeInstance(abstract);
      if (target.facadeCalled) {
        target.facadeCalled();
      }
      if (target[name]) {
        return target[name].call(target, ...args);
      }
    };
  }

  protected static resolveFacadeInstance(abstract: string) {
    if (typeof this.getFacadeAccessor() == "string") {
      abstract = this.getFacadeAccessor() as string;
    }
    if (this.resolvedInstance[abstract]) {
      return this.resolvedInstance[abstract];
    }
    let target: any;
    if (typeof this.getFacadeAccessor() == "string") {
      target = this.app.make(this.getFacadeAccessor() as string);
    } else {
      if (!this.app.instances[abstract]) {
        this.app.singleton(abstract, this.getFacadeAccessor() as Class<any>);
      }
      target = this.app.make(abstract);
    }
    this.resolvedInstance[abstract] = target;
    return target;
  }
}
export class ExtendedFacade extends Facade {}

export default Facade;
