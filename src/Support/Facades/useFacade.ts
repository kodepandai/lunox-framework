import useMagic from "../useMagic";

function useFacade<T>(clazz: any): T {
  // uniqId of Facade to that will registered to singleton later
  const abstract = clazz.name + Date.now();
  return useMagic(clazz, ["__getStatic"], abstract);
}

export default useFacade;
