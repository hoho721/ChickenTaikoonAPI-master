import CMError from "../../CMError";
import statusCodes from "../../conf/statusCodes";

class AdminUtil {
    constructor() {
    }

    // 업체 추가
    addCompany(conn, name, days, chicken_count, level, deposit, penalty, min_grade) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_company (name, days, chicken_count, level, deposit, penalty, min_grade) VALUES(?,?,?,?,?,?,?)', [name, days, chicken_count, level, deposit, penalty, min_grade])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve(result.insertId);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_PARAMS, "업체 정보 추가 실패.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });
    }

    // 아이템 추가
    addItem(conn, name, description, type, price) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_game_store (name, description, type, price) VALUES(?,?,?,?)', [name, description, type, price])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve(result.insertId);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_PARAMS, "추가 실패.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 연구 목록 추가
    addDevelopment(conn, type, name, price, max) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_development (type, name, price, max_level) VALUES(?,?,?,?)', [type, name, price, max])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve(result.insertId);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_PARAMS, "추가 실패.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 닭 종류 추가
    addChicken(conn, grade, name, type, type_name) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_chicken (grade, name, type, type_name) VALUES(?,?,?,?)', [grade, name, type, type_name])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve(result.insertId);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_PARAMS, "추가 실패.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


}

export default AdminUtil