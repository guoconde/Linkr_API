export default class Conflict extends Error {
    constructor(message) {
        super();
        this.status = 409;
        this.message = message;
    }
}