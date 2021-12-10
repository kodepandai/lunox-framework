import Pluralize from "pluralize";
class Str {
  public static plural(value: string, count = 2) {
    return Pluralize(value, count);
  }
}

export default Str;
