class RequestError extends Function {
    constructor(code, message) {
        super("...args", "return this.call(...args)");
        this.code = code;
        this.message = message;
        return this.bind(this);
    }

    call(response) {
        return response.status(this.code).json({error: this.message})
    }
}

export const Unauthorized = new RequestError(401, "Unauthorized")
export const Forbidden = new RequestError(403, "Forbidden")
export const NotFound = new RequestError(404, "Not Found")
export const UnprocessableEntity = new RequestError(422, "Unprocessable Entity")
export const InternalError = new RequestError(500, "Internal Server Error")

export { RequestError }
