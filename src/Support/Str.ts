import Pluralize from "pluralize";
class Str {
  public static plural(value: string, count = 2) {
    return Pluralize(value, count);
  }

  public static ucfirst(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  public static contains(haystack: string, needles: string | string[]) {
    if (typeof needles == "string") {
      needles = [needles];
    }
    return needles.some((x) => haystack.includes(x));
  }
}

export default Str;
