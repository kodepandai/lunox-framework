class Arr {
  public static wrap(value:string[]|string|null){
    if(value === null){
      return [];
    }
    return Array.isArray(value)?value: [value];
  }
}

export default Arr;