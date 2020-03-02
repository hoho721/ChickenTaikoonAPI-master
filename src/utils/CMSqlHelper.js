import {utils} from "./index"
import mysql from "promise-mysql";
import Config from '../Config'
import CMError from "../CMError";
import statusCodes from "../conf/statusCodes";

class CMSqlHelper {
    constructor() {
        this._pool = null;
    }


    createPool() {
        if (utils.isExist(this._pool)) {
            return this._pool;
        }

        let config = {
            connectionLimit: Config.DB_POOL_CONN_LIMIT,
            host : Config.DB_HOST,
            user : Config.DB_USER,
            password : Config.DB_PASS,
            database : Config.DB_NAME
        };
        this._pool = mysql.createPool(config);
        return this._pool;
    }

    releaseConn(conn) {
        conn.release();
    }

    doCatch(conn, err, next) {
        conn.release();
        if (err instanceof CMError) {
            next(err);
        } else {
            const message = err ? err.toString() : "";
            next(new CMError(statusCodes.CODE_ERR_DB, message, 500));
        }
    };
}

export default CMSqlHelper;