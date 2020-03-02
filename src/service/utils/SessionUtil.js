import CMError from "../../CMError";
import statusCodes from "../../conf/statusCodes";

class SessionUtil {
    constructor() {
    }

    genSessionKey(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query("INSERT INTO tb_session (session_key, user_code, gendate) VALUES(uuid(),?,now())", [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve();
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_WRONG_SESSION_KEY, "회원가입을 진행할 수 없습니다. 잠시후에 다시 시도해주세요.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    findSessionKey(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query("SELECT session_key,access_state FROM tb_session WHERE user_code=?", [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_WRONG_SESSION_KEY, "session_key error.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    getUserCode(conn, session_key) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT user_code FROM tb_session WHERE session_key=?', [session_key])
                .then(rows => {

                    if(rows.length > 0) {
                        resolve(rows[0].user_code);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "can't find login info.", 501));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });
    }

    updateSessionKey(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_session (user_code, session_key, gendate) VALUES(?,uuid(),now()) ON DUPLICATE KEY UPDATE session_key=uuid(), gendate=now()', [user_code])
                .then(result => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



}

export default SessionUtil