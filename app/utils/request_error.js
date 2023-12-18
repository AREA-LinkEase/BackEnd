class RequestError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.message = message;
    }
}

export { RequestError }