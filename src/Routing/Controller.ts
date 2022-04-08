import { BadMethodCallException } from "../Foundation/Exception";

abstract class Controller {

  /**
    * Execute an action on the controller.
    */
  public callAction(method: string, parameters: any[]){
    // handle calls to missing methods
    if(!Object.getOwnPropertyNames(Object.getPrototypeOf(this)).includes(method)){
      throw new BadMethodCallException(
        `Method ${this.constructor.name}.${method} does not exist.`);
    }

    return (this as any)[method](...parameters);
  }
    
}

export class ExtendedController extends Controller {}

export default Controller;