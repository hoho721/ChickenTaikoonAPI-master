import CMError from "../../CMError";
import statusCodes from "../../conf/statusCodes";
import settings from '../../conf/settings';
import chickenSettings from '../../conf/chickenSetting';

class GameUtil {
    constructor() {
    }


    getGameStoreItemList(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx, name,hp,lovely, description, type, price FROM tb_game_store order by idx', [])
                .then(rows => {
                    resolve(rows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    getSelStoreItem(conn, item_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT name, description, type, price FROM tb_game_store WHERE idx=?', [item_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '아이템 정보가 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    getCompanyList(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx, name, days, chicken_count, level, deposit, penalty, min_grade, \n' +
                'case \n' +
                'when min_grade=1 then "A" \n' +
                'when min_grade=2 then "B" \n' +
                'when min_grade=3 then "C" \n' +
                'when min_grade=4 then "D" \n' +
                'else "F" \n' +
                'end as min_grade_text\n' +
                'FROM tb_company', [])
                .then(rows => {
                    resolve(rows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    //업체 코드로 업체 찾기
    getSelCompanyInfo(conn, companyCode) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT name, days, chicken_count, level, deposit, penalty, min_grade FROM tb_company WHERE idx=?', [companyCode])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '업체 정보가 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 지난 계약 확인
    getLatestContract(conn, user_code, companyCode) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx, TIMESTAMPDIFF(second, now(), enddate) AS remain FROM tb_contract WHERE user_code=? AND company_code=? ORDER BY gendate DESC', [user_code, companyCode])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 업체와 계약
    // 계약금, 완료 날짜 설정
    addContractInfo(conn, user_code, company_code, deposit, interval, penalty) {
        return new Promise((resolve, reject) => {
            conn.query(`INSERT INTO tb_contract (company_code, user_code, gendate, enddate, deposit, penalty) VALUES(?,?,now(),DATE_ADD(gendate, INTERVAL ${interval} DAY),?,?)`,
                [company_code, user_code, deposit, penalty])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve(result.insertId)
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '계약에 실패 했습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 계약 정보 불러오기
    getSelContractInfo(conn, contract_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT company_code, user_code, gendate, enddate, deposit, penalty,delivery_chicken_count FROM tb_contract WHERE idx=?', [contract_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0])
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '계약 정보가 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 사용자 티켓 업데이트
    updateUserTicket(conn, user_code, ticket, acc_ticket, used_ticket) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_point SET ticket = ticket+?, acc_ticket = acc_ticket+?, used_ticket = used_ticket+? WHERE user_code=?', [ticket, acc_ticket, used_ticket, user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '티켓 사용 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 사용자 골드 업데이트
    updateUserGold(conn, user_code, gold, acc_gold, used_gold) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_point SET gold = gold+?, acc_gold = acc_gold+?, used_gold = used_gold+? WHERE user_code=?', [gold, acc_gold, used_gold, user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '골드 차감 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 사용자 포인트 업데이트
    updateUserPoint(conn, user_code, point, acc_point, used_point) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_point SET point = point+?, acc_point = acc_point+?, used_point = used_point+? WHERE user_code=?', [point, acc_point, used_point, user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '골드 차감 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 사용자 하트 업데이트
    updateUserHeart(conn, user_code, heart, acc_heart, used_heart) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_point SET heart = if(heart+? <0,0,heart+?) , acc_heart = acc_heart+?, used_heart = used_heart+? WHERE user_code=?', [heart,heart, acc_heart, used_heart, user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '골드 차감 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 사용자 포인트 히스토리
    addPointHistory(conn, user_code, point, gold, ticket, type) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_point_his (user_code, point, gold, ticket, type, gendate) VALUES(?,?,?,?, ?,now())', [user_code, point, gold, ticket,type])
                .then(result => {
                    resolve()
                })
                .catch(err => {
                    reject(new CMError(statusCodes.CODE_ERR_HISTORY_ADD_FAIL, '히스토리 등록 실패.', 500));
                })
        })
    }


    // 사용자 하트 히스토리
    addHeartHistory(conn, user_code, heart, type) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_point_his (user_code, heart, type, gendate) VALUES(?,?,?,now())', [user_code, heart,type])
                .then(result => {
                    resolve()
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    // 계약 정보 삭제
    deleteContractInfo(conn, user_code, contract_code) {
        return new Promise((resolve, reject) => {
            conn.query('DELETE FROM tb_contract WHERE idx=? AND user_code=?', [contract_code, user_code])
                .then(result => {
                    resolve()
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 계약 히스토리 작성
    addContractHistory(conn, user_code, company_code, name, status, deposit, penalty, sell_price) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_contract_his (user_code, company_code, name, status, deposit, penalty, sell_price) VALUES(?,?,?,?,?,?,?)', [user_code, company_code, name, status, deposit, penalty, sell_price])
                .then(result => {
                    resolve()
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 사용자 계약 정보 불러오기
    getUserContractList(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT a.idx, a.company_code, a.gendate, a.enddate, TIMESTAMPDIFF(second, now(), enddate) AS remain, a.deposit, a.penalty, b.name, b.days, a.delivery_chicken_count,b.chicken_count, b.min_grade \
            FROM tb_contract AS a INNER JOIN tb_company AS b ON a.company_code=b.idx WHERE a.user_code=?', [user_code])
                .then(rows => {
                    resolve(rows)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    //장터 닭 판매 포인트
    getChickensPrice(conn, list) {
        return new Promise((resolve, reject) => {
            conn.query('select sum( case \n' +
                '\twhen A.grade = 1 then B.price\n' +
                '    when A.grade = 2 then B.price2\n' +
                '    when A.grade = 3 then B.price3\n' +
                '    when A.grade = 4 then B.price4\n' +
                '    when A.grade = 5 then B.price5\n' +
                'end ) as point\n' +
                'from chicken.tb_my_chicken as A inner join chicken.tb_event_market as B on A.chicken_code = B.chicken_type where A.idx in (?)', [list])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].point);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '결과가 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    //계약 기간 확인
    getContractDateStat(conn, contract_code,company_code,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT enddate<now() as rslt FROM chicken.tb_contract where idx = ? and company_code = ? and user_code = ?', [contract_code,company_code,user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].rslt);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '계약기간 정보를 찾을 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    /*
    *
    *           아이템 관련
    * */

    // 내 닭 추가
    genNewChick(conn, user_code,chick_name) {
        return new Promise((resolve, reject) => {
            //conn.query('INSERT INTO tb_my_chicken (name, user_code, gendate, last_play_date, last_food_date) VALUES(?,?,now(), now(), now())', [settings.ITEM_CHICK_DEFAULT_NAME, user_code])
            conn.query('INSERT INTO tb_my_chicken (name, user_code, gendate, last_play_date, last_food_date) \n' +
                'select ?,?,now(), now(), DATE_ADD(now(),INTERVAL -1 HOUR) from dual \n' +
                'where (select if(\n' +
                '(select count(*) as count from tb_my_chicken where user_code=?) \n' +
                '<\n' +
                '(select b.chicken+c.level as count from tb_my_building as b left outer join tb_my_development as c on b.user_code = c.user_code where b.user_code = ? and c.type = 6)\n' +
                ',1,0)) > 0', [chick_name, user_code,user_code,user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve(result.insertId);
                    } else {
                        reject(false);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    //  내 치킨 갯수
    getMyChickCount(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT COUNT(*) as count FROM tb_my_chicken WHERE user_code=?', [user_code])
                .then(rows => {
                    resolve(rows[0].count)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 아이템 인벤토리에 추가
    addItem(conn, user_code, item_code, count) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_item_inventory (user_code, item_code, count) VALUES(?,?,?) ON DUPLICATE KEY UPDATE count=count+?', [user_code, item_code, count, count])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve();
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, 'failed to add item info to inventory', 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 내 아이템 인벤토리
    getMyInventory(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT a.idx, a.item_code, a.count, b.name, b.description, b.type, b.price FROM tb_item_inventory AS a INNER JOIN tb_game_store AS b ON a.item_code=b.idx WHERE user_code=? order by idx', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, 'failed to get inventory', 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 내 아이템 / 선택한 아이템 정보
    getInventorySelItemInfo(conn, user_code, item_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT a.idx, a.item_code, a.count, b.name, b.description, b.type, b.price FROM tb_item_inventory AS a INNER JOIN tb_game_store AS b ON a.item_code=b.idx WHERE user_code=? AND item_code=?', [user_code, item_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, 'failed to find item info', 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 내아이템 사용
    useInventoryItem(conn, user_code, item_code, count) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_item_inventory SET count=count-? WHERE user_code=? AND item_code=?', [count, user_code, item_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, '아이템 사용 갯수 초과', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 아이템 사용 히스토리
    addItemUseHistory(conn, user_code, item_code, count) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_chicken_food_his (user_code, item_code, count, gendate) VALUES (?,?,?,now())', [user_code, item_code, count])
                .then(result => {
                    resolve(result.affectedRows)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 내 건물 업그레이드
    upgradeMyBuilding(conn, user_code, columnName) {
        return new Promise((resolve, reject) => {
            conn.query(`UPDATE tb_my_building SET ${columnName} = ${columnName} + 1 WHERE user_code=?`, [user_code])
                .then(result => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                })
        })
    }





    // 닭 납품하기
    setDeliveryCount(conn, user_code, company_code,count) {
        return new Promise((resolve, reject) => {
            conn.query(`UPDATE tb_contract SET delivery_chicken_count = delivery_chicken_count + ? WHERE user_code=? and company_code = ?`, [count,user_code,company_code])
                .then(result => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 미션 정보 (완료 여부 포함)
    getMission(conn, user_code) {
        return new Promise((resolve, reject) => {
//            conn.query('select a.mission_code,a.mission_content,a.reward_type,a.reward_count,a.mission_order,a.mission_type,a.mission_play_type,a.mission_count,b.idx,b.user_code,b.gendate, IF(gendate is null , 1 , IF(mission_type = 2,0, date_format(gendate, \'%Y-%m-%d\') < IF(mission_type = 0 , date_format(now(), \'%Y-%m-%d\') ,ADDDATE( CURDATE(), - WEEKDAY(CURDATE()) )))) as checks from  chicken.tb_mission as a  left outer join (select mission_code,idx,user_code,max(gendate) as gendate from tb_mission_user where user_code= ? group by mission_code) as b on a.mission_code = b.mission_code order by mission_order,checks DESC,a.mission_code;', [user_code])
            conn.query('SELECT * FROM (select a.mission_code,a.mission_content,a.reward_type,a.reward_count,a.mission_order,a.mission_type,a.mission_play_type,a.mission_count,b.idx,b.user_code,b.gendate, IF(gendate is null , 1 , IF(mission_type = 2,0, date_format(gendate, \'%Y-%m-%d\') < IF(mission_type = 0 , date_format(now(), \'%Y-%m-%d\') ,ADDDATE( CURDATE(), - WEEKDAY(CURDATE()) )))) as checks from  chicken.tb_mission as a  left outer join (select mission_code,idx,user_code,max(gendate) as gendate from tb_mission_user where user_code= ? group by mission_code) as b on a.mission_code = b.mission_code) as t where mission_type != 2\n' +
                'UNION\n' +
                'select * from (select a.mission_code,a.mission_content,a.reward_type,a.reward_count,a.mission_order,a.mission_type,a.mission_play_type,a.mission_count,b.idx,b.user_code,b.gendate, IF(gendate is null , 1 , IF(mission_type = 2,0, date_format(gendate, \'%Y-%m-%d\') < IF(mission_type = 0 , date_format(now(), \'%Y-%m-%d\') ,ADDDATE( CURDATE(), - WEEKDAY(CURDATE()) )))) as checks from  chicken.tb_mission as a  left outer join (select mission_code,idx,user_code,max(gendate) as gendate from tb_mission_user where user_code= ? group by mission_code) as b on a.mission_code = b.mission_code) as t where checks=1 group by mission_play_type having mission_type = 2 \n' +
                'UNION\n' +
                'select * from (select a.mission_code,a.mission_content,a.reward_type,a.reward_count,a.mission_order,a.mission_type,a.mission_play_type,a.mission_count,b.idx,b.user_code,b.gendate, IF(gendate is null , 1 , IF(mission_type = 2,0, date_format(gendate, \'%Y-%m-%d\') < IF(mission_type = 0 , date_format(now(), \'%Y-%m-%d\') ,ADDDATE( CURDATE(), - WEEKDAY(CURDATE()) )))) as checks from  chicken.tb_mission as a  left outer join (select mission_code,idx,user_code,max(gendate) as gendate from tb_mission_user where user_code= ? group by mission_code) as b on a.mission_code = b.mission_code) as t where checks=0 order by checks desc,mission_play_type;', [user_code,user_code,user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '미션 정보가 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 도감 가져오기
    getDictionary(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT idx,chicken_type,chicken_detail,chicken_name FROM tb_book', [])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '도감 정보가 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 미션 가능 여부
    checkMission(conn, user_code,mission_code) {
        return new Promise((resolve, reject) => {
            conn.query('select IF(gendate is null , 1 , IF(mission_type = 2,0, date_format(gendate, \'%Y-%m-%d\') < IF(mission_type = 0 , date_format(now(), \'%Y-%m-%d\') ,ADDDATE( CURDATE(), - WEEKDAY(CURDATE()) ))))  as checks from  chicken.tb_mission as a  left outer join (select mission_code,idx,user_code,max(gendate) as gendate from tb_mission_user where user_code=? group by mission_code) as b on a.mission_code = b.mission_code where a.mission_code = ?', [user_code,mission_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].checks);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_OTHERS, '미션을 정보가 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 미션 정보 가져오기
    getMissionInfo(conn, mission_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT mission_code,mission_content,reward_type,reward_count,mission_order,mission_type,mission_play_type,mission_count FROM tb_mission where mission_code = ?', [mission_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    }else{
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '미션을 정보를 찾을 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 미션 완료
    missionComplete(conn, user_code, mission_code) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_mission_user (user_code,mission_code,gendate) VALUES (?,?,now());', [user_code, mission_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 회원가입할때 먹이 1개 무료증정
    food_service(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_item_inventory (user_code,item_code,count) VALUES (?,5,1);', [user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 박스까기 로그
    golden_box_log(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_golden_box (user_code,gendate) VALUES (?,now());', [user_code])
                .then(result => {
                    resolve(result.affectedRows);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 박스까기 로그
    rulet_check(conn, user_code) {
            return new Promise((resolve, reject) => {
                conn.query('SELECT ticket FROM tb_point where user_code = ?', [user_code])
                    .then(rows => {
                        if(rows[0].ticket > 0) {
                            resolve(rows[0].ticket);
                        }else{
                            reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '티켓이 부족합니다.', 500))
                        }
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
        }



    // 닭 납품하기
    setEgg(conn, user_code, count) {
        return new Promise((resolve, reject) => {
            conn.query(`UPDATE tb_egg SET normalegg = ? WHERE user_code=?`, [count,user_code])
                .then(result => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 아이템 회복량 가져오기
    getItemsState(conn, item_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT hp,lovely from tb_game_store WHERE idx=?', [item_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, 'failed to find item info', 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 환전소 정보 가져오기
    getExchangeInfo(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT * from tb_exchange')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, 'failed to find item info', 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 환전소 정보 가져오기
    getExchangeGold(conn, point) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT gold from tb_exchange WHERE point=?', [point])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].gold);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, 'failed to find item info', 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 치킨 대화 가져오기
    gettalk(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT talk FROM chicken.tb_talk order by rand() limit 1;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].talk);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, 'failed to find talk info', 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 버전체크
    getversion(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT version FROM chicken.tb_version;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].version);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_DB, 'failed to find talk info', 500));
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    //////////////////////// 미션

    // 일일/주간 미션 횟수 카운팅
    user_misison_log_insert(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO `chicken`.`tb_mission_log` (`user_code`) VALUES (?);', [user_code])
                .then(result => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    // 일일/주간 미션 횟수 카운팅
    missionupdate(conn, user_code,count,type) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_mission_count_log (user_code, type,count,gendate) VALUES(?,?,?,now()) ', [user_code,type,count])
                .then(result => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 일일/주간 미션 횟수 카운팅
    missionupdate2(conn, user_code,count,type) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_mission_count_logs (user_code, type,count,gendate) VALUES(?,?,?,now()) ON DUPLICATE KEY UPDATE count = count + ? ; ', [user_code,type,count,count])
                .then(result => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 먹이주기 횟수 증가
    FoodCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET food_count = food_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 청소 횟수 증가
    CleanCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET clean_count = clean_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 달걀 판매 횟수 증가
    EggSellCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET egg_sell_count = egg_sell_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 황금박스 횟수 증가
    GoldenBoxCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET golden_box_count = golden_box_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }
    // 잡초줍기 횟수 증가
    PlantCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET plant_count = plant_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 벌래잡기 횟수 증가
    BugCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET bug_count = bug_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 놀아주기 횟수 증가
    PlayCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET play_count = play_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 치킨 카운트 증가
    ChickenCountIncrease(conn, user_code,rank,type) {
        return new Promise((resolve, reject) => {
            conn.query(`UPDATE tb_mission_log SET ${type}_type_${rank}_rank_chicken = ${type}_type_${rank}_rank_chicken + 1 WHERE user_code=?`, [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 아이탬 구매 횟수 증가
    BuyItemCountIncrease(conn, user_code, count) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET buy_item_count = buy_item_count + ? WHERE user_code=?', [count,user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 병아리 구매 횟수 증가
    BuyChickCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET buy_chick_count = buy_chick_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 황금알  횟수 증가
    GoldenEggCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET golden_egg_count = golden_egg_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 소나기 내린  횟수 증가
    CloudShowerCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET cloud_shower_count = cloud_shower_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 룰렛  횟수 증가
    RuletCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET rulet_count = rulet_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 닭 판매 / 납품 횟수 증가
    chicken_sell_Increase(conn, user_code,count) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET chicken_sell_count = chicken_sell_count + ? WHERE user_code=?', [count,user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    // 계약 완수 증가
    contract_complete_Increase(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET contract_complete_count = contract_complete_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 계약 시작 증가
    contract_start_Increase(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET contract_start_count = contract_start_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 황금박스 횟수 증가
    FriedChickenCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET game_fried_chicken = game_fried_chicken + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 황금박스 횟수 증가
    ColorChickenCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET game_color_chicken = game_color_chicken + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 황금박스 횟수 증가
    FlyChickenCountIncrease(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET game_fly_chicken = game_fly_chicken + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }
















    // 계약 시작 증가
    point_shop_Increase(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_mission_log SET point_shop_count = point_shop_count + 1 WHERE user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    getMyMissionInfo(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT * FROM tb_mission_log WHERE user_code=?', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '아이템 정보가 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    getMyDailyTypeInfo(conn, user_code,type) {
        return new Promise((resolve, reject) => {
            conn.query('select sum(count) as daily_count from tb_mission_count_log where  user_code = ? and type = ? and (gendate>CURDATE()) group by type;', [user_code,type])
                .then(rows => {
                    if (rows.length > 0) {
                        resolve(rows[0].daily_count);
                    } else if (rows.length == 0)
                    {
                        resolve(0);
                    }else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '미션 정보를 찾을수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }
    getMyDailyInfo(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('select type,sum(count) as daily_count from tb_mission_count_log where  user_code = ? and (gendate>CURDATE()) group by type;', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    }else if (rows.length == 0)
                    {
                        resolve(0);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '미션 정보를 찾을수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    getMyWeeklyTypeInfo(conn, user_code,type) {
        return new Promise((resolve, reject) => {
            conn.query('select sum(count) as weekly_count from tb_mission_count_log where  user_code = ? and type = ? and (gendate>ADDDATE( CURDATE(), - WEEKDAY(CURDATE())))  group by type;', [user_code,type])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].weekly_count);
                    }else if (rows.length == 0)
                    {
                        resolve(0);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '미션 정보를 찾을수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    getMyWeeklyInfo(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('select type,sum(count) as weekly_count from tb_mission_count_log where  user_code = ? and (gendate>ADDDATE( CURDATE(), - WEEKDAY(CURDATE())) )  group by type;', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    }else if (rows.length == 0)
                    {
                        resolve(0);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '미션 정보를 찾을수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    // 치킨 기록하기
    chickenlog(conn, user_code,chicken_list,reason) {
        return new Promise((resolve, reject) => {
            conn.query(`INSERT INTO tb_cihcken_log(user_code,chicken_name,chicken_code,rank,gendate,reason)select user_code,name,chicken_code,grade,now(),? from tb_my_chicken where user_code = ? and idx in (?)`,
                [reason,user_code,chicken_list])
                .then(result => {
                    if(result.affectedRows >= 0) {
                        resolve(result.insertId)
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '치킨 로그 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    getdiecihckens(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('select idx from tb_my_chicken where  user_code = ? and healthy = 3;', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    }else if (rows.length == 0)
                    {
                        resolve(0);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_EMPTY_DATA, '미션 정보를 찾을수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }





    /////////////////////////////////////////////////////////////////////////////////////



    getEvent(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT * FROM chicken.tb_event where start_date<=now() and end_date >= now();')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    getpointused(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('select sum(point) as point,type from tb_point_his where user_code = ? and point !=0 group by type order by type', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    getnotice(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT notice,rain_type,notice_check,event_check,event_end_date>now() as event_date,time(now()) as now_min,minute(event_start_time) as event_start_time,minute(event_end_time) as event_end_time,hour(event_start_hour) as event_start_hour,hour(event_end_hour) as event_end_hour,hour(now())>=hour(event_start_hour)&&hour(now())<hour(event_end_hour)&&minute(event_start_time) <= minute(now()) && minute(now())< minute(event_end_time) as event_time FROM chicken.tb_notice;')
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


    getclickpercent(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT * FROM chicken.tb_click_control;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].percent);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 충전소 등록 내역 추가
    addcpi(conn,appkey,pubkey,user_code,app_title,coin,transid,resign_flag) {
        return new Promise((resolve, reject) => {
            conn.query(`INSERT INTO tb_cpi_callback(user_code,reward_key,quantity,campaign_key,type,reg_date,comup_point,guild_point,user_ip,user_adid,ad_id,ad_key,ad_type) VALUES (?,?,?,?,?,now(),?,?,?,?,?,?,?)`,
                [user_code,appkey,coin,pubkey,0,(coin/30),0,'','','',transid,resign_flag])
                .then(result => {
                    if(result.affectedRows >= 0) {
                        resolve(result.insertId)
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '치킨 로그 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    checkcpi(conn,user_code,appkey,pubkey,transid){
        return new Promise((resolve, reject) => {
            conn.query('SELECT * FROM chicken.tb_cpi_callback where user_code = ? and reward_key = ? and campaign_key = ? and ad_key = ?;',[user_code,appkey,pubkey,transid])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    check_attend_date(conn,user_code){
        return new Promise((resolve, reject) => {
            conn.query('select * from tb_attend_check where gendate = date(now()) and user_code=?;',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    set_attend_date_check(conn,user_code){
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_attend_check (user_code, gendate) select ?, now() from dual where not exists(select user_code from tb_attend_check where user_code=? and date(now())=date(gendate))',[user_code,user_code])
                .then(rows => {
                    resolve(0);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    check_rink_ad_date(conn){
        return new Promise((resolve, reject) => {
            conn.query('select * from tb_ad_rink_check where gendate = date(now());')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    set_rink_ad_date(conn){
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_ad_rink_check (`style_patch`,`cashper`,`gendate`) VALUES (0,0,now());')
                .then(rows => {
                    resolve(0);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 요청 증가
    request_rink_ad_style_patch_increase(conn) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_ad_rink_check SET style_patch = style_patch + 1 WHERE gendate = date(now());')
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve(0);
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 요청 증가
    request_rink_ad_cashper_increase(conn) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_ad_rink_check SET cashper = cashper + 1 WHERE gendate = date(now());')
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve(0);
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    check_ad_date(conn){
        return new Promise((resolve, reject) => {
            conn.query('select * from tb_ad_count where gendate = date(now());')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }
    set_ad_date(conn){
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_ad_count (`request`,`show`,`gendate`) VALUES (0,0,now());')
                .then(rows => {
                    resolve(0);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    // 요청 증가
    request_ad_increase(conn) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_ad_count SET request = request + 1 WHERE gendate = date(now());')
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve(0);
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 본수 증가
    show_ad_increase(conn) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_ad_count SET `show` = `show` + 1 WHERE gendate = date(now());')
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 디바이스 정보 입력
    setmyinfo(conn,user_code,pixcel,device) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_user SET pixcel = ? , model_name = ? where idx = ?',[pixcel,device,user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    ////////////////////////



    // 가능한지 체크
    check_sleep(conn,user_code){
        return new Promise((resolve, reject) => {
            conn.query('select user_code,timestampdiff(minute,gendate,now()) as delay_time,mode,(date(now())!=date(gendate)) as check_date,(DATE_ADD(gendate,INTERVAL 8 HOUR)<now()) as check_hour  from tb_sleep where user_code = ?;',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        resolve(-1);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 수면모드
    set_sleep_mode(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('insert into  tb_sleep (user_code, gendate,mode) value (?, now(),1) on duplicate key update gendate = now() ,mode=1;',[user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 수면
    set_sleep_setting(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('update tb_update_his set last_update_date = DATE_ADD(now(),INTERVAL 8 HOUR) where user_code=?',[user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 기상
    set_wake_up(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('update tb_sleep set mode = 0 where user_code=?',[user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 기상 세팅
    set_wake_sleep_setting(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('update tb_update_his set last_update_date = now() where user_code=?',[user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }





    // 받을수 있는 금액
    check_sleep_time(conn,user_code){
        return new Promise((resolve, reject) => {
            conn.query('SELECT 500*if(floor(timestampdiff(MINUTE,gendate,now())/10)>36,36,floor(timestampdiff(MINUTE,gendate,now())/10)) as count FROM chicken.tb_sleep where user_code = ?;',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].count);
                    } else {
                        resolve(-1);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

//////




    // 리뷰 남기기
    repl_check(conn,user_code){
        return new Promise((resolve, reject) => {
            conn.query('select idx,gendate,DATE_ADD(date(gendate),INTERVAL 3 day)<=date(now()) as datecheck,replcheck from tb_user where idx = ?',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        resolve(-1);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 기상 세팅
    repl_set(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('update tb_user set replcheck = 1 where idx=?',[user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    //////////////

    getadorder(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT name,ad_number,egg_check FROM chicken.tb_ad_order order by ad_number;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    //////////
    // 마을
    // 하트 시간 가져오기
    getlasthearttime(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT TIMESTAMPDIFF(second, last_heart_time, now()) AS remain FROM tb_point WHERE user_code=?', [user_code])
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


    // 시간세팅
    setlasthearttime(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('update tb_point set last_heart_time = now() where user_code=?',[user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 카운팅만큼 시간증가
    setlasthearttimehour(conn,user_code,hour) {
        return new Promise((resolve, reject) => {
            conn.query('update tb_point set last_heart_time = DATE_ADD(last_heart_time,INTERVAL ? MINUTE) where user_code=?',[hour,user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 내 스탑워치 랭킹 점수 가져오기
   getmystoprank(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT * FROM tb_rank_stopgame where date(gendate) = date(now()) and user_code=?;', [user_code])
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


    // 랭킹점수등록
    setmyrankfail(conn,user_code,point) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_rank_stopgame(`user_code`,`second`,`rankdate`,`gendate`)VALUES(?,0,date(now()),now())  ON DUPLICATE KEY UPDATE gendate=if(second>=?,gendate,now()),count = if(second!=700,count+1,count),second = if(second>=?,second,?)', [user_code,point,point,point,point,point])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 랭킹 카운트 증가
    setmyrank(conn,user_code,point) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_rank_stopgame(`user_code`,`second`,`rankdate`,`gendate`)VALUES(?,?,date(now()),now())  ON DUPLICATE KEY UPDATE gendate=if(second>=?,gendate,now()),count = if(second!=700,count+1,count),second = if(second>=?,second,?)', [user_code,point,point,point,point,point])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 스탑워치 랭킹 점수 가져오기
    getstoprank(conn,date) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT @i:=@i+1 AS iterator,a.user_code,a.second,a.count,a.rankdate,a.gendate,b.nick FROM chicken.tb_rank_stopgame as a left outer join tb_user b on a.user_code = b.idx,(SELECT @i:=0) AS foo where a.rankdate = date(?) order by a.second desc,a.count ,a.gendate limit 200;',[date])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 스탑워치 랭킹 날짜 가져오기
    getstoprankdate(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT DATE_FORMAT(rankdate,\'%Y / %m / %d\') as rankdate FROM chicken.tb_rank_stopgame group by rankdate desc;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }





    // 분류 랭킹 점수 가져오기
    getcolorrank(conn,date) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT @i:=@i+1 AS iterator,a.user_code,a.score,a.count,a.rankdate,a.gendate,b.nick FROM chicken.tb_rank_colorset as a left outer join tb_user b on a.user_code = b.idx,(SELECT @i:=0) AS foo where a.rankdate = date(?) order by a.score desc,a.count ,a.gendate limit 200;',[date])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 분류 랭킹 날자 가져오기
    getcolorrankdate(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT DATE_FORMAT(rankdate,\'%Y / %m / %d\') as rankdate FROM chicken.tb_rank_colorset group by rankdate desc;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 분류 랭킹 카운트 증가
    setcolormyrank(conn,user_code,point) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_rank_colorset(`user_code`,`score`,`rankdate`,`gendate`)VALUES(?,?,date(now()),now())  ON DUPLICATE KEY UPDATE gendate=if(score>=?,gendate,now()),count = count+1,score = if(score>=?,score,?)', [user_code,point,point,point,point,point,point])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 분류 랭킹 로그남기기
    setcolormyranklog(conn,user_code,point) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_rank_colorset_log(`user_code`,`score`,`rankdate`,`gendate`)VALUES(?,?,date(now()),now()) ;', [user_code,point])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }














    // 플라이치킨 랭킹 카운트 증가
    setflymyrank(conn,user_code,point,meter) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO tb_rank_chickenfly(`user_code`,`score`,`rankdate`,`gendate`,`meter`)VALUES(?,?,date(now()),now(),?)  ON DUPLICATE KEY UPDATE gendate=if(score>=?,gendate,now()),meter = if(score>=?,if(score!=?,meter,if(meter>=?,meter,?)),?),score = if(score>=?,score,?)', [user_code,point,meter,point,point,point,meter,meter,meter,point,point])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 플라이치킨 랭킹 점수 가져오기
    getflyrank(conn,date) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT @i:=@i+1 AS iterator,a.user_code,a.score,a.meter,a.rankdate,a.gendate,b.nick FROM chicken.tb_rank_chickenfly as a left outer join tb_user b on a.user_code = b.idx,(SELECT @i:=0) AS foo where a.rankdate = date(?) order by a.score desc,a.meter desc ,a.gendate limit 200;',[date])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 플라이치킨 랭킹 날자 가져오기
    getflyrankdate(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT DATE_FORMAT(rankdate,\'%Y / %m / %d\') as rankdate FROM chicken.tb_rank_chickenfly group by rankdate desc;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    //////////


    //  새우편 확인 하기
    getcheckmessages(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('select idx,message_type,message,point_type,point,receive_check,gendate,7-timestampdiff(day,gendate,now()) as days from tb_message where receive_check = 0 and user_code=? and 7-timestampdiff(day,gendate,now()) >0 order by gendate;',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    //  우편함 가져오기
    getmessages(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('select idx,message_type,message,point_type,point,receive_check,gendate,7-timestampdiff(day,gendate,now()) as days from tb_message where receive_check != 2 and user_code=? and 7-timestampdiff(day,gendate,now()) >0 order by gendate;',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 우편정보 가져오기
    getidxmessage(conn,idx) {
        return new Promise((resolve, reject) => {
            conn.query('select idx,message_type,message,point_type,point,receive_check,gendate from tb_message where idx=? ;',[idx])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '우편정보를 찾을 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }
    // 수정하기
    getmessageitem(conn,messageid) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_message SET receive_check = 1 WHERE idx = ? and  receive_check=0;;', [messageid])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        //resolve();
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '우편정보를 수정을 실패했습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 삭제하기
    deletemessage(conn,messageid,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_message SET receive_check = 2 where idx = ?;', [messageid,user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        //resolve();
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '우편 삭제를 실패했습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

// 수정하기
    deleteallmessage(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE tb_message SET receive_check = 2 where receive_check = 1 and user_code= ?;', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '우편 삭제를 실패했습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    /// 무료 가능한지 확인

    getcheckfreeheart(conn, user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT date(now())=date(last_heart_time) as checks FROM chicken.tb_point where user_code=?;', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].checks);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '하트정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    /// 이벤트 타입 가져오기

    geteventtype(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT rain_type FROM chicken.tb_notice ;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].rain_type);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '이벤트 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //랭킹  포인트


    ///////////////포인트
    ///  일간 내 포인트 점수
    getmydayrank_point(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(point) is null,0,sum(point)) as points FROM chicken.tb_point_his where user_code = ? and type!=14 and point>0 and date(gendate)=date(now());',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 일간 포인트 랭킹
    getdayrank_point(conn){
        return new Promise((resolve, reject) => {
            conn.query('select  @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(point) as point FROM chicken.tb_point_his where point>0 and type!=14 and date(gendate)=date(now()) group by user_code order by point desc) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  주간 내 포인트 점수
    getmyweekrank_point(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(point) is null,0,sum(point)) as points FROM chicken.tb_point_his where user_code = ? and point>0 and type!=14  and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE())))',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 주간 포인트 랭킹
    getweekrank_point(conn){
        return new Promise((resolve, reject) => {
            conn.query('select  @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(point) as point FROM chicken.tb_point_his where point>0 and type!=14 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE()))) group by user_code order by point desc) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  누적 내 포인트 점수
    getmyallrank_point(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT acc_point FROM chicken.tb_point where user_code = ?',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].acc_point);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 누적 포인트 랭킹
    getallrank_point(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.acc_point as point from (select user_code,acc_point from tb_point) as a left outer join tb_user as b on a.user_code=b.idx ,(SELECT @i:=0) AS foo   order by acc_point desc  limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ////////////////////////골드


    ///  일간 내 골드 점수
    getmydayrank_gold(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(gold) is null,0,sum(gold)) as points FROM chicken.tb_point_his where user_code = ? and gold>0 and date(gendate)=date(now());',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 일간 골드 랭킹
    getdayrank_gold(conn){
        return new Promise((resolve, reject) => {
            conn.query('select  @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(gold) as point FROM chicken.tb_point_his where gold>0 and date(gendate)=date(now()) group by user_code order by point desc) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  주간 내 골드 점수
    getmyweekrank_gold(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(gold) is null,0,sum(gold)) as points FROM chicken.tb_point_his where user_code = ? and gold>0 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE())))',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 주간 골드 랭킹
    getweekrank_gold(conn){
        return new Promise((resolve, reject) => {
            conn.query('select  @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(gold) as point FROM chicken.tb_point_his where gold>0 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE()))) group by user_code order by point desc) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  누족 내 골드 점수
    getmyallrank_gold(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT acc_gold FROM chicken.tb_point where user_code = ?',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].acc_gold);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 누적 골드 랭킹
    getallrank_gold(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.acc_gold as point from (select user_code,acc_gold from tb_point) as a left outer join tb_user as b on a.user_code=b.idx ,(SELECT @i:=0) AS foo   order by acc_gold desc  limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    ////////////////////////치킨 진화랭킹


    ///  누적 내 진화 점수
    getmyallrank_upgrade_chicken(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT a_type_a_rank_chicken+a_type_b_rank_chicken+a_type_c_rank_chicken+a_type_d_rank_chicken+a_type_f_rank_chicken+b_type_a_rank_chicken+b_type_b_rank_chicken+b_type_c_rank_chicken+b_type_d_rank_chicken+b_type_f_rank_chicken+c_type_a_rank_chicken+c_type_b_rank_chicken+c_type_c_rank_chicken+c_type_d_rank_chicken+c_type_f_rank_chicken+d_type_a_rank_chicken+d_type_b_rank_chicken+d_type_c_rank_chicken+d_type_d_rank_chicken+d_type_f_rank_chicken+e_type_a_rank_chicken+e_type_b_rank_chicken+e_type_c_rank_chicken+e_type_d_rank_chicken+e_type_f_rank_chicken as point FROM chicken.tb_mission_log where user_code = ?',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].point);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 누적 진화 랭킹
    getallrank_upgrade_chicken(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,a_type_a_rank_chicken+a_type_b_rank_chicken+a_type_c_rank_chicken+a_type_d_rank_chicken+a_type_f_rank_chicken+b_type_a_rank_chicken+b_type_b_rank_chicken+b_type_c_rank_chicken+b_type_d_rank_chicken+b_type_f_rank_chicken+c_type_a_rank_chicken+c_type_b_rank_chicken+c_type_c_rank_chicken+c_type_d_rank_chicken+c_type_f_rank_chicken+d_type_a_rank_chicken+d_type_b_rank_chicken+d_type_c_rank_chicken+d_type_d_rank_chicken+d_type_f_rank_chicken+e_type_a_rank_chicken+e_type_b_rank_chicken+e_type_c_rank_chicken+e_type_d_rank_chicken+e_type_f_rank_chicken as point FROM chicken.tb_mission_log order by point desc )  as a left outer join tb_user as b on a.user_code=b.idx ,(SELECT @i:=0) AS foo   order by point desc  limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    //////////////////////////////////////////////////////////////
    // A랭크 만든횟수


    ///  일간 내 a_rank 점수
    getmydayrank_a_rnak(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=1 and type=13 and date(gendate)=date(now());',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 일간 a_rank 랭킹
    getdayrank_a_rnak(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=13 and date(gendate)=date(now()) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  주간 내 a_rank 점수
    getmyweekrank_a_rnak(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=? and type=13 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE())))',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 주간 a_rank 랭킹
    getweekrank_a_rnak(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=13 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE()))) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  누족 내 a_rank 점수
    getmyallrank_a_rnak(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('select user_code,a_type_a_rank_chicken+b_type_a_rank_chicken+c_type_a_rank_chicken+d_type_a_rank_chicken+e_type_a_rank_chicken as points from tb_mission_log where user_code=?',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 누적 a_rank 랭킹
    getallrank_a_rnak(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (select user_code,a_type_a_rank_chicken+b_type_a_rank_chicken+c_type_a_rank_chicken+d_type_a_rank_chicken+e_type_a_rank_chicken as point from tb_mission_log  order by point desc )  as a left outer join tb_user as b on a.user_code=b.idx ,(SELECT @i:=0) AS foo   order by point desc  limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    ////////////////////////////////////////////////
    // 치킨 판매



    ///  누적 내 치킨판매 점수
    getmyallrank_sell_chicken(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT chicken_sell_count as point FROM chicken.tb_mission_log where user_code = ?',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].point);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 누적 진화 랭킹
    getallrank_sell_chicken(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,chicken_sell_count as point FROM chicken.tb_mission_log order by chicken_sell_count desc)  as a left outer join tb_user as b on a.user_code=b.idx ,(SELECT @i:=0) AS foo   order by point desc  limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    //////////////////////////////////////////////////////////////
    // 황금알 깐횟수


    ///  일간 내 황금알 점수
    getmydayrank_goldegg(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=? and type=8 and date(gendate)=date(now())',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 일간 황금알 랭킹
    getdayrank_goldegg(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=8 and date(gendate)=date(now()) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  주간 내 황금알 점수
    getmyweekrank_goldegg(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=? and type=8 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE())))',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 주간 황금알 랭킹
    getweekrank_goldegg(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=8 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE()))) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  누족 내 황금알 점수
    getmyallrank_goldegg(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('select user_code,golden_egg_count as points from tb_mission_log where user_code=?',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 누적 황금알 랭킹
    getallrank_goldegg(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (select user_code,golden_egg_count as point from tb_mission_log  order by point desc )  as a left outer join tb_user as b on a.user_code=b.idx ,(SELECT @i:=0) AS foo   order by point desc  limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    //////////////////////////////////////////////////////////////
    // 알 판매 횟수


    ///  일간 내 알 판매 점수
    getmydayrank_eggsell(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=? and type=2 and date(gendate)=date(now())',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 일간 알 판매 랭킹
    getdayrank_eggsell(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=2 and date(gendate)=date(now()) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  주간 내 알 판매 점수
    getmyweekrank_eggsell(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=? and type=2 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE())))',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 주간 알 판매 랭킹
    getweekrank_eggsell(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=2 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE()))) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  누족 내 알 판매 점수
    getmyallrank_eggsell(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('select user_code,egg_sell_count as points from tb_mission_log where user_code=?',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 누적 알 판매 랭킹
    getallrank_eggsell(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (select user_code,egg_sell_count as point from tb_mission_log  order by point desc )  as a left outer join tb_user as b on a.user_code=b.idx ,(SELECT @i:=0) AS foo   order by point desc  limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    //////////////////////////////////////////////////////////////
    // 벌래 횟수


    ///  일간 내 벌래 점수
    getmydayrank_bug(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=? and type=4 and date(gendate)=date(now())',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 일간 벌래 랭킹
    getdayrank_bug(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=4 and date(gendate)=date(now()) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  주간 내 벌래 점수
    getmyweekrank_bug(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=? and type=4 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE())))',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 주간 벌래 랭킹
    getweekrank_bug(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=4 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE()))) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  누족 내 벌래 점수
    getmyallrank_bug(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('select user_code,bug_count as points from tb_mission_log where user_code=?',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 누적 벌래 랭킹
    getallrank_bug(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (select user_code,bug_count as point from tb_mission_log  order by point desc )  as a left outer join tb_user as b on a.user_code=b.idx ,(SELECT @i:=0) AS foo   order by point desc  limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    //////////////////////////////////////////////////////////////
    // 잡초 횟수


    ///  일간 내 잡초 점수
    getmydayrank_plant(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=? and type=3 and date(gendate)=date(now())',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 일간 잡초 랭킹
    getdayrank_plant(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=3 and date(gendate)=date(now()) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  주간 내 잡초 점수
    getmyweekrank_plant(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=? and type=3 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE())))',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 주간 잡초 랭킹
    getweekrank_plant(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=3 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE()))) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  누족 내 잡초 점수
    getmyallrank_plant(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('select user_code,plant_count as points from tb_mission_log where user_code=?',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 누적 잡초 랭킹
    getallrank_plant(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (select user_code,plant_count as point from tb_mission_log  order by point desc )  as a left outer join tb_user as b on a.user_code=b.idx ,(SELECT @i:=0) AS foo   order by point desc  limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    //////////////////////////////////////////////////////////////
    // 청소 횟수


    ///  일간 내 청소 점수
    getmydayrank_clean(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=? and type=5 and date(gendate)=date(now())',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 일간 청소 랭킹
    getdayrank_clean(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=5 and date(gendate)=date(now()) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  주간 내 청소 점수
    getmyweekrank_clean(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=? and type=5 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE())))',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 주간 청소 랭킹
    getweekrank_clean(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=5 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE()))) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  누족 내 청소 점수
    getmyallrank_clean(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('select user_code,clean_count as points from tb_mission_log where user_code=?',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 누적 청소 랭킹
    getallrank_clean(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (select user_code,clean_count as point from tb_mission_log  order by point desc )  as a left outer join tb_user as b on a.user_code=b.idx ,(SELECT @i:=0) AS foo   order by point desc  limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    //////////////////////////////////////////////////////////////
    // 놀아주기 횟수


    ///  일간 내 놀아주기 점수
    getmydayrank_play(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=? and type=6 and date(gendate)=date(now())',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 일간 놀아주기 랭킹
    getdayrank_play(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=6 and date(gendate)=date(now()) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  주간 내 놀아주기 점수
    getmyweekrank_play(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('SELECT if(sum(count) is null,0,sum(count)) as points FROM chicken.tb_mission_count_log where user_code=? and type=6 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE())))',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 주간 놀아주기 랭킹
    getweekrank_play(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (SELECT user_code,sum(count) as point FROM chicken.tb_mission_count_log where type=6 and date(gendate)>=date(ADDDATE(CURDATE(), - WEEKDAY(CURDATE()))) group by user_code order by point desc,gendate) as a left outer join tb_user as b on a.user_code = b.idx,(SELECT @i:=0) AS foo limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ///  누족 내 놀아주기 점수
    getmyallrank_play(conn,user_code)
    {
        return new Promise((resolve, reject) => {
            conn.query('select user_code,play_count as points from tb_mission_log where user_code=?',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].points);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '내 랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 누적 놀아주기 랭킹
    getallrank_play(conn){
        return new Promise((resolve, reject) => {
            conn.query('select @i:=@i+1 AS iterator,b.nick,a.user_code,a.point from (select user_code,play_count as point from tb_mission_log  order by point desc )  as a left outer join tb_user as b on a.user_code=b.idx ,(SELECT @i:=0) AS foo   order by point desc  limit 200;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_NOT_FOUND_MESSAGE, '랭킹 정보를 가져올 수 없습니다.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    //////////////////////////////////

    // 치킨 투표




    // 치킨 투표 내정보 가져오기
    getvotemyselect(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT chicken_num,vote_count as now FROM chicken.tb_rank_chicken_select where user_code=? and date(now())=date(rank_date);', [user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].chicken_num);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    getvoteinfo(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT count(*) as vote_count  FROM chicken.tb_rank_chicken_select where date(now())=date(rank_date);')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].vote_count);
                    } else {
                        reject(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 치킨 투표 랭킹 3등까지 가져오기
    getvoterank(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT chicken_num,count(chicken_num) as vote,sum(vote_count) as count,max(gendate) as time,time(now()) as now FROM chicken.tb_rank_chicken_select where date(now())=date(rank_date) group by chicken_num order by vote desc,count desc,gendate desc limit 3;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }






    // 치킨 투표 랭킹 날짜들 가져오기
    getvoterankdates(conn) {
        return new Promise((resolve, reject) => {
            conn.query('select DATE_FORMAT(rank_date,\'%Y / %m / %d\') as rank_date FROM chicken.tb_rank_chicken_select where rank_date < date(now()) group by rank_date order by rank_date desc')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 치킨 투표 투표하기
    setvotemyselect(conn,user_code,number) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO `chicken`.`tb_rank_chicken_select` (`user_code`,`chicken_num`,`rank_date`,`vote_count`)VALUES(?,?,now(),1) ON DUPLICATE KEY UPDATE chicken_num =?,vote_count=vote_count+1,gendate=now() ;', [user_code,number,number])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 해당날짜 내 투표 현황
    getvotemyrankinfo(conn,user_code,dates) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT chicken_num FROM chicken.tb_rank_chicken_select where date(?)=date(rank_date) and user_code=?',[dates,user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].chicken_num);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 해당날짜 투표 현황
    getvoterankinfo(conn,dates) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT chicken_num,count(chicken_num) as vote,sum(vote_count) as count ,max(gendate) FROM chicken.tb_rank_chicken_select where date(?)=date(rank_date) group by chicken_num order by vote ,count ,gendate',[dates])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 해당날짜 당첨자 가져오기
    getvoteranklist(conn,dates) {
        return new Promise((resolve, reject) => {
            conn.query('select b.nick from (select a.user_code from tb_rank_chicken_select as a left outer join (SELECT chicken_num,rank_date,count(chicken_num) as vote,sum(vote_count),max(gendate) as count FROM chicken.tb_rank_chicken_select where date(?)=date(rank_date) group by chicken_num order by vote ,count ,gendate limit 1) as b on a.chicken_num = b.chicken_num and a.rank_date=b.rank_date where b.chicken_num is not null) as a left outer join tb_user as b on a.user_code=b.idx',[dates])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 게임 코드 발급
    getfwgamecode(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('select CONCAT(idx,DATE_FORMAT(now(),\'%Y%m%d%H%i%s\')) as gamecode from tb_user where idx=?;',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].gamecode);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '게임코드 생성 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 게임 승패 로그 저장
    setfwlog(conn,user_code,gamecode,select,winlose,score) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO `chicken`.`tb_rank_fw_log`(`user_code`,`rankdate`,`gamecode`,`select`,`win_lose`,`score`,`gendate`)VALUES(?,date(now()),?,?,?,?,now());', [user_code,gamecode,select,winlose,score])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 게임 승패 로그 저장
    setfwrank(conn,user_code,gamecode,score) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO `chicken`.`tb_rank_fw`(`user_code`,`score`,`rankdate`,`count`,`gendate`,`gamecode`)VALUES(?,?,date(now()),1,now(),?) ON DUPLICATE KEY UPDATE count = count + 1 , gendate = if(score<?,now(),gendate),gamecode = if(score<?,?,gamecode),score = if(score<?,?,score);', [user_code,score,gamecode,score,score,gamecode,score,score])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve();
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '정보 추가 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    // fw 랭킹 점수 가져오기
    getfwrank(conn,date) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT @i:=@i+1 AS iterator,a.user_code,a.score,a.count,a.rankdate,a.gendate,b.nick FROM chicken.tb_rank_fw as a left outer join tb_user b on a.user_code = b.idx,(SELECT @i:=0) AS foo where a.rankdate = date(?) order by a.score desc,a.count,a.gendate limit 200;',[date])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // fw 랭킹 날자 가져오기
    getfwrankdate(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT DATE_FORMAT(rankdate,\'%Y / %m / %d\') as rankdate FROM chicken.tb_rank_fw group by rankdate desc;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 카카오 비밀번호
    getkakaopass(conn) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT password FROM chicken.tb_kakao_password;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].password);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 길드관련

    // 길드 체크
    getguildcheck(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT guild_num,guild_level,user_guild_point,guild_message FROM chicken.tb_guild_user where user_code=?;',[user_code])
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

    getguildrequestlist(conn,guild_num) {
        return new Promise((resolve, reject) => {
            conn.query('select a.user_code,b.nick,a.guild_num,a.gendate from (SELECT user_code,guild_num,gendate FROM chicken.tb_guild_sign_message where guild_num=?) as a left outer join tb_user as b on a.user_code = b.idx;',[guild_num])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    // 길드 이름 중복 체크
    getguildnamecheck(conn,guild_name) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT * FROM chicken.tb_guild where guild_name=?;',[guild_name])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(-1);
                    } else {
                        resolve(1);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }






    // 길드 만들기
    guildcreate(conn,guild_name,guild_info,guild_sign_check,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO `chicken`.`tb_guild`(`guild_name`,`guild_icon`,`guild_info`,`guild_notice`,`gendate`,`guild_point`,`guild_sign_type`,`guild_master`)VALUES (?,0,?,\'\',now(),0,?,?);', [guild_name,guild_info,guild_sign_check,user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 생성 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 길드 num 가져오기
    getguildnum(conn,guild_name) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT guild_num FROM chicken.tb_guild where guild_name=?;',[guild_name])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].guild_num);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 생성 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    // 길드 관련 로그 쓰기
    guild_log(conn,user_code,guild_num,message,type) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO `chicken`.`tb_guild_log`(`user_code`,`guild_num`,`message`,`type`,`gendate`)VALUES(?,?,?,?,now());', [user_code,guild_num,message,type])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        resolve()
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 생성 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    // 길드 가입하기
    guild_sign_up(conn,user_code,guild_num,guild_level) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO `chicken`.`tb_guild_user`(`user_code`,`guild_num`,`guild_level`,`user_guild_point`,`guild_message`,`gendate`,`access_time`)VALUES(?,?,?,0,\'\',now(),now());', [user_code,guild_num,guild_level])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 생성 실패(유저등록실패). 관리자에게 문의해주세요.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    // 길드 리스트 가져오기
    getguildlist(conn) {
        return new Promise((resolve, reject) => {
            conn.query('select a.*,b.nick from (SELECT a.guild_num,a.guild_name,a.guild_icon,a.guild_sign_type,a.guild_info,a.guild_master,count(*) as count FROM chicken.tb_guild as a left outer join tb_guild_user as b on a.guild_num = b.guild_num group by a.guild_num) as a left outer join tb_user as b on a.guild_master = b.idx where count<9 order by RAND() limit 10;')
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 리스트 가져오기 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    // 검색 길드 리스트 가져오기
    getsearchlist(conn,search_text) {
        return new Promise((resolve, reject) => {
            conn.query('select a.*,b.nick from (SELECT a.guild_num,a.guild_name,a.guild_icon,a.guild_sign_type,a.guild_info,a.guild_master,count(*) as count FROM chicken.tb_guild as a left outer join tb_guild_user as b on a.guild_num = b.guild_num group by a.guild_num) as a left outer join tb_user as b on a.guild_master = b.idx where guild_name like ?;',["%"+search_text+"%"])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 리스트 가져오기 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 길드 정보 가져오기
    getguildinfo(conn,guild_num) {
        return new Promise((resolve, reject) => {
            conn.query('select a.guild_name,b.nick as guild_master,a.guild_icon,a.guild_sign_type,a.guild_info,a.guild_notice,a.gendate,a.guild_point from (SELECT guild_name,guild_icon,guild_master,guild_sign_type,guild_info,guild_notice,gendate,guild_point FROM chicken.tb_guild where guild_num = ?) as a left outer join tb_user as b on a.guild_master = b.idx;',[guild_num])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 정보 가져오기 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 길드원 리스트
    getguilduser_list(conn,guild_num) {
        return new Promise((resolve, reject) => {
            conn.query('select a.user_code,b.nick,a.guild_level,a.user_guild_point,a.gendate,a.access_time,now() as nowtime from (SELECT * FROM chicken.tb_guild_user where guild_num = ? ) as a left outer join tb_user as b on a.user_code = b.idx order by user_guild_point desc,gendate;;',[guild_num])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 정보 가져오기 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    //길드원 카운트 가져오기
    getguilduser_count(conn,guild_num) {
        return new Promise((resolve, reject) => {
            conn.query('select count(*) as count from tb_guild_user where guild_num = ?',[guild_num])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0].count);
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 정보 가져오기 실패(마을 인원).', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    //요청 중인지 확인
    getsignrequest_check(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT user_code,guild_num,gendate FROM chicken.tb_guild_sign_message where user_code = ?',[user_code])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        resolve(0);
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 정보 가져오기 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 요청중인 길드 정보
    getrequest_guildinfo(conn,guild_num) {
        return new Promise((resolve, reject) => {
            conn.query('select a.*,b.nick from (SELECT a.guild_num,a.guild_name,a.guild_icon,a.guild_sign_type,a.guild_info,a.guild_master,count(*) as count FROM chicken.tb_guild as a left outer join tb_guild_user as b on a.guild_num = b.guild_num group by a.guild_num) as a left outer join tb_user as b on a.guild_master = b.idx where guild_num=?;',[guild_num])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 리스트 가져오기 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }





    // 길드 요청 취소
    guild_sign_request_cancel(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('delete  FROM chicken.tb_guild_sign_message where user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을요청 취소 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 길드 가입요청 넣기
    guild_sign_request(conn,user_code,guild_num,sign_message) {
        return new Promise((resolve, reject) => {
            conn.query('INSERT INTO `chicken`.`tb_guild_sign_message`(`user_code`,`guild_num`,`message`,`gendate`)VALUES(?,?,?,now()) ON DUPLICATE KEY UPDATE message = ?,gendate = now();', [user_code,guild_num,sign_message,sign_message])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 생성 실패(유저등록실패). 관리자에게 문의해주세요.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    // 길드 정보 수정
    setmodifyguildinfo(conn,guild_num,guild_info,guild_notice,guild_sign_type) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE `chicken`.`tb_guild` SET guild_sign_type = ? , guild_info = ?, guild_notice = ? WHERE guild_num = ?', [guild_sign_type,guild_info,guild_notice,guild_num])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 생성 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 내정보 수정
    setguildmyinfo(conn,user_code,message) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE `chicken`.`tb_guild_user` SET guild_message = ? WHERE user_code = ?', [message,user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 생성 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 부이장 있는지 확인
    getsubmaster_check(conn,guild_num) {
        return new Promise((resolve, reject) => {
            conn.query('select * from tb_guild_user where guild_level = 2 and guild_num = ?;',[guild_num])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(-1);
                    } else {
                        resolve(0);
                        //reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 정보 가져오기 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 부이장 위임
    setsubmaster(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE `chicken`.`tb_guild_user` SET guild_level = 2 WHERE user_code = ?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 생성 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 부이장 해임
    setmaster_del(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE `chicken`.`tb_guild_user` SET guild_level = 1 WHERE user_code = ?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 생성 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 이장 위임
    setmaster(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE `chicken`.`tb_guild_user` SET guild_level = 3 WHERE user_code = ?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 생성 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

// 이장 위임
    setmaster_guild(conn,user_code,guild_num) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE `chicken`.`tb_guild` SET guild_master = ? WHERE guild_num = ?', [user_code,guild_num])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 생성 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 길드삭제
    delete_guild(conn,user_code,guild_num) {
        return new Promise((resolve, reject) => {
            conn.query('delete  FROM chicken.tb_guild where guild_master=? and guild_num = ?', [user_code,guild_num])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 해체 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 마을 탈퇴
    guild_escape(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('delete  FROM chicken.tb_guild_user where user_code=?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 해체 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    // 접속시간 갱신
    setaccesstime(conn,user_code) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE `chicken`.`tb_guild_user` SET access_time = now() WHERE user_code = ?', [user_code])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을 생성 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }




    // 길드 요청 전체 삭제
    guild_sign_all_cancel(conn,guild_num) {
        return new Promise((resolve, reject) => {
            conn.query('delete  FROM chicken.tb_guild_sign_message where guild_num=?', [guild_num])
                .then(result => {
                    if(result.affectedRows > 0) {
                        resolve()
                    } else {
                        reject(new CMError(statusCodes.CODE_ERR_CONTRACT_FAILED, '마을요청 취소 실패.', 500))
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


    // 길드 광장 정보 가져오기
    getguildsquar(conn,guild_num) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT b.nick,user_code,guild_level,guild_message FROM chicken.tb_guild_user as a left outer join tb_user as b on a.user_code = b.idx where guild_num = ? order by guild_level desc;;',[guild_num])
                .then(rows => {
                    if(rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(0);
                    }
                })
                .catch(err => {
                    reject(err);
                })
        })
    }


}

export default GameUtil