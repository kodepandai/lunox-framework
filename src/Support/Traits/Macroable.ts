import { BadMethodCallException } from "../../Foundation/Exception";
import type { ObjectOf } from "../../Types";

export type Macro = (...arg: any[]) => any;
class Macroable {
  protected static macros: ObjectOf<Macro> = {};

  /**
   * Register a custom macro
   */
  public static macro(name: string, macro: Macro) {
    this.macros[name] = macro;
  }

  /**
   * Check if macro is registered
   */
  public static hasMacro(name: string) {
    return Object.keys(this.macros).includes(name);
  }

  /**
   * Flush the existing macros
   */
  public static flushMacros() {
    this.macros = {};
  }

  /**
   * Dynamically handle call to the class
   */
  protected static __getStatic(method: string, ...parameters: any[]): any {
    if (!this.hasMacro(method)) {
      throw new BadMethodCallException(
        `Method ${this.constructor.name}.${method} does not exist.`
      );
    }
    return this.macros[method](...parameters);
  }
}

export default Macroable;
