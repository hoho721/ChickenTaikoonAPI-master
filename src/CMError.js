
class CMError {

    constructor(code, reason, httpCode=500) {
        this.name = "CMError";
        this.code = code;
        this.httpCode = httpCode;
        this.reason = reason;
    }
}

CMError.prototype = Object.create(Error.prototype);

export default CMError;