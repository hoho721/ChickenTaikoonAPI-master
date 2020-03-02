import CMError from "../../CMError";
import statusCodes from "../../conf/statusCodes";
import settings from '../../conf/settings';
import chickenSettings from '../../conf/chickenSetting';
import _ from "underscore";
import rand from 'random';
import {chickenUtil} from "./index";

class ChickenUtil {
    constructor() {
    }

    // 내 닭 리스트
    getMyChickenList(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx, healthy, hp, lovely, grade, name, chicken_code, gendate, last_egg_date, last_play_date, last_food_date,play_count,clean_count,food_count, now() as current FROM tb_my_chicken WHERE user_code=? order by grade', [user_code])
                .then(rows => {
                    resolve(rows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 판매 가능한 닭 리스트
    getMyChickenListForSell(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx, healthy, hp, lovely, grade, name, chicken_code, gendate FROM tb_my_chicken WHERE user_code=? AND grade != ? AND healthy != ?  order by grade', [user_code, chickenSettings.GRADE_NONE, chickenSettings.CHICKEN_STATUS_DEAD])
                .then(rows => {
                    resolve(rows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 판매한 닭 삭제
    deleteMyChickenListForSell(conn, where, params) {
        return new Promise((resolve, reject) => {
            conn.query(`DELETE FROM tb_my_chicken WHERE user_code=? AND (${where})`, params)
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 내 닭 리스트
    getMyChickenListByIDX(conn, user_code, where, ids) {
        return new Promise((resolve, reject) => {
            conn.query(`SELECT idx, healthy, hp, lovely, grade, name, chicken_code, gendate, last_egg_date, last_play_date, last_food_date, now() as current FROM tb_my_chicken WHERE user_code=? AND (${where})  order by grade`, [user_code, ...ids])
                .then(rows => {
                    resolve(rows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    getMyChickenListById(conn, where, params) {
        return new Promise((resolve, reject) => {
            conn.query(`SELECT idx, grade FROM tb_my_chicken WHERE user_code=? AND (${where})  order by grade`, params)
                .then(rows => {
                    resolve(rows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 진화 전 닭 리스트
    getMyChickenBeforeUpgrade(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx, healthy, hp, lovely, grade, name, chicken_code, gendate, last_egg_date, last_play_date, last_food_date, now() as current FROM tb_my_chicken WHERE user_code=? AND grade=?', [user_code, chickenSettings.GRADE_NONE])
                .then(rows => {
                    resolve(rows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 알 생산 가능 닭
    getUpgradedChickenList(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx, chicken_code, gendate, last_egg_date, now() as current FROM tb_my_chicken WHERE user_code=? AND grade != ? AND healthy != ?  order by grade', [user_code, chickenSettings.GRADE_NONE, chickenSettings.CHICKEN_STATUS_DEAD])
                .then(rows => {
                    resolve(rows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 선택한 닭 상태
    getSelChickenInfo(conn, user_code, chicken_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx,name, grade, healthy, lovely,hp, gendate,chicken_code,food_count,play_count,clean_count, IF(last_egg_date is NULL,now(),last_egg_date )  as last_egg_date, now() as current,food_1,food_2,food_3,food_4,food_5  FROM tb_my_chicken WHERE user_code=? AND idx=?', [user_code, chicken_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, '선택한 닭 정보가 없습니다.', 500))
                    }

                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    /*
    *
    *           리스트 불러올때  상태 변경
    * */

    // 닭 호감도, 체력 업데이트 날짜 수정
    // 30분 타이머 체크용, 오프라인 체크
    updateDateUpdate(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_update_his (user_code, last_update_date) VALUES(?,now()) ON DUPLICATE KEY UPDATE last_update_date=now()', [user_code])
                .then(result => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 상태 업데이트 시간 확인, 업데이트가 필요한지 확인
    getRemainUpdateSecond(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT TIMESTAMPDIFF(second, last_update_date, now()) AS remain FROM tb_update_his WHERE user_code=?', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].remain);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 닭 호감도, 체력, 상태 수정
    decreaseChickenStatus(conn, user_code, hp, love, INTERVAL) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET hp=IF(hp+?<0,0,hp+?), lovely=IF(lovely+?<0,0,lovely+?) WHERE user_code=? AND healthy != ? AND TIMESTAMPDIFF(second , last_food_date, now()) >= ?', [hp,hp, love,love, user_code, chickenSettings.CHICKEN_STATUS_DEAD, INTERVAL])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 닭 체력, 호감도 추가 하락
    decreaseChickenWhenSickStatus(conn, user_code, hp, love, INTERVAL) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET hp=IF(hp+?<0,0,hp+?), lovely=IF(lovely+?<0,0,hp+?) WHERE user_code=? AND healthy=? AND TIMESTAMPDIFF(second , last_food_date, now()) >= ?', [hp,hp, love,love, user_code, chickenSettings.CHICKEN_STATUS_SICK, INTERVAL])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 놀아준 시간으로 호감도 하락
    decreaseChickenLoveStatus(conn, user_code, love, INTERVAL) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET lovely=IF(lovely+?<0,0,lovely+?) WHERE user_code=? AND healthy != ? AND TIMESTAMPDIFF(minute , last_food_date, now()) >= ?', [love,love, user_code, chickenSettings.CHICKEN_STATUS_DEAD, INTERVAL])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    //닭, 호감도, 체력 증가
    //increaseChickenStatus(conn, where, params) {
    increaseChickenStatusALL(conn, user_code, hp,love,chicken_list) {
        return new Promise((resolve, reject) => {
            //conn.query(`UPDATE tb_my_chicken SET hp=hp+?, lovely=lovely+?, last_food_date=now() WHERE user_code=? AND healthy!=${chickenSettings.CHICKEN_STATUS_DEAD} AND ${where}`,params)
            conn.query(`UPDATE tb_my_chicken SET hp=IF (hp+?>100,100,hp+?), lovely= IF (lovely+?>100,100,lovely+?), last_food_date=now() WHERE user_code=? AND healthy!=${chickenSettings.CHICKEN_STATUS_DEAD} AND idx in (?)`,[hp,hp,love,love,user_code,chicken_list])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }
    //닭, 호감도, 체력 증가
    //increaseChickenStatus(conn, where, params) {
    increaseChickenStatus(conn, user_code, hp,love,chicken_code,max_hp) {
        return new Promise((resolve, reject) => {
            //conn.query(`UPDATE tb_my_chicken SET hp=hp+?, lovely=lovely+?, last_food_date=now() WHERE user_code=? AND healthy!=${chickenSettings.CHICKEN_STATUS_DEAD} AND ${where}`,params)
            conn.query(`UPDATE tb_my_chicken SET hp=IF (hp+?>${max_hp},${max_hp},hp+?), lovely= IF (lovely+?>100,100,lovely+?), last_food_date=now() WHERE user_code=? AND healthy!=${chickenSettings.CHICKEN_STATUS_DEAD} AND idx = ?`,[hp,hp,love,love,user_code,chicken_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    //닭 먹은 모이 상태변경
    //increaseChickenStatus(conn, where, params) {
    increaseChickenFoodStatus(conn, user_code,chicken_list,food_type) {
        return new Promise((resolve, reject) => {
            //conn.query(`UPDATE tb_my_chicken SET hp=hp+?, lovely=lovely+?, last_food_date=now() WHERE user_code=? AND healthy!=${chickenSettings.CHICKEN_STATUS_DEAD} AND ${where}`,params)
            conn.query(`UPDATE tb_my_chicken SET food_${food_type} = food_${food_type}+1 WHERE user_code=? AND healthy!=${chickenSettings.CHICKEN_STATUS_DEAD} AND grade = 0 AND idx in (?)`,[user_code,chicken_list])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 청결도 하락
    decreaseFarmDirtyStatus(conn, user_code, dirty) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_building SET dirty=IF(dirty+?>100,100,dirty+?) WHERE user_code=?', [dirty,dirty, user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 청결도 상승
    cleanFarm(conn, user_code, dirty) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_building SET dirty = IF (dirty < ?, 0, dirty-?), last_clean_date=now() WHERE user_code=?', [dirty,dirty, user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 닭 상태 업데이트
    checkDeadChickens(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET healthy=? WHERE user_code=? AND hp <= 0', [chickenSettings.CHICKEN_STATUS_DEAD, user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 닭 알낳은 시간 업데이트
    updateLastEggProductionDate(conn, user_code, chicken_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET last_egg_date=now() WHERE user_code=? AND idx=?', [user_code, chicken_code])
                .then(result => {
                    resolve(result.affectedRows)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 닭 알 낳은 시간 업데이트
    updateLastEggProductionDateOnLoop(conn, user_code, chicken_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET last_egg_date=now() WHERE user_code=? AND idx=?', [user_code, chicken_code])
                .then(result => {
                    resolve(result.affectedRows)
                })
                .catch(err => {
                    resolve(err);
                })
        })
    }

    // 달 알 생성 요청
    reqGenEggOnLoop(conn, user_code, type, chicken_code, count) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_egg_gen (gen_code, user_code, type, gendate, chicken_code, count) VALUES (uuid(), ?,?,now(),?,?) ON DUPLICATE KEY UPDATE count=count+?',
                        [user_code, type, chicken_code, count, count])
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    resolve(err);
                })
        })
    }

    // 닭 알 생성 요청
    reqGenEgg(conn, user_code, type, chicken_code, count) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_egg_gen (gen_code, user_code, type, gendate, chicken_code, count) VALUES (uuid(), ?,?,now(),?,?) ON DUPLICATE KEY UPDATE count=count+1',
                [user_code, type, chicken_code, count, type, count])
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 닭 알 남은 갯수 줄이기
    deleteOneEggGenReq(conn, user_code, gen_code, chicken_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_egg_gen SET `count` = `count`-1 WHERE user_code=? AND gen_code=? AND chicken_code=?', [user_code, gen_code, chicken_code])
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 닭 알 요청 삭제
    deleteEggGenReq(conn, user_code, gen_code, chicken_code) {
        return new Promise((resolve, reject) => {
            conn.query('DELETE FROM tb_egg_gen WHERE user_code=? AND gen_code=? AND chicken_code=?', [user_code, gen_code, chicken_code])
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 닭 알 요청 전체 삭제
    deleteAllEggGenList(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('DELETE FROM tb_egg_gen WHERE user_code=?', [user_code])
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 닭 알 요청 리스트
    getGenEggList(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT gen_code, type, gendate, chicken_code, count FROM tb_egg_gen WHERE user_code=?', [user_code])
                .then(rows => {
                    resolve(rows)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 닭 알 요청 개수 리스트
    getGenEggCount(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT sum(count) as sum FROM tb_egg_gen WHERE user_code=?', [user_code])
                .then(rows => {
                    resolve(rows[0].sum)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 선택한 닭 알 요청 상태
    getSelGenEggInfo(conn, user_code, chicken_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT gen_code, type, gendate, count FROM tb_egg_gen WHERE user_code=? AND chicken_code=?', [user_code, chicken_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0])
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, '요청정보를 찾을수 없습니다.', 500));
                    }

                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 선택한 닭 알 요청 상태
    getSelGenEggInfoByGenCode(conn, user_code, chicken_code, gen_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT type, gendate, count FROM tb_egg_gen WHERE user_code=? AND chicken_code=? AND gen_code=?', [user_code, chicken_code, gen_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0])
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, '요청정보를 찾을수 없습니다.', 500));
                    }

                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 닭 체력, 호감도 증가
    increaseChickenHP(conn, user_code, hp, love) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET lovely=IF(lovely+? >100,100,lovely+?) WHERE user_code=? AND healthy != ?', [love, love, user_code, chickenSettings.CHICKEN_STATUS_DEAD])
                .then(result => {
                    resolve(result.affectedRows)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 호감도만 증가
    playWithChicken(conn, user_code, chicken_code, love) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET lovely= IF(lovely+? > 100,100,lovely+?) , last_play_date=now() WHERE user_code=? AND idx=? AND healthy != ?', [love,love, user_code, chicken_code, chickenSettings.CHICKEN_STATUS_DEAD])
                .then(result => {
                    resolve(result.affectedRows)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 닭 치료하기
    cureChicken(conn, user_code,chicken_code, hp, love,max_hp) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET hp = IF(hp+?>?,?,hp+?), lovely = IF(lovely+?>100,100,lovely+?), healthy = ? WHERE user_code=? AND healthy=? AND idx = ?', [hp,max_hp,max_hp,hp, love,love, chickenSettings.CHICKEN_STATUS_GOOD, user_code, chickenSettings.CHICKEN_STATUS_SICK,chicken_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CURE_FAILED, "치료할 닭이 없습니다."))
                    }

                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 닭종류 랜덤 선택
    getRandomChickenType(conn, grade) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx, name, type, type_name FROM tb_chicken WHERE grade=?', [grade])
                .then(rows => {
                    if(rows.length > 0) {
                        // 목록에서 랜덤으로 선택
                        let index = rand.int(0, rows.length - 1);
                        resolve(rows[index])
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, "닭 타입이 존재하지 않습니다.."))
                    }

                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 내 닭 진화 상태 저장
    updateMyChickenGradeAndType(conn, user_code, chicken_code, ref_chicken_code, grade) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET chicken_code=?, grade=?, last_egg_date=now() WHERE user_code=? AND idx=?', [ref_chicken_code, grade, user_code, chicken_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, "진화 상태 저장 실패."))
                    }

                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 닭이 아픈 상태인지 확인
    getRandomChickenSickStatus (percent) {
        let count = 0;
        _.range(0, 100, 1)
            .forEach(n => {
                let status = rand.int(chickenSettings.CHICKEN_STATUS_GOOD, chickenSettings.CHICKEN_STATUS_SICK);
                count = status === chickenSettings.CHICKEN_STATUS_SICK ? count + 1 : count;
            });

        return count >= percent
    }

    // 닭 갯수
    getCountChickenById(conn, where, params) {
        return new Promise((resolve, reject) => {
            conn.query(`SELECT COUNT(*) as count FROM tb_my_chicken WHERE user_code=? AND (${where})`, params)
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].count)
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, "닭 없음"))
                    }

                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 확률
    getRandomWithWeight(threshold) {
        /*let count = 0;
        _.range(0, 100, 1)
            .forEach(n => {
                let num = rand.int(min, max);
                count = (num === numberUwant ? count + 1 : count);
            });

        console.log(count);
        return count <= threshold*/

        let num = rand.int(1, 100);
        return num <= threshold ? chickenSettings.EGG_GOLD : chickenSettings.EGG_NORMAL;
    }

    // 등급업 확률
    isUpgradeSuccess(threshold) {
        let num = rand.int(1, 100);
        return num <= threshold;
    }

    /*
    *  닭 관련
    * */
    genStorage(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_storage_status (user_code, max_egg_count, max_chicken_count) VALUES(?,?,?)', [user_code, chickenSettings.DEFAULT_MAX_EGG, chickenSettings.DEFAULT_MAX_CHICKEN])
                .then(result => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 저장고 수치 불러오기
    getStorage(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT max_egg_count, max_chicken_count FROM tb_storage_status WHERE user_code=?', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0])
                    } else {
                        resolve({
                            max_egg_count: chickenSettings.DEFAULT_MAX_EGG,
                            max_chicken_count: chickenSettings.DEFAULT_MAX_CHICKEN
                        })
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 계란 갯수 수정
    updateNormalEggCount(conn, user_code, count) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_egg SET normalegg = normalegg + ?, last_egg_date=now() WHERE user_code=? and normalegg >= 30', [count, user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 황금 알 갯수 증가
    updateGoldEggCount(conn, user_code, count) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_egg SET goldegg = goldegg + ?, last_egg_date=now() WHERE user_code=?', [count, user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 계란 생성 히스토리
    addEggHistory(conn, user_code, count, type) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_egg_his (user_code, type, count, gendate) VALUES(?,?,?,now())', [user_code, type, count])
                .then((result => {
                    resolve(result.affectedRows);
                }))
                .catch(err => {
                    reject(err);
                })
        })
    }




   // 닭 등급 예상점수
    calcChickenGradeScore(hp, love,  play_count,food_count,clean_count) {

        //aliveTime = (aliveTime/2) > 100 ? 100 : (aliveTime/2);
        hp = hp > 150 ? 150 : hp;
        hp = hp/150*100;
        love = love > 100 ? 100 : love;
        play_count =  play_count / chickenSettings.CHICKEN_UPGRADE_PLAY * 100;
        if(play_count>100) play_count = 100;
        food_count =  food_count / chickenSettings.CHICKEN_UPGRADE_FOOD * 100;
        if(food_count>100) food_count = 100;
        clean_count =  clean_count / chickenSettings.CHICKEN_UPGRADE_CLEAR * 100;
        if(clean_count>100) clean_count = 100;


        return Math.floor(((hp + love + play_count + food_count + clean_count) / 5))
    }

    /*
    *
    * // 점수 구간
    SCORE_RANGE_A: 1,                                       // A
    SCORE_RANGE_A_B: 2,                                     // A ~ B
    SCORE_RANGE_A_C: 3,                                     // A ~ C
    SCORE_RANGE_B_C: 4,                                     // B ~ C
    SCORE_RANGE_C_D: 5,                                     // C ~ D
    SCORE_RANGE_D_F: 6,                                     // D ~ F
    SCORE_RANGE_F: 7,                                       // F
    * */
    getGradeRangeCode(score) {

        if(score === 100) {
            return chickenSettings.SCORE_RANGE_A
        } else if(score >= 85) {
            return chickenSettings.SCORE_RANGE_A_B;
        } else if(score >= 70) {
            return chickenSettings.SCORE_RANGE_A_C;
        } else if(score >= 60) {
            return chickenSettings.SCORE_RANGE_B_C;
        } else if(score >= 50) {
            return chickenSettings.SCORE_RANGE_C_D;
        } else if(score >= 40) {
            return chickenSettings.SCORE_RANGE_D_F;
        } else {
            return chickenSettings.SCORE_RANGE_F
        }
    }

    //
    getGradeRangeText(score) {
        if(score === 100) {
            return 'A ~ B'
        } else if(score >= 85) {
            return 'A ~ B';
        } else if(score >= 70) {
            return 'A ~ C';
        } else if(score >= 60) {
            return 'B ~ C';
        } else if(score >= 50) {
            return 'C ~ D';
        } else if(score >= 40) {
            return 'D ~ F';
        } else {
            return 'F'
        }
    }

    // 등급 정하기
    getGrade(score,gradeUpPercent) {
        if(score === 100) {
            let rdi = rand.int(1,100);
            if(rdi<(30+gradeUpPercent))
            {
                return chickenSettings.GRADE_A;
            }else{
                return chickenSettings.GRADE_B;
            }


        } else if(score >= 85) {
            let rdi = rand.int(1,100);
            if(rdi<(10+gradeUpPercent))
            {
                return chickenSettings.GRADE_A;
            }else{
                return chickenSettings.GRADE_B;
            }

        } else if(score >= 70) {

            let rdi = rand.int(1,100);
            if(rdi<5) {
                return chickenSettings.GRADE_A;
            }else if(rdi < (70+gradeUpPercent))
            {
                return chickenSettings.GRADE_B;
            }
            else{
                return chickenSettings.GRADE_C;
            }


        } else if(score >= 60) {

            let rdi = rand.int(1,100);
            if(rdi<30) {
                return chickenSettings.GRADE_B;
            }else if(rdi < (90+gradeUpPercent))
            {
                return chickenSettings.GRADE_C;
            }
            else{
                return chickenSettings.GRADE_D;
            }

        } else if(score >= 50) {

            let rdi = rand.int(1,100);
            if(rdi<20) {
                return chickenSettings.GRADE_C;
            }else if(rdi < (80+gradeUpPercent))
            {
                return chickenSettings.GRADE_D;
            }
            else{
                return chickenSettings.GRADE_F;
            }

        } else if(score >= 40) {
            let rdi = rand.int(1,100);
            if(rdi < (50+gradeUpPercent))
            {
                return chickenSettings.GRADE_D;
            }
            else{
                return chickenSettings.GRADE_F;
            }
        } else {
            return chickenSettings.GRADE_F;
        }
    }

    // 치킨 이름 바꾸기
    changeChickenName(conn, user_code,chicken_code,chicken_name){
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET name = ? WHERE `idx` = ? and user_code = ?', [chicken_name,chicken_code,user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 최대 달걀 개수
    getMaxEggCount(conn, user_code){
        return new Promise((resolve, reject) => {
            conn.query('SELECT ware*30 as count FROM tb_my_building WHERE user_code = ?', [user_code])
                .then(rows => {
                    resolve(rows[0].count);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 내 달걀 개수
    getMyEggCount(conn, user_code){
        return new Promise((resolve, reject) => {
            conn.query('SELECT normalegg  FROM tb_egg WHERE user_code = ?', [user_code])
                .then(rows => {
                    resolve(rows[0].normalegg);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

        // 바닥에 있는 달걀 개수
    getReqEggs(conn, user_code){
        return new Promise((resolve, reject) => {
            conn.query('SELECT sum(count) as count  FROM tb_egg_gen WHERE user_code = ?', [user_code])
                .then(rows => {
                    resolve(rows[0].count);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 청소 가능여부 확인
    getCleanIsOk(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('select (-TIMESTAMPDIFF(second,now(),last_clean_date)>?) as isok from chicken.tb_my_building where user_code = ?', [settings.CLEAN_REUSE_TIME,user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].isok);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 먹이 가능여부 확인
    getFoodIsOk(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('select (-TIMESTAMPDIFF(second,now(),last_food_date)>?) as isok from chicken.tb_my_chicken where user_code = ? order by last_food_date DESC limit 1', [settings.FOOD_REUSE_TIME,user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].isok);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 청소 가능여부 확인
    getCleantime(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('select -TIMESTAMPDIFF(second,now(),last_clean_date) as cleantime from chicken.tb_my_building where user_code = ?', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].cleantime);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 먹이 가능여부 확인
    getFoodtime(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('select -TIMESTAMPDIFF(second,now(),last_food_date) as foodtime from chicken.tb_my_chicken where user_code = ? order by last_food_date DESC limit 1', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].foodtime);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 진화가능여부 확인
    getIsUpgrade(conn, user_code,chicken_code) {
        return new Promise((resolve, reject) => {
            conn.query('select (-TIMESTAMPDIFF(second,now(),gendate) > ? ) as old  from tb_my_chicken where user_code = ? and idx =?', [chickenSettings.CHICKEN_UPGRADE_TIME,user_code,chicken_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].old);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 질병 가능 여부 확인

    getlassickdate(conn, user_code,chicken_code) {
        return new Promise((resolve, reject) => {
            conn.query('select IF(DATE_ADD(last_sick_date,INTERVAL ? MINUTE) < now(),1,0) as issickok  from tb_my_chicken where user_code = ? and idx =?', [chickenSettings.CHICKEN_SICK_INTERVAL,user_code,chicken_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].issickok);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 병걸리기
    setchickensick(conn, user_code,chicken_code,sick_check){
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET healthy = IF(healthy=3 ,3,IF(healthy=2,2,?))  , last_sick_date = now() WHERE idx = ? and user_code = ?', [sick_check,chicken_code,user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 병걸린 병아리 삭제
    chickclean(conn, user_code){
        return new Promise((resolve, reject) => {
            conn.query('DELETE FROM tb_my_chicken WHERE user_code = ? AND healthy = 3', [user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 놀아줄 수 있는 시간 확인
    playtimecheck(conn, user_code,chicken_code) {
        return new Promise((resolve, reject) => {
            conn.query('select (-TIMESTAMPDIFF(second,now(),last_play_date)) > ? as playcheck  from tb_my_chicken where user_code = ? and idx = ?', [chickenSettings.CHICKEN_PLAY_TIME,user_code,chicken_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].playcheck);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    // 튜토리얼 놀아주기
    settutorialenjoy(conn, user_code){
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET last_play_date =  DATE_ADD(now(),INTERVAL - 1 HOUR) WHERE user_code = ?', [user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 튜토리얼 병걸리기
    settutorialsick(conn, user_code){
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET healthy = 2  , last_sick_date = now() WHERE user_code = ?', [user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 튜토리얼 병걸리기
    settutorialupgrade(conn, user_code){
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET gendate = DATE_ADD(now(),INTERVAL -50 HOUR) WHERE user_code = ?', [user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 튜토리얼 알지급
    settutorialegg(conn, user_code){
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_egg SET normalegg = 30 WHERE user_code = ?', [user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 닭 알낳은 시간 업데이트 - (전체)  최신 v
    updateLastEggDateAll(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET last_egg_date=now() WHERE user_code=?', [user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 알낳을 치킨개수 확인

    getchickencount(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('select count(*) as count,min(last_egg_date) as last_egg_date,now() as current from tb_my_chicken where user_code = ? and grade >0', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 놀아주기 횟수 증가
    setplaycount(conn, user_code,chicken_code){
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET play_count = play_count + 1 WHERE user_code = ? and idx = ?', [user_code,chicken_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 청소 횟수 증가
    setcleancount(conn, user_code){
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET clean_count = clean_count + 1 WHERE user_code = ?', [user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 먹이 횟수 증가
    setfoodcount(conn, user_code){
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_my_chicken SET food_count = food_count + 1 WHERE user_code = ?', [user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }








}

export default ChickenUtil;