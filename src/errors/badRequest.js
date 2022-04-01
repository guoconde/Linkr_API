export default class BadRequest extends Error {
  constructor(message) {
    super();
    this.status = 400;
    this.message = message;
  }
}