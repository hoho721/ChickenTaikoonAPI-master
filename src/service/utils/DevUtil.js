import CMError from "../../CMError";
import statusCodes from "../../conf/statusCodes";


class DevUtil {
    constructor() {
    }

    // 알 갯수 업그레이드
    upgradeEggStorage(conn, user_code, amount) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_storage_status SET max_egg_count=max_egg_count+? WHERE user_code=?', [amount, user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve(true);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, "egg max count update failed", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 닭 갯수 업그레이드
    upgradeChickenStorage(conn, user_code, amount) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_storage_status SET max_chicken_count=max_chicken_count+? WHERE user_code=?', [amount, user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve(true);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, "chicken max count update failed", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 연구 리스트
    getDevelopmentList(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx, name, type, price, max_level FROM tb_development', [])
                .then(rows => {
                    resolve(rows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 나의 연구 리스트 가져오기
    getMyDevelopmentList(conn,user_code,type) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx, user_code, type,level FROM tb_my_development WHERE user_code = ? AND type = ?', [user_code, type])
                .then(rows => {
                    resolve(rows[0]);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 내 연구 업그레이드
    upgradeMyDevelopment(conn, user_code, type) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_development SET level = level + 1 WHERE user_code=? and type = ?', [user_code, type])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_OTHERS, '연구 실패 했습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }
}

export default DevUtil