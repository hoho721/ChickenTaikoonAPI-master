import CMError from "../../CMError";
import statusCodes from "../../conf/statusCodes";
import moment from "../../utils/Logger";

class CommUtil {
    constructor() {
    }

    getLoginInfo(conn, uid) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx, upw, salt, code, join_type, nick, gender, age ,tmp_age,DATEDIFF(now(), gendate) as gendate FROM tb_user WHERE uid=?', [uid])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "사용자 정보가 없습니다.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });
    }

    // tmp 나이 세팅
    settmpage(conn, idx,age){
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_user SET tmp_age = ? WHERE idx = ?', [age,idx])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    updatePushInfo(conn, user_code, token) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_push (user_code, token) VALUES(?,?) ON DUPLICATE KEY UPDATE token=?', [user_code, token, token])
                .then(result => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




}

export default CommUtil