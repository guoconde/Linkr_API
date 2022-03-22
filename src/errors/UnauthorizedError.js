export default class Unauthorized extends Error {
    constructor(message) {
        super();
        this.status = 401;
        this.message = message;
    }
}