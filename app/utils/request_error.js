/**
 * Custom error class for handling HTTP request errors.
 * @extends {Function}
 */
class RequestError extends Function {
    /**
     * Creates an instance of RequestError.
     * @param {number} code - The HTTP status code associated with the error.
     * @param {string} message - The error message.
     */
    constructor(code, message) {
        super("...args", "return this.call(...args)");
        this.code = code;
        this.message = message;
        return this.bind(this);
    }

    /**
     * Handles the response by setting the HTTP status code and sending a JSON error object.
     * @param {Object} response - Express response object.
     * @returns {Object} - Express response object.
     */
    call(response) {
        return response.status(this.code).json({error: this.message})
    }
}

// Export specific instances of RequestError for common HTTP error statuses.

/**
 * Represents a 400 Bad Request error.
 * @type {RequestError}
 */
export const BadRequest = new RequestError(400, "Bad Request");

/**
 * Represents a 401 Unauthorized error.
 * @type {RequestError}
 */
export const Unauthorized = new RequestError(401, "Unauthorized");

/**
 * Represents a 403 Forbidden error.
 * @type {RequestError}
 */
export const Forbidden = new RequestError(403, "Forbidden");

/**
 * Represents a 404 Not Found error.
 * @type {RequestError}
 */
export const NotFound = new RequestError(404, "Not Found");

/**
 * Represents a 409 Conflict error.
 * @type {RequestError}
 */
export const Conflict = new RequestError(409, "Conflict");

/**
 * Represents a 422 Unprocessable Entity error.
 * @type {RequestError}
 */
export const UnprocessableEntity = new RequestError(422, "Unprocessable Entity");

/**
 * Represents a 500 Internal Server Error.
 * @type {RequestError}
 */
export const InternalError = new RequestError(500, "Internal Server Error");

export { RequestError }
