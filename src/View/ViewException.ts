import RuntimeException from "../Foundation/Exception/RuntimeException";

class ViewException extends RuntimeException {
  constructor(view: string) {
    super(`view [${view}] not found`);
  }
}

export default ViewException;
