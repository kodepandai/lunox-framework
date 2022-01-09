import Pluralize from "pluralize";
class Str {
  public static plural(value: string, count = 2) {
    return Pluralize(value, count);
  }

  public static ucfirst(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}

export default Str;
