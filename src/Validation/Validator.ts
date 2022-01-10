import pkg from "node-input-validator/cjs/index";
import ValidationException from "../Validation/ValidationException";
import type { ObjectOf } from "../Types";

class Validator extends pkg.Validator {
  protected _inputs: ObjectOf<any>;
  constructor(
    data: ObjectOf<any>,
    rules: ObjectOf<any>,
    messages: ObjectOf<any>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    customAttributes: ObjectOf<any> = {}
  ) {
    // TODO: implement validation with customAtributes like in laravel
    super(data, rules, messages);
    this._inputs = Object.keys(rules).reduce((inputs, key) => {
      inputs[key] = data[key];
      return inputs;
    }, {} as ObjectOf<any>);
  }

  public async fails() {
    return !(await super.validate());
  }

  public async validate(inputs?: ObjectOf<any>): Promise<any> {
    inputs = inputs || this._inputs;
    if (await super.validate(inputs)) {
      return inputs;
    }
    throw new ValidationException(this);
  }
}

export default Validator;
