import CMError from "../../CMError";
import statusCodes from "../../conf/statusCodes";


class ErrorHandler {
    constructor() {
    }

    doCatch (conn, err, next) {
        if(conn)
            conn.release();

        if (err instanceof CMError) {
            next(err);
        } else {
            const message = err ? err.toString() : "";
            next(new CMError(statusCodes.CODE_ERR_DB, message, 500));
        }
    };

    doHandleError(err, next) {
        if (err instanceof CMError) {
            next(err);
        } else {
            const message = err ? err.toString() : "";
            next(new CMError(statusCodes.CODE_ERR_DB, message, 500));
        }
    }
}

export default ErrorHandler