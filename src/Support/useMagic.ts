// credit to loilo for magic method in js
// https://gist.github.com/loilo/4d385d64e2b8552dcc12a0f5126b6df8

type MagicMethods = "__get" | "__getStatic";
const useMagic = <T>(
  clazz: any,
  using: MagicMethods[],
  ...params: any[]
): T => {
  const classHandler = Object.create(null);
  classHandler.params = params;
  // Trap for class instantiation
  classHandler.construct = (
    target: any,
    args: ArrayLike<any>,
    receiver: any
  ) => {
    // Wrapped class instance
    const instance = Reflect.construct(target, args, receiver);

    // Instance traps
    const instanceHandler = Object.create(null);

    if (using.includes("__get")) {
      // Catches "instance.property"
      const get = Object.getOwnPropertyDescriptor(clazz.prototype, "__get");
      if (get) {
        instanceHandler.get = (target: any, name: string, receiver: any) => {
          const exists = Reflect.has(target, name);
          if (exists) {
            return Reflect.get(target, name, receiver);
          } else {
            return get.value.call(target, name, ...params);
          }
        };
      }
    }
    return new Proxy(instance, instanceHandler);
  };

  if (using.includes("__getStatic")) {
    if (Object.getPrototypeOf(clazz)["__getStatic"]) {
      classHandler.get = (target: any, name: string, receiver: any) => {
        if (name in target) {
          return target[name];
        } else {
          return target.__getStatic.call(receiver, name, ...params);
        }
      };
    }
  }

  return new Proxy(clazz, classHandler);
};

export default useMagic;
