import CMError from "../../CMError";
import statusCodes from "../../conf/statusCodes";
import settings from "../../conf/settings";
import chickenSettings from "../../conf/chickenSetting";

class UserUtil {
    constructor() {
    }

    isExistUid(conn, uid) {
        return new Promise((resolve, reject) => {

            conn.query('SELECT EXISTS (SELECT * FROM tb_user WHERE uid=?) AS success', [uid])
                .then(rows => {
                    resolve(rows[0].success === 1);
                })
                .catch(err => {
                    reject(err);
                })
        });
    }

    isExistNick(conn, nick) {
        return new Promise((resolve, reject) => {

            conn.query('SELECT EXISTS (SELECT * FROM tb_user WHERE nick=?) AS success', [nick])
                .then(rows => {
                    resolve(rows[0].success === 1);
                })
                .catch(err => {
                    reject(new CMError(statusCodes.CODE_ERR_USER_ALERT, "아이디를 찾을 수 없습니다.", 500));
                })
        });
    }

    addUserInfo(conn, uid, upw, nick, salt, code, joinType, gender, age) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_user (uid, upw, nick, salt, code, gendate, join_type, gender, age) VALUES (?,?,?,?,?,now(),?,?,?)', [uid, upw, nick, salt, code, joinType, gender, age])
                .then(result => {
                    if(result.affectedRows > 0) {
                        console.log(result);
                        resolve(result.insertId);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_USER_ALERT, "회원가입을 진행할 수 없습니다. 잠시후에 다시 시도해주세요.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });
    }

    makeUserPointInfo(conn, user_code) {
        return new Promise((resolve, reject) => {
           conn.query('INSERT INTO tb_point (user_code, gold) VALUES (?,?)', [user_code, settings.DEFAULT_GOLD])
               .then(result => {
                   if(result.affectedRows > 0) {
                       resolve();
                   } else {
                       reject(new CMError(statusCodes.CODE_ERR_USER_ALERT, "회원가입을 진행할 수 없습니다. 잠시후에 다시 시도해주세요.", 500));
                   }
               })
               .catch(err => {
                   reject(err);
               })

        });
    }


    makeUserDevelopmentInfo(conn, user_code, type) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_my_development (user_code, type, level) VALUES(?, ?,1)', [user_code,type,1])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve(true);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, "query failed.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    makeUserBuildingInfo(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_my_building (user_code, last_clean_date) VALUES(?, DATE_ADD(now(),INTERVAL -1 HOUR) )', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve(true);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, "query failed.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    makeUserEggTable(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_egg (user_code) VALUES (?)', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve(true);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, "query failed.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    getPointInfo(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT point, gold,ticket,heart,acc_point,acc_gold,used_point FROM tb_point WHERE user_code=?', [user_code])
                .then(rows => {

                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, "포인트 정보가 없습니다.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });
    }

    getMyBuildingInfo(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT home, ware, chicken, fence, dirty, last_clean_date FROM tb_my_building WHERE user_code=?', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, "포인트 정보가 없습니다.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    getMyPointAndBuildingInfo(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT home, ware, chicken, fence, point, gold, dirty, last_clean_date FROM tb_my_building AS a INNER JOIN tb_point AS b ON a.user_code=b.user_code WHERE a.user_code=?', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, "정보가 없습니다.", 500));
                    }
                })
                .catch(err => reject(err))

        })
    }

    getUserInfo(conn, user_code) {
        return new Promise((resolve, reject) => {
           conn.query('SELECT nick, code, gender, age FROM tb_user WHERE idx=?', [user_code])
               .then(rows => {
                   if(rows.length > 0) {
                       resolve(rows[0]);
                   } else {
                       reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, "사용자 정보가 없습니다.", 500));
                   }
               })
               .catch(err => {
                   reject(err);
               })
        });
    }


    getMyEgg(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT normalegg, goldegg FROM tb_egg WHERE user_code=?', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0])
                    } else {
                        resolve({
                            normalegg: 0,
                            goldegg: 0
                        })
                    }
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    getMyDevelopmentsInfo(conn, user_code){
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx,type,level FROM tb_my_development WHERE user_code=?', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, "건물 업그레이드 정보가 없습니다.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    getMarketInfo(conn){
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx,chicken_type,price,price2,price3,price4,price5,min_ratio,ratio_per_grade FROM tb_event_market;', [])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, "장터 정보가 없습니다.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }






    // 닭 체력, 호감도 증가
    signout(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_user SET uid = concat(concat(uid,\'_signoff\'),idx) ,upw = concat(upw,\'_signoff\'), join_type = 2 WHERE idx = ?', [user_code])
                .then(result => {
                    resolve(result.affectedRows)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    getPushTicket(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT push_ticket FROM tb_user WHERE idx=?', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].push_ticket);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, "계정 정보가 없습니다.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });
    }


    getPushCount(conn, nick) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT push_count FROM tb_user WHERE nick=?', [nick])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].push_count);
                    }else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, "추천인 정보가 없습니다.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });
    }


    // 계약 시작 증가
    setpush(conn, nick) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_user SET push_count = push_count + 1 WHERE nick=?', [nick])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '추천 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 계약 시작 증가
    usepush(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_user SET push_ticket = 0 WHERE idx=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '추천 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    getPushusercode(conn, nick) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx FROM tb_user WHERE nick=?', [nick])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].idx);
                    }else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, "추천인 정보가 없습니다.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });
    }


    getreferrercount(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT push_ticket FROM tb_user WHERE idx=?', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].push_ticket);
                    }else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, "추천인 정보가 없습니다.", 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });
    }

}

export default UserUtil