import express from "express"
import statusCodes from '../conf/statusCodes'
import settings from "../conf/settings"
import buildingSettings from "../conf/buildingSettings"
import chickenSettings from "../conf/chickenSetting"
import devSetting from "../conf/devSetting"
import shortid from "shortid"
import CMError from "../CMError";
import {SQLHelper, utils} from "../utils/index"
import {errHandler, userUtil, sessionUtil, gameUtil, devUtil, chickenUtil} from "./utils";
import _ from 'underscore';
import moment from 'moment';
import rand from "random";
import GameUtil from "./utils/GameUtil";


const pool = SQLHelper.createPool();
const router = express.Router();

/*
* 내 건물 정보 불러오기
* */
router.get('/my/buildings/:session_key', (req, res, next) => {

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                // 건물 정보
                let building = await userUtil.getMyBuildingInfo(conn, user_code);

                returnValues["value"] = {
                    ...building
                };
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});

/*
* 게임 아이템 상점 목록 불러오기
* */
router.get('/item/store', (req, res, next) => {
    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {

            try {

                connection = conn;

                let items = await gameUtil.getGameStoreItemList(conn);

                returnValues['value'] = {
                    list: items
                };

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*
* 업체 목록 불러오기
* */
router.get('/company/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {

            try {

                connection = conn;

                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let myBuilding = await userUtil.getMyBuildingInfo(conn, user_code);

                let items = await gameUtil.getCompanyList(conn);

                items = _.map(items, item => {
                        return {company_code: item.idx, isOpen: item.level <= myBuilding.home, ...item}
                    }
                );
                returnValues['value'] = {
                    list: items
                };

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});

/*
*
* 업체와 계약하기
* */
router.post('/company/contract/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let company_code = req.body.company_code;

    if (!session_key || !company_code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {

            try {
                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "더 이상 계약을 하실 수 없습니다.", 500);
                //

                //

                //
                // // 업체 정보
                // let comapnyInfo = await gameUtil.getSelCompanyInfo(conn, company_code);
                //
                // // 내 건물 정보, 포인트 정보 불러오기
                // let myInfo = await userUtil.getMyPointAndBuildingInfo(conn, user_code);
                //
                // // 내 집 레벨이 더 높은지 확인
                // if (myInfo.home < comapnyInfo.level) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "내 집 레벨이 부족합니다.", 500);
                //
                // // 골드 보유량 확인
                // //if (myInfo.gold < comapnyInfo.deposit) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "계약금이 부족합니다.", 500);
                //
                // // 지난 계약 상태 확인
                // let hasLatestContract = await gameUtil.getLatestContract(conn, user_code, company_code);
                //
                // if (hasLatestContract) throw new CMError(statusCodes.CODE_ERR_HAS_LATEST_CONTRACT, "해당 업체와 이미 계약중입니다.", 500);
                //
                // await connection.beginTransaction();
                //
                // // 데이터 추가
                // let contract_code = await gameUtil.addContractInfo(conn, user_code, company_code, comapnyInfo.deposit, comapnyInfo.days, comapnyInfo.penalty);
                //
                // // 골드 차감
                // //await gameUtil.updateUserGold(conn, user_code, -comapnyInfo.deposit, 0, comapnyInfo.deposit);
                // //await gameUtil.addPointHistory(conn, user_code, 0, -comapnyInfo.deposit, settings.POINT_TYPE_CONTRACT);
                //
                // await gameUtil.contract_start_Increase(conn,user_code);
                //
                // await connection.commit();

                returnValues['value'] = {

                };
                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});

/*
*
*  업체 계약 해지
* */
router.post('/company/contract/cancel/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let contract_code = req.body.contract_code;
    let company_code = req.body.company_code;

    if (!session_key || !contract_code || !company_code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {

            try {
                connection = conn;

                // 계약 히스토리에 해지 내역 남김
                // 계약 테이블에서 계약 삭제

                let user_code = await sessionUtil.getUserCode(conn, session_key);

                // 업체 정보
                let comapnyInfo = await gameUtil.getSelCompanyInfo(conn, company_code);

                // 계약 정보
                let contractInfo = await gameUtil.getSelContractInfo(conn, contract_code);

                await connection.beginTransaction();

                // 위약금 빼고 나머지 환불
                let refund = (contractInfo.deposit/comapnyInfo.chicken_count *contractInfo.delivery_chicken_count) - contractInfo.penalty;
                await gameUtil.updateUserPoint(conn, user_code, refund, refund, 0);




                // 계약 삭제
                await gameUtil.deleteContractInfo(conn, user_code, contract_code);

                await connection.commit();

                // 포인트 내역에 환수금 내역 남김
                await gameUtil.addPointHistory(conn, user_code, refund, 0,0, settings.POINT_TYPE_CONTRACT_CANCEL);

                // 계약 히스토리에 해지 내역 남김
                await gameUtil.addContractHistory(conn, user_code, company_code, comapnyInfo.name, settings.CONTRACT_FAILED, contractInfo.deposit, contractInfo.penalty, refund)


                returnValues['value'] = {
                    deposit : contractInfo.deposit,
                    penalty : contractInfo.penalty,
                    payment : refund

                };
                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});

/*
*
*  업체 계약 완수 닭 납품
* */
router.post('/company/contract/complete/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let contract_code = req.body.contract_code;
    let company_code = req.body.company_code;
    let chickens = req.body.chickens;

    if (!session_key || !contract_code || !company_code || !chickens) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    chickens = JSON.parse(chickens);

    if (!chickens.list) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "list not contained.", 400))
        return;
    }


    if (!(chickens.list instanceof Array)) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "chickens is must be Array.", 400))
        return;
    }

    chickens = chickens.list;

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {

            try {

                connection = conn;

                let user_code = await sessionUtil.getUserCode(conn, session_key);

                // 계약 정보
                let contractInfo = await gameUtil.getSelContractInfo(conn, contract_code);

                // 업체 정보
                let comapnyInfo = await gameUtil.getSelCompanyInfo(conn, company_code);


                // 닭 물량 부족 x
                // if (chickens.length < comapnyInfo.chicken_count) throw new CMError(statusCodes.CODE_ERR_NOT_ENOUGH_CHICKEN, "계약 조건을 확인 하세요.(물량)", 500);

                // 닭 물량 확인

                let delivery_end_check = false;

                if(contractInfo.delivery_chicken_count+chickens.length >= comapnyInfo.chicken_count)
                {
                    delivery_end_check = true;
                }



                // 닭 쿼리
                let where = _.map(chickens, n => 'idx=?').join(' OR ');
                let params = [user_code].concat(chickens)

                // 닭이 실제 존재 하는지
                let realCount = await chickenUtil.getCountChickenById(conn, where, params);
                // 닭이 실제 존재 하지 않음
                if (realCount <= 0) throw new CMError(statusCodes.CODE_ERR_NOT_EXIST_CHICKEN, "계약 조건을 확인 하세요.", 500);

                // 등급 미달 닭 확인
                let myChickens = await chickenUtil.getMyChickenListById(conn, where, params);
                let count = _.reduce(myChickens, (chicken, count) => {
                    return chicken.grade > comapnyInfo.min_grade ? count + 1 : count;
                }, 0);

                if (count > 0) throw new CMError(statusCodes.CODE_ERR_NOT_FULFILL_CONTRACT, "계약 조건을 확인 하세요.(등급)", 500);





                // 기간 지났는지 확인
                let contract_date_check =  await gameUtil.getContractDateStat(conn, contract_code,company_code,user_code);

                /*
                let point = _.reduce(chickens, (chicken, point) => {
                    if (chicken.grade === chickenSettings.GRADE_A) {
                        return point + chickenSettings.POINT_PER_GRADE_A;
                    } else if (chicken.grade === chickenSettings.GRADE_B) {
                        return point + chickenSettings.POINT_PER_GRADE_B;
                    } else if (chicken.grade === chickenSettings.GRADE_C) {
                        return point + chickenSettings.POINT_PER_GRADE_C;
                    } else if (chicken.grade === chickenSettings.GRADE_D) {
                        return point + chickenSettings.POINT_PER_GRADE_D;
                    } else {
                        return point + chickenSettings.POINT_PER_GRADE_F;
                    }
                });*/



                await gameUtil.chickenlog(conn, user_code,chickens,settings.REASON_CHICKEN_DELIVERY);

                /* 닭 개수 꽉차면 완료 */
                if(delivery_end_check)
                {

                    await connection.beginTransaction();

                    //let refundDeposit = contractInfo.deposit;

                    // 계약금 돌려줌
                    //await gameUtil.updateUserGold(conn, user_code, refundDeposit, 0, -refundDeposit);

                    // 계약 삭제
                    await gameUtil.deleteContractInfo(conn, user_code, contract_code);

                    // 닭 삭제
                    await chickenUtil.deleteMyChickenListForSell(conn, where, params);

                    if(contract_date_check)
                    {
                        /*  패널티 o */

                        let point = contractInfo.deposit-contractInfo.penalty;

                        // 포인트 지급
                        await gameUtil.updateUserPoint(conn, user_code, point, point, 0);

                        // 포인트 내역에 포인트, 골드 환수금 남김
                        await gameUtil.addPointHistory(conn, user_code, point, 0,0, settings.POINT_TYPE_CONTRACT_CANCEL);

                        // 계약 히스토리에 성공 내역 남김
                        await gameUtil.addContractHistory(conn, user_code, company_code, comapnyInfo.name, settings.CONTRACT_SUCCESS, contractInfo.deposit, contractInfo.penalty, contractInfo.deposit)



                    }else{
                        /*  패널티 x */
                        await gameUtil.contract_complete_Increase(conn,user_code);

                        // 포인트 지급
                        await gameUtil.updateUserPoint(conn, user_code, contractInfo.deposit, contractInfo.deposit, 0);

                        // 포인트 내역에 포인트, 골드 환수금 남김
                        await gameUtil.addPointHistory(conn, user_code, contractInfo.deposit, 0,0, settings.POINT_TYPE_CONTRACT_CANCEL);

                        // 계약 히스토리에 성공 내역 남김
                        await gameUtil.addContractHistory(conn, user_code, company_code, comapnyInfo.name, settings.CONTRACT_SUCCESS, contractInfo.deposit, 0, contractInfo.deposit)

                    }




                    await connection.commit();
                }else{
                    await connection.beginTransaction();
                    //닭삭제
                    await chickenUtil.deleteMyChickenListForSell(conn, where, params);
                    //닭 카운트 증가
                    await gameUtil.setDeliveryCount(conn, user_code, company_code,chickens.length);

                    await connection.commit();
                }


                await gameUtil.missionupdate(conn,user_code,chickens.length,settings.MISSION_SELL_CHICKEN_COUNT);
                await gameUtil.missionupdate2(conn,user_code,chickens.length,settings.MISSION_SELL_CHICKEN_COUNT);

                await gameUtil.chicken_sell_Increase(conn,user_code,chickens.length);

                let missions = await gameUtil.getMyMissionInfo(conn, user_code);

                returnValues['value'] = {
                    name : comapnyInfo.name,
                    acquire_point: contractInfo.deposit,
                    delivery_ok : delivery_end_check,
                    chicken_sell_count : missions.chicken_sell_count,
                    contract_complete_count : missions.contract_complete_count
                };

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*
*   내 업체 계약 목록
* */
router.get('/company/contract/list/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {

            try {

                connection = conn;

                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let list = await gameUtil.getUserContractList(conn, user_code);

                returnValues['value'] = {
                    list: list
                };
                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*   연구 목록 불러오기
* */
router.get('/development/list', (req, res, next) => {
    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {

            try {

                connection = conn;

                let items = await devUtil.getDevelopmentList(conn);

                returnValues['value'] = {
                    list: items
                };

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*
* 사용자 계란 갯수  / 알  달걀
* */
router.get('/my/egg/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let eggs = await userUtil.getMyEgg(conn, user_code);

                returnValues['value'] = {
                    ...eggs
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


/*
*
* 아이템 구매 하기
* */
router.post('/store/buy/item', (req, res, next) => {
    let session_key = req.body.session_key;
    let item_code = req.body.item_code;
    let chick_name = req.body.name;
    let item_count = req.body.item_count;


    if (!session_key || !item_code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {



                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let userPoint = await userUtil.getPointInfo(conn, user_code);
                let item = await gameUtil.getSelStoreItem(conn, item_code);
                let chickenCount = await gameUtil.getMyChickCount(conn, user_code);
                let storageInfo = await chickenUtil.getStorage(conn, user_code);

                //죽은닭잇으면 청소
                await chickenUtil.chickclean(conn, user_code);

                // 보유한 골드 확인
                if (userPoint.gold < item.price*item_count) throw new CMError(statusCodes.CODE_ERR_NOT_ENOUGH_GOLD, "골드 부족", 400);

                await conn.beginTransaction();

                // 사용자 아이템 추가 - 병아리 일경우 내 닭 리스트에 추가, 사료 일경우 아이
                if (item.type === settings.ITEM_TYPE_CHICK) {
                    // 닭 보유 갯수 확인
                    if (chickenCount >= storageInfo.max_chicken_count) throw new CMError(statusCodes.CODE_ERR_EXCEED_CHICK_COUNT, "닭 보유 가능 갯수 초과", 400);

                    if(chick_name==''||chick_name==null)
                    {
                        chick_name = "병아리";
                    }
                    // 병아리, 내 닭 목록에 추가
                    await gameUtil.genNewChick(conn, user_code,chick_name);
                    await gameUtil.BuyChickCountIncrease(conn,user_code);
                } else {
                    // 내 아이템 목록에 추가
                    await gameUtil.addItem(conn, user_code, item_code, item_count);
                    await gameUtil.BuyItemCountIncrease(conn,user_code,item_count);
                }

                // 골드 차감
                await gameUtil.updateUserGold(conn, user_code, -(item.price*item_count), 0, item.price*item_count);

                // 골드 사용 히스토리
                await gameUtil.addPointHistory(conn, user_code, 0, -(item.price*item_count),0, settings.POINT_TYPE_BUY_ITEM);

                await conn.commit();

                returnValues['value'] = {
                    gold: userPoint.gold - (item.price*item_count)
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                await conn.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


// 내 아이템 인벤토리
router.get('/my/inventory/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let list = await gameUtil.getMyInventory(conn, user_code);

                returnValues['value'] = {
                    list: list
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


/*
* 건물 업그레이드 하기
* */
router.post('/building/upgrade', (req, res, next) => {

    let session_key = req.body.session_key;
    let type = req.body.type;

    if (!session_key || !type) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let buildingInfo = await userUtil.getMyBuildingInfo(conn, user_code);
                let userPoint = await userUtil.getPointInfo(conn, user_code);

                let level, columnName, incEgg = 0, incChicken = 0;
                let price;


                // 레벨이 최대치인지 확인
                switch (Number(type)) {
                    case buildingSettings.BUILDING_TYPE_HOME:
                        level = buildingInfo.home;
                        columnName = 'home';

                        price = buildingSettings.BUILDING_UPGRADE_PRICE_HOUSE;
                        break;

                    case buildingSettings.BUILDING_TYPE_WARE:       // 알갯수 증가
                        level = buildingInfo.ware;
                        incEgg = buildingSettings.INC_EGG;
                        columnName = 'ware';
                        price = buildingSettings.BUILDING_UPGRADE_PRICE_WARE;
                        break;

                    case buildingSettings.BUILDING_TYPE_CHICKEN:    // 닭 최대치 증가
                        level = buildingInfo.chicken;
                        incChicken = buildingSettings.INC_CHICK;
                        columnName = 'chicken';
                        price = buildingSettings.BUILDING_UPGRADE_PRICE_COOK;
                        break;

                    case buildingSettings.BUILDING_TYPE_FENCE:
                        level = buildingInfo.fence;
                        columnName = 'fence';
                        break;
                }


                if (level >= buildingSettings.BUILDING_MAX_LEVEL) throw new CMError(statusCodes.CODE_ERR_MAX_LEVEL, "레벨이 최대치 입니다.", 500);


                // 비용 확인
                switch (Number(level)) {
                    case 1:
                        price *= buildingSettings.BUILDING_UPGRADE_PRICE_LV2;
                        break;

                    case 2:
                        price *= buildingSettings.BUILDING_UPGRADE_PRICE_LV2*buildingSettings.BUILDING_UPGRADE_PRICE_LV3;
                        break;

                    case 3:
                        price *= buildingSettings.BUILDING_UPGRADE_PRICE_LV2*buildingSettings.BUILDING_UPGRADE_PRICE_LV3*buildingSettings.BUILDING_UPGRADE_PRICE_LV4;
                        break;

                    case 4:
                        price *= buildingSettings.BUILDING_UPGRADE_PRICE_LV2*buildingSettings.BUILDING_UPGRADE_PRICE_LV3*buildingSettings.BUILDING_UPGRADE_PRICE_LV4*buildingSettings.BUILDING_UPGRADE_PRICE_LV5;
                        break;
                }

                if (price > userPoint.gold) throw new CMError(statusCodes.CODE_ERR_NOT_ENOUGH_GOLD, "보유하신 골드가 부족합니다.", 500);

                await conn.beginTransaction();

                // 레벨업
                await gameUtil.upgradeMyBuilding(conn, user_code, columnName);

                // 골드 차감
                await gameUtil.updateUserGold(conn, user_code, -price, 0, price);

                // 알 최대 수 증가
               // if (incEgg > 0) {
                  //  await devUtil.upgradeEggStorage(conn, user_code, incEgg);
              //  }

                // 닭 최대 수 증가
             //   if (incChicken > 0) {
             //       await devUtil.upgradeChickenStorage(conn, user_code, incChicken);
              //  }

                // 골드 사용 히스토리
                await gameUtil.addPointHistory(conn, user_code, 0, -price,0, settings.POINT_TYPE_USE);

                await conn.commit();

                buildingInfo[columnName] = buildingInfo[columnName] + 1;

                returnValues['value'] = {
                    ...buildingInfo
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                await conn.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


/*
*
*   내 닭 상태 불러오기
*   + 청결도 , 닭상태 , 업데이트
* */
router.get('/my/chicken/list/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {

                await conn.beginTransaction();
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                // 내 연구 상태
                let devUpdate = await devUtil.getMyDevelopmentList(conn, user_code, devSetting.DEV_TYPE_INTERVAL);
                let devHP = await devUtil.getMyDevelopmentList(conn, user_code, devSetting.DEV_TYPE_HP);



                // hp 감소량 감소 수치
                //let extra_hp_dec =  (devHP.level - 1) * devSetting.DEV_INC_PER_HP_DEC
                let extra_time =  (devHP.level - 1) * devSetting.DEV_INC_PER_HP_DEC;


                // 업데이트 간격
                let extra_interval = (devUpdate.level - 1) * devSetting.DEV_INC_PER_INTERVAL;

                let UPDATE_INTERVAL = chickenSettings.UPDATE_INTERVAL + extra_time ;


                // 마지막 업데이트 시간 확인, 30분 지났을 경우 상태 업데이트
                // 남음 시간을 가져온다
                let idleTime = await chickenUtil.getRemainUpdateSecond(conn, user_code);

                let count = idleTime / UPDATE_INTERVAL;

                count = Math.floor(count);
                if(count<0)
                {
                    count = 0;
                }
                // 감소 시킬 체력
                let decHP = (chickenSettings.STATUS_HP_DOWN ) * count;
                // 감소 시킬 호감도
                let decLove = (chickenSettings.STATUS_LOVE_DOWN) * count;
                // 추가 감소 체력
                let extraDecHP = chickenSettings.STATUS_HP_DOWN_WHEN_SICK * count;
                // 추가 감소 호감도
                let extraDecLove = chickenSettings.STATUS_LOVELY_DOWN_WHEN_SICK * count;


                if (idleTime >= UPDATE_INTERVAL) {

                    // 닭 체력 감소,  닭 호감도 감소, 마지막으로 밥준 시간
                    await chickenUtil.decreaseChickenStatus(conn, user_code, -decHP, -decLove, UPDATE_INTERVAL);

                    // 병걸린 닭 추가 감소,  마지막으로 밥준 시간
                    await chickenUtil.decreaseChickenWhenSickStatus(conn, user_code, -extraDecHP, -extraDecLove, UPDATE_INTERVAL);

                    // 마지막으로 놀아준 시간으로 호감도 하락
                    await chickenUtil.decreaseChickenLoveStatus(conn, user_code, -decLove, UPDATE_INTERVAL);

                    // 죽었는지 확인
                    await chickenUtil.checkDeadChickens(conn, user_code)

                    // 농장 청결도 변경
                    await chickenUtil.decreaseFarmDirtyStatus(conn, user_code, chickenSettings.STATUS_DIRTY_UP);

                    // 업데이트 시간 변경
                    await chickenUtil.updateDateUpdate(conn, user_code);

                }


                // 닭 목록
                let list = await chickenUtil.getMyChickenList(conn, user_code);


                list = _.map(list, row => {

                    let grade_expectation, grade_range_code = '', grade_range_text = '';
                    if (row.grade === chickenSettings.GRADE_NONE) {
                        let aliveTime = moment.duration(row.current - row.gendate).asMinutes();

                        grade_expectation = chickenUtil.calcChickenGradeScore(row.hp, row.lovely, row.play_count,row.food_count,row.clean_count)

                        grade_range_code = chickenUtil.getGradeRangeCode(grade_expectation);
                        grade_range_text = chickenUtil.getGradeRangeText(grade_expectation);
                    }

                    // 알 을 낳았으면 api 호출
                    return {
                        ...row,
                        grade_expectation: grade_expectation,
                        grade_range_code: grade_range_code,
                        grade_range_text: grade_range_text
                    }
                });

                await conn.commit();

                returnValues['value'] = {
                    list: list,


                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                await conn.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});



/*
*
*  오프라인 동안 생산한 알 리스트 / 달걀 계란
* */
router.get('/chicken/egg/offline/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {


                let user_code = await sessionUtil.getUserCode(conn, session_key);

/*
                // 내 연구 상태
                let devEggUpdate = await devUtil.getMyDevelopmentList(conn, user_code, devSetting.DEV_TYPE_INTERVAL);
                // 알낳는 간격 각각으로 계산
                let extra_egg_interval = (devEggUpdate.level - 1) * devSetting.DEV_INC_PER_EGG_DELAY ;
                // 초단위
                let EGG_INTERVAL = chickenSettings.EGG_INTERVAL - extra_egg_interval;

                // 닭 목록
                let list = await chickenUtil.getUpgradedChickenList(conn, user_code);

                await conn.beginTransaction();
                let egg_count = await chickenUtil.getGenEggCount(conn, user_code);




                list = _.forEach(list, row => {

                    // 알 생상 갯수
                    let eggProduction;
                    let eggInterval = moment.duration(row.current - row.last_egg_date).asSeconds();
                    eggProduction = eggInterval >= EGG_INTERVAL ? eggInterval / EGG_INTERVAL : 0;
                    eggProduction = Math.floor(eggProduction);

                    if(eggProduction > 0) {
                        eggProduction = eggProduction < chickenSettings.OFFLINE_ONECHICKEN_MAX_EGG_COUNT ? eggProduction : chickenSettings.OFFLINE_ONECHICKEN_MAX_EGG_COUNT;
                        egg_count = egg_count+eggProduction ;
                        if(egg_count<=chickenSettings.OFFLINE_MAX_EGG_COUNTS)
                        {
                            // 알생성 목록에 추가
                           // chickenUtil.reqGenEggOnLoop(conn, user_code, chickenSettings.EGG_NORMAL, row.idx, eggProduction);
                        }
                        // 마지막 알 낳은 시간 업데이트
                        chickenUtil.updateLastEggProductionDateOnLoop(conn, user_code, row.idx);

                    }
                });

                let genList = await chickenUtil.getGenEggList(conn, user_code);

                await conn.commit();
*/

                let chickens = await chickenUtil.getchickencount(conn, user_code);
                let egg_count = Math.floor(((moment.duration(chickens.current - chickens.last_egg_date).asSeconds()) / chickenSettings.OFFLINE_EGG_TIME)) * chickens.count;
                if(egg_count>chickenSettings.OFFLINE_MAX_EGG_COUNTS)
                {
                    egg_count = chickenSettings.OFFLINE_MAX_EGG_COUNTS;
                }
                returnValues['value'] = {
                    chickens: chickens,
                    egg_count: egg_count
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                await conn.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


/*
*  개별 닭 알 생성 요청 / 계란 달걀
* */
router.post('/chicken/egg/req/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;
    let chicken_code = req.body.chicken_code;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {


                let user_code = await sessionUtil.getUserCode(conn, session_key);
                // 내 연구 상태
                let devEggUpdate = await devUtil.getMyDevelopmentList(conn, user_code, devSetting.DEV_TYPE_INTERVAL);
                // 황금알 연구 상태
                let devGoldEgg = await devUtil.getMyDevelopmentList(conn, user_code, devSetting.DEV_TYPE_GOLD_EGG);
                // 알낳는 간격 각각으로 계산
                let extra_egg_interval = (devEggUpdate.level - 1) * devSetting.DEV_INC_PER_EGG_DELAY;
                // 초단위
                let EGG_INTERVAL = chickenSettings.EGG_INTERVAL - extra_egg_interval;
                // 황금알 낳을 확률
                let GOLD_EGG_PERCENT = chickenSettings.DEFAULT_GOLD_EGG_PERCENT + (devGoldEgg.level * devSetting.DEV_INC_PER_GOLD_EGG);

                // 선택한 닭
                let chicken = await chickenUtil.getSelChickenInfo(conn, user_code, chicken_code);
                let eggInterval = moment.duration(chicken.current - chicken.last_egg_date).asSeconds();
                if(chicken.grade === chickenSettings.GRADE_NONE
                    || chicken.healthy === chickenSettings.CHICKEN_STATUS_DEAD
                    || chicken.hp <= 0) throw new CMError(statusCodes.CODE_ERR_EGG_CHICKEN_DIE, "생성 요청 실패 (닭 죽음)", 500);
                if(eggInterval < EGG_INTERVAL) throw new CMError(statusCodes.CODE_ERR_EGG_TIME, "생성 요청 실패 (생성 시간 부족)", 500);
                let reqeggcount = await chickenUtil.getReqEggs(conn, user_code);
                if(reqeggcount > chickenSettings.OFFLINE_MAX_EGG_COUNTS) throw new CMError(statusCodes.CODE_ERR_EGG_COUNT_MAX, "생성 요청 실패 (요청 최대)", 500);



                await conn.beginTransaction();
                await chickenUtil.updateLastEggProductionDate(conn, user_code, chicken_code);

                // TODO: 알 등급 결정, 연구 상태 확인
                let eggType = chickenUtil.getRandomWithWeight(GOLD_EGG_PERCENT);
                await chickenUtil.reqGenEgg(conn, user_code, eggType, chicken_code, 1);

                let genInfo = await chickenUtil.getSelGenEggInfo(conn, user_code, chicken_code);

                await conn.commit();

                returnValues['value'] = {
                    eggInterval : eggInterval,
                    egg_interval: EGG_INTERVAL,
                    chicken_code: chicken_code,
                    ...genInfo
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                await conn.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});

// 요청한 알 획득, 실제로 알 획득 1개씩  / 계란 달걀
router.post('/chicken/egg/regist/each/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;
    let gen_code = req.body.gen_code;
    let chicken_code = req.body.chicken_code;

    if (!session_key || !gen_code || !chicken_code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {


                let user_code = await sessionUtil.getUserCode(conn, session_key);

                /// 추가 더이상 얻을수 없음
                let max_egg_count = await chickenUtil.getMaxEggCount(conn, user_code);
                let my_egg_count = await chickenUtil.getMyEggCount(conn, user_code);

                if(my_egg_count>=max_egg_count) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "더이상 달걀을 가질 수 없습니다.", 500);

                // 요청 정보 가져오기
                let genInfo = await chickenUtil.getSelGenEggInfoByGenCode(conn, user_code, chicken_code, gen_code);



                await conn.beginTransaction();

                // 사용자 알 갯수 증가
                if(genInfo.type === chickenSettings.EGG_NORMAL) {
                    //await chickenUtil.updateNormalEggCount(conn, user_code, genInfo.count);
                    await chickenUtil.updateNormalEggCount(conn, user_code, 1);
                } else {
                    // 추후처리 황금알일경우
                    //await chickenUtil.updateGoldEggCount(conn, user_code, 1);
                    await chickenUtil.updateGoldEggCount(conn, user_code, 1);
                }

                if(genInfo.count ==1) {
                    // 요청 삭제
                    await chickenUtil.deleteEggGenReq(conn, user_code, gen_code, chicken_code);
                }else{
                    await chickenUtil.deleteOneEggGenReq(conn, user_code, gen_code, chicken_code);
                }
                // 계란 히스토리
                //await chickenUtil.addEggHistory(conn, user_code, genInfo.count, genInfo.type);
                await chickenUtil.addEggHistory(conn, user_code, 1, genInfo.type);

                await conn.commit();

                let eggs = await userUtil.getMyEgg(conn, user_code);

                returnValues['value'] = {
                    ...eggs
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                await conn.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


// 요청한 알 획득, 전체  / 달걀 계란
router.post('/chicken/egg/regist/all/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);

                // 요청 정보 가져오기
                let eggReqList = await chickenUtil.getGenEggList(conn, user_code);

                await conn.beginTransaction();

                let normalCount = _.filter(eggReqList, egg => filter(egg.type, chickenSettings.EGG_NORMAL))
                    .reduce((total, egg) => sum(total, egg.count), 0);

                let goldCount = _.filter(eggReqList, egg => filter(egg.type, chickenSettings.EGG_GOLD))
                    .reduce((total, egg) => sum(total, egg.count), 0);

                // 사용자 알 갯수 증가
                if(normalCount > 0) {
                    await chickenUtil.updateNormalEggCount(conn, user_code, normalCount);
                    await chickenUtil.addEggHistory(conn, user_code, normalCount, chickenSettings.EGG_NORMAL);
                }

                if(goldCount > 0) {
                    await chickenUtil.updateGoldEggCount(conn, user_code, goldCount);
                    await chickenUtil.addEggHistory(conn, user_code, goldCount, chickenSettings.EGG_GOLD);
                }

                // 요청 삭제
                await chickenUtil.deleteAllEggGenList(conn, user_code);
                await conn.commit();

                let eggs = await userUtil.getMyEgg(conn, user_code);

                returnValues['value'] = {
                    ...eggs
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                await conn.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});

function sum (total, count) {
    return total + count;
}

function filter (type, condition) {
    return type === condition
}


/*
*  연구 업그레이드 하기
* */
router.post('/development/upgrade', (req, res, next) => {

    let session_key = req.body.session_key;
    let type = req.body.type;

    if (!session_key || !type) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {

                //     let development_list = await sessionUtil.getDevelopmentList(conn);
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let development_list = await devUtil.getDevelopmentList(conn);
                let my_development_list = await devUtil.getMyDevelopmentList(conn, user_code, type);
                let userPoint = await userUtil.getPointInfo(conn, user_code);

                let level, max_level, price;
                for (let i = 0; i < development_list.length; i++) {
                    if (development_list[i].type == type) {
                        max_level = development_list[i].max_level;
                        price = development_list[i].price;

                        break;
                    }
                }


                level = my_development_list.level;
                //max_level = my_development_list.max_level;
                //price = my_development_list.price * level;


                if(level == 1)
                {
                    price *= 2;
                }else if(level == 2)
                {
                    price *= 2*3;
                }else if(level == 3)
                {
                    price *= 2*3*4;
                }else if(level == 4)
                {
                    price *= 2*3*4*5;
                }

                if (level >= max_level) throw new CMError(statusCodes.CODE_ERR_MAX_LEVEL, "레벨이 최대치 입니다.", 500);

                if (price > userPoint.gold) throw new CMError(statusCodes.CODE_ERR_NOT_ENOUGH_GOLD, "보유하신 골드가 부족합니다.", 500);

                await conn.beginTransaction();

                // 레벨업
                await devUtil.upgradeMyDevelopment(conn, user_code, type);

                // 골드 차감
                await gameUtil.updateUserGold(conn, user_code, -price, 0, price);

                // 골드 사용 히스토리
                await gameUtil.addPointHistory(conn, user_code, 0, -price,0, settings.POINT_TYPE_USE);


                await conn.commit();


                returnValues['value'] = {
                    level: (level + 1),
                    price : price
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                await conn.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


// 게임 설정값
router.get('/env/values/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let buildingInfo = await userUtil.getMyBuildingInfo(conn, user_code);
                let devUpdate = await devUtil.getMyDevelopmentList(conn, user_code, devSetting.DEV_TYPE_INTERVAL);
                let devEggUpdate = await devUtil.getMyDevelopmentList(conn, user_code, devSetting.DEV_TYPE_INTERVAL);

                // 업데이트 간견
                let extra_interval = (devUpdate.level - 1) * devSetting.DEV_INC_PER_INTERVAL;
                let UPDATE_INTERVAL = chickenSettings.UPDATE_INTERVAL - extra_interval;
                // 알낳는 간격
                let extra_egg_interval = (devEggUpdate.level - 1) * devSetting.DEV_INC_PER_EGG_DELAY;
                let EGG_INTERVAL = chickenSettings.EGG_INTERVAL - extra_egg_interval;
                // 질병 걸릴 확률
                let SICK_PERCENT =  buildingInfo.dirty * chickenSettings.DEFAULT_SICK_PERCENT ;

                // 마지막 업데이트 시간 확인, 30분 지났을 경우 상태 업데이트
                // 남음 시간을 가져온다
                let idleTime = await chickenUtil.getRemainUpdateSecond(conn, user_code);
                let idleSecond = idleTime % UPDATE_INTERVAL;

                returnValues['value'] = {
                    UPDATE_INTERVAL: UPDATE_INTERVAL,
                    EGG_INTERVAL: EGG_INTERVAL,
                    SICK_PERCENT: SICK_PERCENT > 0 ? SICK_PERCENT : 0,
                    reamin_update_time: UPDATE_INTERVAL - idleSecond,
                    GOLD_CURE: chickenSettings.POINT_CURE
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


/*
*  먹이 주기
*
* */
router.post('/chicken/feed/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;
    let chickens = req.body.chickens;
    let item_code = req.body.item_code;

    if (!session_key || !chickens || !item_code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    chickens = JSON.parse(chickens);

    if (!chickens.list) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "list not contained.", 400))
        return;
    }


    if (!(chickens.list instanceof Array)) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "chickens is must be Array.", 400))
        return;
    }

    chickens = chickens.list;


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let itemInfo = await gameUtil.getInventorySelItemInfo(conn, user_code, item_code);


//                if( (await chickenUtil.getFoodIsOk(conn, user_code) ) == 0 ) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, '먹이주기 쿨타임이 남았습니다.', 400);;

                // 먹이 갯수가 닭개수 보다 작으면 에러
                if (itemInfo.count < chickens.length) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, '먹이가 부족합니다.', 400);


                await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_FOOD_COUNT);
                await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_FOOD_COUNT);
                await gameUtil.FoodCountIncrease(conn,user_code);

                // 포만감 수치 계산
                let devFood = await devUtil.getMyDevelopmentList(conn, user_code, devSetting.DEV_TYPE_FOOD);


                let itemstat = await gameUtil.getItemsState(conn, item_code);
                // 체력 회복 수치
                let extra_hp = 0;
                let extra_love = itemstat.lovely;
                if(item_code == 5)
                {
                    extra_hp = itemstat.hp;
                }else {
                    extra_hp = (devFood.level*2) + itemstat.hp;
                }


                let recovery_hp = extra_hp;
                let recovery_love = extra_love;


                let food_type = 1;
                if(item_code == 5 || item_code == 6 || item_code == 7)
                {
                    food_type = 1;
                }else if(item_code == 8 || item_code == 9)
                {
                    food_type = 5;
                }else if(item_code == 10 || item_code == 11)
                {
                    food_type = 4;
                }else if(item_code == 12 || item_code == 13)
                {
                    food_type = 3;
                }else if(item_code == 14 || item_code == 15)
                {
                    food_type = 2;
                }

                await conn.beginTransaction();

                // 치킨 상태 증가 시키키
                // 조건절 만들기
                //let where = _.map(chickens, n => 'idx=?').join(' AND ');
                //let params = [recovery_hp, recovery_love, user_code].concat(chickens)
              //  await chickenUtil.increaseChickenStatus(conn, user_code, recovery_hp, recovery_love, chickens);


                // 종류에 따른 먹이 횟수 증가 ( 병아리만 증가 )
                await chickenUtil.increaseChickenFoodStatus(conn, user_code, chickens,food_type);

                for(let i = 0;i<chickens.length;i++) {
                    let row = await chickenUtil.getSelChickenInfo(conn, user_code, chickens[i]);
                    let max_hp = 100;
                    if (row.grade == 0) {
                        max_hp = chickenSettings.CHICKEN_HP_CODE0;
                    } else {
                        if (row.chicken_code == 1) {
                            max_hp = chickenSettings.CHICKEN_HP_CODE1;
                        } else if (row.chicken_code == 2) {
                            max_hp = chickenSettings.CHICKEN_HP_CODE2;
                        } else if (row.chicken_code == 3) {
                            max_hp = chickenSettings.CHICKEN_HP_CODE3;
                        } else if (row.chicken_code == 4) {
                            max_hp = chickenSettings.CHICKEN_HP_CODE4;
                        } else if (row.chicken_code == 5) {
                            max_hp = chickenSettings.CHICKEN_HP_CODE5;
                        }
                    }
                    await chickenUtil.increaseChickenStatus(conn, user_code, recovery_hp, recovery_love, row.idx, max_hp);
                }




                /*
                let where = _.map(chickens, n => 'idx=?').join(' AND ');
                let params = [recovery_hp, recovery_love, user_code].concat(chickens)
                await chickenUtil.increaseChickenStatus(conn, where, params);
                */






                // 사료 갯수 감소
                await gameUtil.useInventoryItem(conn, user_code, item_code, chickens.length);
                await chickenUtil.setfoodcount(conn, user_code);

                await conn.commit();

                // 히스토리 추가, 비동기적으로
                await gameUtil.addItemUseHistory(conn, user_code, item_code, chickens.length);

                // 닭 목록
                let list = await chickenUtil.getMyChickenList(conn, user_code);

                list = _.filter(list, row => chickens.includes(row.idx));
                list = _.map(list, row => {
                    if (chickens.includes(row.idx) && row.grade === chickenSettings.GRADE_NONE) {
                        let aliveTime = moment.duration(row.current - row.gendate).asMinutes();

                        //row.max_hp = max_hp
                        //row.grade_expectation = chickenUtil.calcChickenGradeScore(row.hp, row.lovely, aliveTime,max_hp);
                        //row.grade_range_code = chickenUtil.getGradeRangeCode(row.grade_expectation);
                        //row.grade_range_text = chickenUtil.getGradeRangeText(row.grade_expectation);


                    }
                    return {
                        ...row,

                    }
                });

                returnValues['value'] = {
                    recovery_hp: recovery_hp,
                    recovery_love: recovery_love,
                    remainItem: itemInfo.count - chickens.length,
                    list: list
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                await connection.rollback()
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


/*
*   닭똥치우기  // 청소하기
* */
router.post('/chicken/cleanup/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {



                let user_code = await sessionUtil.getUserCode(conn, session_key);
                await conn.beginTransaction();



                //settings.CLEAN_RECYCLE_TIME
                if( (await chickenUtil.getCleanIsOk(conn, user_code) ) == 0 ) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, '청소 쿨타임이 남았습니다.', 400);;


                // 청결도 수정
                await chickenUtil.cleanFarm(conn, user_code, chickenSettings.STATUS_DIRTY_RECOVERY_POINT);

                // 체력, 호감도 수정
                await chickenUtil.increaseChickenHP(conn, user_code, chickenSettings.STATUS_HP_UP_BY_CLEANUP, chickenSettings.STATUS_LOVE_UP_BY_CLEANUP);

                await conn.commit();

                // 질병 걸릴 확률
                let buildingInfo = await userUtil.getMyBuildingInfo(conn, user_code);
                let SICK_PERCENT = buildingInfo.dirty * chickenSettings.DEFAULT_SICK_PERCENT;

                let chickens = await gameUtil.getdiecihckens(conn, user_code);
                if(chickens.length>0) {
                    await gameUtil.chickenlog(conn, user_code, chickens, settings.REASON_CHICKEN_DIE);
                }
                // 죽은 병아리  삭제
                await chickenUtil.chickclean(conn, user_code);



                await chickenUtil.setcleancount(conn, user_code);


                await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_CLEAN_COUNT);
                await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_CLEAN_COUNT);
                await gameUtil.CleanCountIncrease(conn,user_code);

                let missions = await gameUtil.getMyMissionInfo(conn, user_code);

                returnValues['value'] = {
                    farm_dirty: buildingInfo.dirty,
                    recovery_hp: chickenSettings.STATUS_HP_UP_BY_CLEANUP,
                    recovery_love: chickenSettings.STATUS_LOVE_UP_BY_CLEANUP,
                    sick_percent: SICK_PERCENT,
                    clean_count : missions.clean_count
                };
                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })

});


/*
*
*  닭 등급 리스트
* */
router.get('/chicken/grade/list/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);

                // 닭 목록
                let list = await chickenUtil.getMyChickenBeforeUpgrade(conn, user_code);

                list = _.map(list, row => {
                    let aliveTime = moment.duration(row.current - row.gendate).asMinutes();
                    let max_hp = 0;
                    if(row.grade == 0)
                    {
                        max_hp = chickenSettings.CHICKEN_HP_CODE0;
                    }
                    else
                    {
                        if(row.chicken_code == 1)
                        {
                            max_hp = chickenSettings.CHICKEN_HP_CODE1;
                        }else if(row.chicken_code == 2)
                        {
                            max_hp = chickenSettings.CHICKEN_HP_CODE2;
                        }else if(row.chicken_code == 3)
                        {
                            max_hp = chickenSettings.CHICKEN_HP_CODE3;
                        }else if(row.chicken_code == 4)
                        {
                            max_hp = chickenSettings.CHICKEN_HP_CODE4;
                        }else if(row.chicken_code == 5)
                        {
                            max_hp = chickenSettings.CHICKEN_HP_CODE5;
                        }
                    }
                    let grade_expectation = chickenUtil.calcChickenGradeScore(row.hp, row.lovely, aliveTime,max_hp);
                    let grade_range_code = chickenUtil.getGradeRangeCode(grade_expectation);
                    let grade_range_text = chickenUtil.getGradeRangeText(grade_expectation);

                    // 알 을 낳았으면 api 호출
                    return {
                        ...row,
                        grade_expectation: grade_expectation,
                        grade_range_code: grade_range_code,
                        grade_range_text: grade_range_text
                    }
                });


                returnValues['value'] = {
                    list: list
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


/*
*
* 닭이랑 놀아주기
* */
router.post('/chicken/play/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;
    let chicken_code = req.body.chicken_code;
    if (!session_key || !chicken_code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);
                await conn.beginTransaction();


                let play_check = await chickenUtil.playtimecheck(conn, user_code, chicken_code);
                if(play_check == 0)throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "더이상 놀아줄 수 없습니다.", 500);

                // 호감도, 놀아준 시간 수정
                await chickenUtil.playWithChicken(conn, user_code, chicken_code, chickenSettings.STATUS_LOVELY_UP);
                await chickenUtil.setplaycount(conn, user_code,chicken_code);

                await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_PLAY_COUNT);
                await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_PLAY_COUNT);

                await gameUtil.PlayCountIncrease(conn,user_code);

                await conn.commit();

                returnValues['value'] = {
                    recovery_love: chickenSettings.STATUS_LOVELY_UP
                };
                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


/*
*
* 치료하기
* */
router.post('/chicken/cure/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;
    let chicken_code = req.body.chicken_code;
    if (!session_key || !chicken_code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);

                // 사용자 포인트
                let userPoint = await userUtil.getPointInfo(conn, user_code);
                // 골드부족
                if (userPoint.gold < chickenSettings.POINT_CURE) throw new CMError(statusCodes.CODE_ERR_NOT_ENOUGH_GOLD, "치료에 필요한 골드가 부족합니다.", 500);

                await conn.beginTransaction();

                // 치료하기

                let chick_data = await chickenUtil.getSelChickenInfo(conn, user_code, chicken_code);

                let max_hp = 0;
                if(chick_data.grade == 0)
                {
                    max_hp = chickenSettings.CHICKEN_HP_CODE0;
                }
                else
                {
                    if(chick_data.chicken_code == 1)
                    {
                        max_hp = chickenSettings.CHICKEN_HP_CODE1;
                    }else if(chick_data.chicken_code == 2)
                    {
                        max_hp = chickenSettings.CHICKEN_HP_CODE2;
                    }else if(chick_data.chicken_code == 3)
                    {
                        max_hp = chickenSettings.CHICKEN_HP_CODE3;
                    }else if(chick_data.chicken_code == 4)
                    {
                        max_hp = chickenSettings.CHICKEN_HP_CODE4;
                    }else if(chick_data.chicken_code == 5)
                    {
                        max_hp = chickenSettings.CHICKEN_HP_CODE5;
                    }
                }



                // 체력, 호감도 수정
                await chickenUtil.cureChicken(conn, user_code,chicken_code, chickenSettings.STATUS_HP_UP_BY_CURE, chickenSettings.STATUS_LOVE_UP_BY_CURE,max_hp);

                // 골드 차감
                await gameUtil.updateUserGold(conn, user_code, -chickenSettings.POINT_CURE, 0, chickenSettings.POINT_CURE);

                await conn.commit();

                // 골드 사용내역
                await gameUtil.addPointHistory(conn, user_code, 0, -chickenSettings.POINT_CURE,0, settings.POINT_TYPE_USE);


                chick_data = await chickenUtil.getSelChickenInfo(conn, user_code, chicken_code);


                returnValues['value'] = {
                    chick_data : chick_data,
                    remain_gold: userPoint.gold - chickenSettings.POINT_CURE,
                    recovery_love: chickenSettings.STATUS_HP_UP_BY_CURE,
                    recovery_hp: chickenSettings.STATUS_LOVE_UP_BY_CURE
                };
                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


/*
*
*  닭 진화 시키키
* */
router.post('/chicken/upgrade/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;
    let chicken_code = req.body.chicken_code;
    if (!session_key || !chicken_code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);

                // 내 연구 상태
                let devGrade = await devUtil.getMyDevelopmentList(conn, user_code, devSetting.DEV_TYPE_GRADE);

                // 선택된 닭 정보
                let chicken = await chickenUtil.getSelChickenInfo(conn, user_code, chicken_code);


                let upgrade_time_check = await chickenUtil.getIsUpgrade(conn, user_code, chicken_code);
                if(upgrade_time_check == 0)throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "진화 시간이 모자랍니다.", 500);

                if(chicken.grade !== chickenSettings.GRADE_NONE) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "이미 진화된 닭 입니다.", 500);
                if(chicken.hp <= 0) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "체력이 0 이하인 닭 입니다.", 500);

                let aliveTime = moment.duration(chicken.current - chicken.gendate).asMinutes();
                let gradeUpPercent = devGrade.level * devSetting.DEV_INC_PER_GRADE;

                // 등급 한단계 업 유무
                //let isSuccess = chickenUtil.isUpgradeSuccess(gradeUpPercent);

                // 등급 계산

                let grade_expectation = chickenUtil.calcChickenGradeScore(chicken.hp, chicken.lovely, chicken.play_count,chicken.food_count,chicken.clean_count);
                let grade = chickenUtil.getGrade(grade_expectation,gradeUpPercent);




                // 해당 등급의 닭 종류
                // let chickenType = await chickenUtil.getRandomChickenType(conn, grade);
                let chickenType = 1;
                let sum_food_count = chicken.food_1+chicken.food_2+chicken.food_3+chicken.food_4+chicken.food_5;

                let index = rand.int(1, sum_food_count);

                let tmp_type = "a";


                if(index <= chicken.food_1)
                {
                    chickenType = 1;
                    tmp_type = "a";
                }else if(index <=(chicken.food_1+chicken.food_2)){
                    chickenType = 2;
                    tmp_type = "b";
                }else if(index <=(chicken.food_1+chicken.food_2+chicken.food_3)) {
                    chickenType = 3;
                    tmp_type = "c";
                }else if(index <=(chicken.food_1+chicken.food_2+chicken.food_3+chicken.food_4)) {
                    chickenType = 4;
                    tmp_type = "d";
                }else if(index <=(chicken.food_1+chicken.food_2+chicken.food_3+chicken.food_4+chicken.food_5)) {
                    chickenType = 5;
                    tmp_type = "e";
                }else{
                    chickenType = 1;
                }

                // 내 닭테이블 닭 종류, 변경
                await chickenUtil.updateMyChickenGradeAndType(conn, user_code, chicken_code, chickenType, grade);

                switch(grade)
                {
                    case 1:
                        await gameUtil.ChickenCountIncrease(conn,user_code,"a",tmp_type);
                        await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_A_RANK_CHICKEN);
                        await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_A_RANK_CHICKEN);
                        break;
                    case 2:
                        await gameUtil.ChickenCountIncrease(conn,user_code,"b",tmp_type);
                        await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_B_RANK_CHICKEN);
                        await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_B_RANK_CHICKEN);
                        break;
                    case 3:
                        await gameUtil.ChickenCountIncrease(conn,user_code,"c",tmp_type);
                        await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_C_RANK_CHICKEN);
                        await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_C_RANK_CHICKEN);
                        break;
                    case 4:
                        await gameUtil.ChickenCountIncrease(conn,user_code,"d",tmp_type);
                        await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_D_RANK_CHICKEN);
                        await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_D_RANK_CHICKEN);
                        break;
                    case 5:
                        await gameUtil.ChickenCountIncrease(conn,user_code,"f",tmp_type);
                        await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_F_RANK_CHICKEN);
                        await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_F_RANK_CHICKEN);
                        break;
                }


                chicken = await chickenUtil.getSelChickenInfo(conn, user_code, chicken_code);

                let max_hp = 100;
                if (chicken.grade == 0) {
                    max_hp = chickenSettings.CHICKEN_HP_CODE0;
                } else {
                    if (chicken.chicken_code == 1) {
                        max_hp = chickenSettings.CHICKEN_HP_CODE1;
                    } else if (chicken.chicken_code == 2) {
                        max_hp = chickenSettings.CHICKEN_HP_CODE2;
                    } else if (chicken.chicken_code == 3) {
                        max_hp = chickenSettings.CHICKEN_HP_CODE3;
                    } else if (chicken.chicken_code == 4) {
                        max_hp = chickenSettings.CHICKEN_HP_CODE4;
                    } else if (chicken.chicken_code == 5) {
                        max_hp = chickenSettings.CHICKEN_HP_CODE5;
                    }
                }

                await chickenUtil.increaseChickenStatus(conn, user_code, max_hp, 100, chicken.idx, max_hp);
                await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_CHICKEN_UPGRADE_COUNT);
                await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_CHICKEN_UPGRADE_COUNT);


                let missions = await gameUtil.getMyMissionInfo(conn, user_code);
                let upgrade_count = missions.a_type_a_rank_chicken +missions.b_type_a_rank_chicken +missions.c_type_a_rank_chicken +missions.d_type_a_rank_chicken +missions.e_type_a_rank_chicken +
                    missions.a_type_b_rank_chicken +missions.b_type_b_rank_chicken +missions.c_type_b_rank_chicken +missions.d_type_b_rank_chicken +missions.e_type_b_rank_chicken +
                    missions.a_type_c_rank_chicken +missions.b_type_c_rank_chicken +missions.c_type_c_rank_chicken +missions.d_type_c_rank_chicken +missions.e_type_c_rank_chicken +
                    missions.a_type_d_rank_chicken +missions.b_type_d_rank_chicken +missions.c_type_d_rank_chicken +missions.d_type_d_rank_chicken +missions.e_type_d_rank_chicken +
                    missions.a_type_f_rank_chicken +missions.b_type_f_rank_chicken +missions.c_type_f_rank_chicken +missions.d_type_f_rank_chicken +missions.e_type_f_rank_chicken;

                let a_upgrade_count = missions.a_type_a_rank_chicken +missions.b_type_a_rank_chicken +missions.c_type_a_rank_chicken +missions.d_type_a_rank_chicken +missions.e_type_a_rank_chicken;


                returnValues['value'] = {
                    grade: grade,
                    name: chicken.name,
                    test : index+" "+sum_food_count+" "+chickenType,
                    upgrade_count : upgrade_count,
                    a_upgrade_count : a_upgrade_count

                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


/*
*
*  내 닭 중에서 업체에게 판매 가능한 닭 리스트
* */
router.get('/my/chicken/:session_key/sell/company/:company_code', (req, res, next) => {
    let session_key = req.params.session_key;
    let company_code = req.params.company_code;

    if (!session_key || !company_code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);
                // 판매 가능한 닭 목록, 양호 또는 아픔
                let chickens = await  chickenUtil.getMyChickenListForSell(conn, user_code);
                // 업체
                let company = await gameUtil.getSelCompanyInfo(conn, company_code);

                let list = _.filter(chickens, chicken => chicken.grade <= company.min_grade);

                returnValues['value'] = {
                    list: list
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


/*
*  계란 판매 / 알  달걀
* */
router.post('/my/egg/sell', (req, res, next) => {
    let session_key = req.body.session_key;
    let egg_type = req.body.egg_type;
    let egg_count = req.body.egg_count;

    if (!session_key || !egg_type || !egg_count) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    egg_type = Number(egg_type);
    egg_count = Number(egg_count);

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);

                // 내 알 상태
                let eggs = await userUtil.getMyEgg(conn, user_code);

                conn.beginTransaction();

                // 알 보유량 확인
                if(egg_type === chickenSettings.EGG_NORMAL && eggs.normalegg < egg_count) throw new CMError(statusCodes.CODE_ERR_NOT_ENOUGH_EGG, '알 보유량 부족', 500);
                if(egg_type === chickenSettings.EGG_GOLD && eggs.goldegg < egg_count) throw new CMError(statusCodes.CODE_ERR_NOT_ENOUGH_EGG, '알 보유량 부족', 500);

                // 판매 금액
                let sellGold = egg_type === chickenSettings.EGG_NORMAL ? egg_count * chickenSettings.POINT_PER_EGG : egg_count * chickenSettings.POINT_PER_GOLD_EGG;


                // 사용자 골드량 증가
                await gameUtil.updateUserGold(conn, user_code, sellGold, sellGold, 0);

                // 계란 갯수 차감
                if(egg_type === chickenSettings.EGG_NORMAL ) {
                    await chickenUtil.updateNormalEggCount(conn, user_code, -egg_count);
                    eggs.normalegg = eggs.normalegg - egg_count;
                } else {
                    await chickenUtil.updateGoldEggCount(conn, user_code, -egg_count);
                    eggs.goldegg = eggs.goldegg - egg_count;
                }

                await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_EGG_SELL_COUNT);
                await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_EGG_SELL_COUNT);
                await gameUtil.EggSellCountIncrease(conn,user_code);

                // 골드 획득내역
                await gameUtil.addPointHistory(conn, user_code, 0, sellGold,0, settings.POINT_TYPE_SELL);

                conn.commit();

                let missions = await gameUtil.getMyMissionInfo(conn, user_code);

                returnValues['value'] = {
                    egg_sell_count : missions.egg_sell_count,
                    acquire_gold: sellGold,
                    ...eggs
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});



/*
* 내 연구 정보 불러오기
* */
router.get('/my/development/:session_key', (req, res, next) => {

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                // 건물 정보
                let developments = await userUtil.getMyDevelopmentsInfo(conn, user_code);

                returnValues["value"] = {
                    list : developments
                };
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});

/*
* 장터 목록 불러오기
* */
router.get('/marketlist', (req, res, next) => {
    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {

            try {
                connection = conn;
                let market_list = await userUtil.getMarketInfo(conn);
1
                returnValues['value'] = {
                    list: market_list
                };

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});

/*
*
*  닭 이름 바꾸기
* */
router.post('/chicken/rename/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;
    let chicken_code = req.body.chicken_code;
    let chicken_name = req.body.name;

    if (!session_key || !chicken_code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                await chickenUtil.changeChickenName(conn, user_code,chicken_code,chicken_name);

                returnValues['value'] = {
                    chicken_code: chicken_code,
                    name: chicken_name
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


/*
 *  장터에 닭 팔기 판매
 */

router.post('/market/sell/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let chickens = req.body.chickens;

    if (!session_key || !chickens) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    chickens = JSON.parse(chickens);

    if (!chickens.list) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "list not contained.", 400))
        return;
    }


    if (!(chickens.list instanceof Array)) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "chickens is must be Array.", 400))
        return;
    }

    chickens = chickens.list;

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {

            try {

                connection = conn;

                let user_code = await sessionUtil.getUserCode(conn, session_key);


                // 포인트 계산
                let point  = await gameUtil.getChickensPrice(conn, chickens);
                await gameUtil.chickenlog(conn, user_code,chickens,settings.REASON_CHICKEN_SELL);


                // 닭 쿼리
                let where = _.map(chickens, n => 'idx=?').join(' OR ');
                let params = [user_code].concat(chickens)

                // 닭이 실제 존재 하는지
                let realCount = await chickenUtil.getCountChickenById(conn, where, params);
                // 닭이 실제 존재 하지 않음
                if (realCount <= 0) throw new CMError(statusCodes.CODE_ERR_NOT_EXIST_CHICKEN, "계약 조건을 확인 하세요.", 500);

                // 포인트 지급
                await gameUtil.updateUserPoint(conn, user_code, point, point, 0);

                // 포인트 내역에 포인트, 골드 환수금 남김
                await gameUtil.addPointHistory(conn, user_code, point, 0,0, settings.POINT_TYPE_SELL);

                // 닭 삭제
                await chickenUtil.deleteMyChickenListForSell(conn, where, params);
                await gameUtil.missionupdate(conn,user_code,chickens.length,settings.MISSION_SELL_CHICKEN_COUNT);
                await gameUtil.missionupdate2(conn,user_code,chickens.length,settings.MISSION_SELL_CHICKEN_COUNT);
                await gameUtil.chicken_sell_Increase(conn,user_code,chickens.length);


                let missions = await gameUtil.getMyMissionInfo(conn, user_code);

                returnValues['value'] = {
                    point : point,
                    chicken_sell_count : missions.chicken_sell_count
                };

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});



/*
*      먹이주기 남은 시간 불러오기
* */
router.get('/my/foodtime/:session_key', (req, res, next) => {

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                // 건물 정보
                let foodtime = await chickenUtil.getFoodtime(conn, user_code);

                returnValues["value"] = {
                    foodtime : foodtime
                };
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*      청소하기 남은 시간 불러오기
* */
router.get('/my/cleantime/:session_key', (req, res, next) => {

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                // 건물 정보
                let cleantime = await chickenUtil.getCleantime(conn, user_code);

                returnValues["value"] = {
                    cleantime : cleantime
                };
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});





/*
*
*  닭 병 걸림
* */
router.post('/chicken/sick/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;
    let chicken_code = req.body.chicken_code;

    if (!session_key || !chicken_code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let buildingInfo = await userUtil.getMyBuildingInfo(conn, user_code);

                let SICK_PERCENT = buildingInfo.dirty * chickenSettings.DEFAULT_SICK_PERCENT;
                let rslt_sick = await chickenUtil.getlassickdate(conn, user_code, chicken_code);
                //병걸림

                let index = rand.int(0, 100) + 1;
                let sick_check = 0;

                if (rslt_sick != 0)
                {
                    if (SICK_PERCENT > index) {
                        await chickenUtil.setchickensick(conn, user_code, chicken_code, 2);
                        sick_check = 1;
                    } else {
                        await chickenUtil.setchickensick(conn, user_code, chicken_code, 1);
                    }
                }

                let chick_data = await chickenUtil.getSelChickenInfo(conn, user_code, chicken_code)

                returnValues['value'] = {
                    chick_data: chick_data,
                    index : index,
                    SICK_PERCENT : SICK_PERCENT,
                    dirty : buildingInfo.dirty
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});



/*
*      미션 가져오기
* */
router.get('/my/mission/:session_key', (req, res, next) => {

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let list = await gameUtil.getMission(conn, user_code);

                //       select a.mission_code,a.mission_content,a.reward_type,a.reward_count,a.mission_order,a.mission_type,IF(b.idx is NULL,-1, IF(mission_type=3,1,IF(mission_type=2,IF(gendate<DATE_ADD(now(),INTERVAL -7 day),-1,1),IF(gendate<DATE_ADD(now(),INTERVAL -1 day),-1,1)))) as idx ,b.gendate from tb_mission as a LEFT OUTER JOIN (select * from tb_mission_user where user_code = 13) as b ON a.mission_code = b.mission_code;
                //       idx가 -1이면 미션 가능.  조건 추가 필요. ( 닭 판매 갯수. 등등)

                returnValues["value"] = {
                    list : list

                };
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});




/*
*      도감 가져오기
* */
router.get('/dictionary/:session_key', (req, res, next) => {

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let list = await gameUtil.getDictionary(conn, user_code)


                returnValues["value"] = {
                    list : list
                };
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});



/*
*      미션 정보 가져오기
* */
router.get('/mission/info/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {
                let user_code = await sessionUtil.getUserCode(conn, session_key);


                let list = await gameUtil.getMyMissionInfo(conn,user_code);
                let weekly = await gameUtil.getMyWeeklyInfo(conn,user_code);
                let daily = await gameUtil.getMyDailyInfo(conn,user_code);


                returnValues['value'] = {
                    list : list,
                    weekly : weekly,
                    daily : daily

                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })









});





/*
*      미션 완수
* */
router.post('/mission/clear/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;
    let mission_code = req.body.mission_code;

    if (!session_key || !mission_code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let checks = await gameUtil.checkMission(conn, user_code,mission_code);
                if (checks == 0) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "미션을 이미 완료하였습니다.", 500);

                let mission_data = await gameUtil.getMissionInfo(conn, mission_code);

                /////////////////////////////
                // 미션 조건 확인 //
                let mission_check = false;
                let mission_count = 0;
                let building;
                if(mission_data.mission_play_type == 0) {
                    mission_check = true;
                    if(mission_data.mission_code == 1) {
                        await gameUtil.missionupdate(conn, user_code, 1, settings.MISSION_WEEKLY_CHECK);
                        await gameUtil.missionupdate2(conn, user_code, 1, settings.MISSION_WEEKLY_CHECK);
                    }
                }else{
                    if (mission_data.mission_type == 2) {
                        let list = await gameUtil.getMyMissionInfo(conn, user_code);
                        switch(mission_data.mission_play_type)
                        {
                            case settings.MISSION_ACHIEVEMENTS_FOOD :
                                if(mission_data.mission_count <= list.food_count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_EGG_SELL :
                                if(mission_data.mission_count <= list.egg_sell_count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_PLANT :
                                if(mission_data.mission_count <= list.plant_count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_BUG :
                                if(mission_data.mission_count <= list.bug_count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_CLEAN :
                                if(mission_data.mission_count <= list.play_count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_PLAY :
                                if(mission_data.mission_count <= list.play_count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_CLOUD :
                                if(mission_data.mission_count <= list.cloud_shower_count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_CHICKEN_SELL :
                                if(mission_data.mission_count <= list.chicken_sell_count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_CONTRACT_COMPLETE :
                                if(mission_data.mission_count <= list.contract_complete_count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_CONTRACT_START    :
                                if(mission_data.mission_count <= list.contract_start_count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_HOUSE_LV    :
                                building = await userUtil.getMyBuildingInfo(conn, user_code);
                                if(mission_data.mission_count <= building.home)
                                {
                                    mission_check = true;
                                }

                                break;
                            case settings.MISSION_ACHIEVEMENTS_CHICK_COOP_LV    :
                                building = await userUtil.getMyBuildingInfo(conn, user_code);
                                if(mission_data.mission_count <= building.chicken)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_WARE_LV    :
                                building = await userUtil.getMyBuildingInfo(conn, user_code);
                                if(mission_data.mission_count <= building.ware)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_ARANK    :
                                if(mission_data.mission_count <= (list.a_type_a_rank_chicken+list.b_type_a_rank_chicken+list.c_type_a_rank_chicken+list.d_type_a_rank_chicken+list.e_type_a_rank_chicken))
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_BRANK    :
                                if(mission_data.mission_count <= (list.a_type_b_rank_chicken+list.b_type_b_rank_chicken+list.c_type_b_rank_chicken+list.d_type_b_rank_chicken+list.e_type_b_rank_chicken))
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_CRANK    :
                                if(mission_data.mission_count <= (list.a_type_c_rank_chicken+list.b_type_c_rank_chicken+list.c_type_c_rank_chicken+list.d_type_c_rank_chicken+list.e_type_c_rank_chicken))
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_DRANK    :
                                if(mission_data.mission_count <= (list.a_type_d_rank_chicken+list.b_type_d_rank_chicken+list.c_type_d_rank_chicken+list.d_type_d_rank_chicken+list.e_type_d_rank_chicken))
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_FRANK    :
                                if(mission_data.mission_count <= (list.a_type_f_rank_chicken+list.b_type_f_rank_chicken+list.c_type_f_rank_chicken+list.d_type_f_rank_chicken+list.e_type_f_rank_chicken))
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_ATYPE    :
                                if(mission_data.mission_count <= (list.a_type_a_rank_chicken+list.a_type_b_rank_chicken+list.a_type_c_rank_chicken+list.a_type_d_rank_chicken+list.a_type_f_rank_chicken))
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_BTYPE    :
                                if(mission_data.mission_count <= (list.b_type_a_rank_chicken+list.b_type_b_rank_chicken+list.b_type_c_rank_chicken+list.b_type_d_rank_chicken+list.b_type_f_rank_chicken))
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_CTYPE    :
                                if(mission_data.mission_count <= (list.c_type_a_rank_chicken+list.c_type_b_rank_chicken+list.c_type_c_rank_chicken+list.c_type_d_rank_chicken+list.c_type_f_rank_chicken))
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_DTYPE    :
                                if(mission_data.mission_count <= (list.d_type_a_rank_chicken+list.d_type_b_rank_chicken+list.d_type_c_rank_chicken+list.d_type_d_rank_chicken+list.d_type_f_rank_chicken))
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_ACHIEVEMENTS_ETYPE    :
                                if(mission_data.mission_count <= (list.e_type_a_rank_chicken+list.e_type_b_rank_chicken+list.e_type_c_rank_chicken+list.e_type_d_rank_chicken+list.e_type_f_rank_chicken))
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_FIVE_TYPE_ARANK    :
                                if(list.a_type_a_rank_chicken>0&& list.b_type_a_rank_chicken>0&&list.c_type_a_rank_chicken>0&&list.d_type_a_rank_chicken>0&&list.e_type_a_rank_chicken>0)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_FIVE_TYPE_BRANK    :
                                if(list.a_type_b_rank_chicken>0&& list.b_type_b_rank_chicken>0&&list.c_type_b_rank_chicken>0&&list.d_type_b_rank_chicken>0&&list.e_type_b_rank_chicken>0)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_FIVE_TYPE_CRANK    :
                                if(list.a_type_c_rank_chicken>0&& list.b_type_c_rank_chicken>0&&list.c_type_c_rank_chicken>0&&list.d_type_c_rank_chicken>0&&list.e_type_c_rank_chicken>0)                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_FIVE_TYPE_DRANK    :
                                if(list.a_type_d_rank_chicken>0&& list.b_type_d_rank_chicken>0&&list.c_type_d_rank_chicken>0&&list.d_type_d_rank_chicken>0&&list.e_type_d_rank_chicken>0)                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_FIVE_TYPE_FRANK    :
                                if(list.a_type_f_rank_chicken>0&& list.b_type_f_rank_chicken>0&&list.c_type_f_rank_chicken>0&&list.d_type_f_rank_chicken>0&&list.e_type_f_rank_chicken>0)                                {
                                    mission_check = true;
                                }
                                break;


                        }

                    } else if (mission_data.mission_type == 1) {

                        mission_count = await gameUtil.getMyWeeklyTypeInfo(conn, user_code,mission_data.mission_play_type)
                        if(mission_data.mission_count <= mission_count)
                        {
                            mission_check = true;
                        }

                        /*
                        let weekly = await gameUtil.getMyWeeklyInfo(conn, user_code);

                        switch(mission_data.mission_play_type)
                        {
                            case settings.MISSION_FOOD_COUNT: // 먹이주기

                                break;
                            case settings.MISSION_EGG_SELL_COUNT: // 계란판매

                                break;
                            case settings.MISSION_PLANT_COUNT: // 잡초뽑기

                                break;
                            case settings.MISSION_BUG_COUNT: // 벌래잡기

                                break;
                            case settings.MISSION_CLEAN_COUNT: // 청소하기

                                break;
                            case settings.MISSION_PLAY_COUNT: // 놀아주기

                                break;
                            case settings.MISSION_GOLDEN_EGG_COUNT: // 황금알 까기

                                break;
                            case settings.MISSION_SELL_CHICKEN_COUNT: // 닭 판매(납품)

                                break;
                            case settings.MISSION_CHICKEN_UPGRADE_COUNT: // 닭 진화 해보기

                                break;
                            case settings.MISSION_SHOP_COUNT: // 충전소 이용 해보기

                                break;
                            case settings.MISSION_WEEKLY_CHECK: // 개근

                                break;
                        }
*/
                    } else {
                        mission_count = await gameUtil.getMyDailyTypeInfo(conn, user_code,mission_data.mission_play_type)
                        if(mission_data.mission_count <= mission_count)
                        {
                            mission_check = true;
                        }

                        /*
                        switch(mission_data.mission_play_type)
                        {
                            case settings.MISSION_FOOD_COUNT: // 먹이주기
                                mission_count = await gameUtil.getMyDailyTypeInfo(conn, user_code,settings.MISSION_FOOD_COUNT)

                                if(mission_data.mission_count <= count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_EGG_SELL_COUNT: // 계란판매
                                mission_count = await gameUtil.getMyDailyTypeInfo(conn, user_code,settings.MISSION_EGG_SELL_COUNT)

                                if(mission_data.mission_count <= count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_PLANT_COUNT: // 잡초뽑기
                                mission_count = await gameUtil.getMyDailyTypeInfo(conn, user_code,settings.MISSION_PLANT_COUNT)

                                if(mission_data.mission_count <= count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_BUG_COUNT: // 벌래잡기
                                mission_count = await gameUtil.getMyDailyTypeInfo(conn, user_code,settings.MISSION_BUG_COUNT)

                                if(mission_data.mission_count <= count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_CLEAN_COUNT: // 청소하기

                            case settings.MISSION_PLAY_COUNT: // 놀아주기
                                mission_count = await gameUtil.getMyDailyTypeInfo(conn, user_code,settings.MISSION_CLOUD_SHOWER_COUNT)

                                if(mission_data.mission_count <= count)
                                {
                                    mission_check = true;
                                }
                                break;
                            case settings.MISSION_CLOUD_SHOWER_COUNT: // 먹구름 터치하여 소나기내리기
                                mission_count = await gameUtil.getMyDailyTypeInfo(conn, user_code,settings.MISSION_CLOUD_SHOWER_COUNT)

                                if(mission_data.mission_count <= count)
                                {
                                    mission_check = true;
                                }

                                break;
                        }
                        */

                    }
                }



                if(!mission_check) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "미션 조건을 완수하지 못하였습니다.", 500);

                ///////////////////////////////

                if(mission_data.reward_type == 1)
                {
                    // 사용자 포인트량 증가
                    await gameUtil.updateUserPoint(conn, user_code, mission_data.reward_count, mission_data.reward_count, 0);
                    await gameUtil.addPointHistory(conn,user_code,mission_data.reward_count,0,0,settings.POINT_TYPE_MISSION);
                }else if(mission_data.reward_type == 2)
                {
                    // 티켓 증가
                    await gameUtil.updateUserTicket(conn, user_code, 1, 1, 0);
                    await gameUtil.addPointHistory(conn,user_code,0,0,1,settings.POINT_TYPE_MISSION);
                }else{
                    // 사용자 골드량 증가
                    await gameUtil.updateUserGold(conn, user_code, mission_data.reward_count, mission_data.reward_count, 0);
                    await gameUtil.addPointHistory(conn,user_code,0,mission_data.reward_count,0,settings.POINT_TYPE_MISSION);
                }

                //미션 완료 등록
                await gameUtil.missionComplete(conn, user_code, mission_code);


                returnValues['value'] = {
                    reward_type : mission_data.reward_type,
                    reward_count : mission_data.reward_count
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })









});




/*
*      튜토리얼 놀아준 시간 변경
* */
router.get('/tutorial/enjoy/:session_key', (req, res, next) => {


    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };


    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                await chickenUtil.settutorialenjoy(conn, user_code);

                returnValues["value"] = {
                    rslt : "ok"
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});




/*
*      튜토리얼 병 걸리게 변경
* */
router.get('/tutorial/sick/:session_key', (req, res, next) => {



    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                await chickenUtil.settutorialsick(conn, user_code);

                returnValues["value"] = {
                    rslt : "ok"
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});



/*
*      튜토리얼 진화 가능하게 변경
* */
router.get('/tutorial/upgrade/:session_key', (req, res, next) => {



    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                await chickenUtil.settutorialupgrade(conn, user_code);

                returnValues["value"] = {
                    rslt : "ok"
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});




/*
*      튜토리얼 알 지급
* */
router.get('/tutorial/egg/:session_key', (req, res, next) => {



    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                await chickenUtil.settutorialegg(conn, user_code);

                returnValues["value"] = {
                    rslt : "ok"
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});




/*
*      벌레잡을시  골드획득
* */
router.get('/bug/get/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);


                let golds = rand.int(1, 5);

                await gameUtil.updateUserGold(conn, user_code, golds, golds, 0);


                // 골드 획득내역
                await gameUtil.addPointHistory(conn, user_code, 0, golds,0, settings.POINT_TYPE_BUG);
                await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_BUG_COUNT);
                await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_BUG_COUNT);
                await gameUtil.BugCountIncrease(conn,user_code);

                let missions = await gameUtil.getMyMissionInfo(conn, user_code);

                returnValues["value"] = {
                    gold : golds,
                    bug_count : missions.bug_count
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});





/*
*   황금알   골드에그 깔경우 획득
* */
router.get('/goldenegg/get/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let type = 0;
                let lange = 0;
                let money = 0;

                let index = rand.int(1, 1000);

                if(index < 300) // 작은 금
                {
                    lange = 1;
                    index = rand.int(10, 100);
                    money = index;
                    await gameUtil.updateUserGold(conn, user_code, index, index, 0);
                    await gameUtil.addPointHistory(conn, user_code, 0, index,0, settings.POINT_TYPE_GOLD_EGG);
                }else if(index<500) // 중간금
                {
                    lange = 2;
                    index = rand.int(100, 500);
                    money = index;
                    await gameUtil.updateUserGold(conn, user_code, index, index, 0);
                    await gameUtil.addPointHistory(conn, user_code, 0, index,0, settings.POINT_TYPE_GOLD_EGG);
                }else if(index<550)
                {

                    lange = 3;

                    let rand_count = rand.int(1, 100);
                    if(rand_count < 3 )
                    {
                        index = rand.int(2000, 10000);
                    }else if( rand_count < 10 ){
                        index = rand.int(1000, 2000);
                    }else{
                        index = rand.int(500, 1000);
                    }


                    money = index;
                    await gameUtil.updateUserGold(conn, user_code, index, index, 0);
                    await gameUtil.addPointHistory(conn, user_code, 0, index,0, settings.POINT_TYPE_GOLD_EGG);
                }else{  // 포인트
                    type = 1;

                    let rand_count = rand.int(1, 10000);
                    if(rand_count <7700)
                    {
                        lange = 4;
                        index = rand.int(10, 20);
                    }else if(rand_count < 8900)
                    {
                        lange = 4;
                        index = rand.int(20, 50);
                    }else if(rand_count < 9500)
                    {
                        lange = 4;
                        index = rand.int(50, 100);
                    }else if(rand_count < 9700)
                    {
                        lange = 4;
                        index = rand.int(100, 300);
                    }else if(rand_count < 9800)
                    {
                        lange = 5;
                        index = rand.int(300, 500);
                    }else if(rand_count < 9850)
                    {
                        lange = 5;
                        index = rand.int(500, 1000);
                    }else if(rand_count < 9880)
                    {
                        lange = 5;
                        index = rand.int(1000, 2000);
                    }else if(rand_count < 9900)
                    {
                        lange = 5;
                        index = rand.int(2000, 3000);
                    }else if(rand_count < 9910)
                    {
                        lange = 5;
                        index = rand.int(3000, 5000);
                    }else if(rand_count < 9915)
                    {
                        lange = 6;
                        index = rand.int(5000, 10000);
                    }else if(rand_count < 9917)
                    {
                        lange = 6;
                        index = rand.int(10000, 30000);
                    }else if(rand_count < 9918){
                        lange = 6;
                        index = rand.int(30000, 50000);
                    }else{
                        lange = 4;
                        index = rand.int(10, 20);
                    }



                    // let rand_count = rand.int(1, 100);
                    // if(rand_count < 3 )
                    // {
                    //     index = rand.int(5000, 50000);
                    // }else if( rand_count < 8 ){
                    //     index = rand.int(5000, 30000);
                    // }else if ( rand_count < 30 ){
                    //     index = rand.int(5000, 20000);
                    // }else if ( rand_count < 60 ){
                    //     type = 1;
                    //     lange = 5;
                    //     index = rand.int(2000, 5000);
                    //
                    // }else{
                    //     type = 1;
                    //     lange = 5;
                    //     index = rand.int(1000, 2000);
                    //
                    // }



                    money = index;
                    await gameUtil.updateUserPoint(conn, user_code, index, index, 0);
                    await gameUtil.addPointHistory(conn, user_code, index, 0,0, settings.POINT_TYPE_GOLD_EGG);
                }



                let missions = await gameUtil.getMyMissionInfo(conn, user_code);

                returnValues["value"] = {
                    type : type,
                    money : money,
                    lange : lange,
                    golden_egg_count : missions.golden_egg_count
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});





/*
*      잡초제거 골드박스 나오는 유무
* */
router.get('/goldenbox/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let index = rand.int(1, 100);
                let type = 0;
                if(index < 10)
                {
                    type = 1;
                    await gameUtil.golden_box_log(conn, user_code)
                    await gameUtil.GoldenBoxCountIncrease(conn, user_code)
                }
                await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_PLANT_COUNT);
                await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_PLANT_COUNT);
                await gameUtil.PlantCountIncrease(conn,user_code);

                let missions = await gameUtil.getMyMissionInfo(conn, user_code);

                returnValues["value"] = {
                    type : type,    // 0 : 못찾음    1 : 박스 찾음
                    plant_count : missions.plant_count,
                    golden_box_count : missions.golden_box_count
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});





/*
*      티켓사용 룰렛 돌리기
* */
router.get('/rulet/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let ticket = await gameUtil.rulet_check(conn, user_code);

                let type = 0;
                let point = 0;
                let rulet = rand.int(1, 1000);
                if(rulet>600)
                {
                    type = 1;
                    point = 1000;
                }else if(rulet>300)
                {
                    type = 2;
                    point = 200;
                }else if(rulet>200)
                {
                    type = 3;
                    point = 2000;
                }else if(rulet>100)
                {
                    type = 4;
                    point = 400;
                }else if(rulet>50)
                {
                    type = 5;
                    point = 4000;
                }else if(rulet>15)
                {
                    type = 6;
                    point = 1000;
                }else if(rulet>5)
                {
                    type = 7;
                    point = 10000;
                }else{
                    type = 8;
                    point = 30000;
                }
                await gameUtil.updateUserTicket(conn, user_code, -1, 0,1, settings.POINT_TYPE_USE);
                if(type%2 == 1)
                {
                    await gameUtil.updateUserGold(conn, user_code, point, point,0, settings.POINT_TYPE_RULET_GET);
                    await gameUtil.addPointHistory(conn, user_code, 0, point,0, settings.POINT_TYPE_RULET_GET);
                }else{
                    await gameUtil.updateUserPoint(conn, user_code, point, point,0, settings.POINT_TYPE_RULET_GET);
                    await gameUtil.addPointHistory(conn, user_code,  point,0,0, settings.POINT_TYPE_RULET_GET);
                }

                await gameUtil.RuletCountIncrease(conn,user_code);


                returnValues["value"] = {
                    ticket : ticket,
                    type : type,
                    point : point
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});



/*
*      알 개수 저장
* */
router.post('/egg_save/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let count = req.body.count;


    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                await gameUtil.setEgg(conn, user_code, count);
                await chickenUtil.updateLastEggDateAll(conn, user_code);


                returnValues["value"] = {
                    count : count
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});



// 황금알 획득
router.post('/get/golden_egg/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {


                let user_code = await sessionUtil.getUserCode(conn, session_key);

                await chickenUtil.addEggHistory(conn, user_code, 1, 1);
                await chickenUtil.updateGoldEggCount(conn, user_code, 1);
                await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_GOLDEN_EGG_COUNT);
                await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_GOLDEN_EGG_COUNT);
                await gameUtil.GoldenEggCountIncrease(conn,user_code);
                let eggs = await userUtil.getMyEgg(conn, user_code);

                returnValues['value'] = {
                    ...eggs
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});







/*
*      환전소 정보 가져오기
* */
router.get('/exchange/info/:session_key', (req, res, next) => {

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let list = await gameUtil.getExchangeInfo(conn);

                returnValues["value"] = {
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});


/*
*      환전하기
* */
router.post('/exchange/point/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let point = req.body.point;


    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);


                let userPoint = await userUtil.getPointInfo(conn, user_code);
                // 보유한 포인트 확인
                if (userPoint.point < point) throw new CMError(statusCodes.CODE_ERR_NOT_ENOUGH_GOLD, "포인트 부족", 400);


                let exchange_gold = await gameUtil.getExchangeGold(conn, point);

                await gameUtil.updateUserGold(conn, user_code, exchange_gold, exchange_gold, 0);
                await gameUtil.updateUserPoint(conn, user_code, -point, 0, point);
                await gameUtil.addPointHistory(conn, user_code, -point, 0,0, settings.POINT_TYPE_EXCHANGE);


                returnValues["value"] = {

                    exchange_gold : exchange_gold

                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});







// 회원 탈퇴
router.get('/signoff/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);


                await userUtil.signout(conn, user_code);

                returnValues['value'] = {
                    rslt : "signoff"
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});






// 닭 말하기
router.get('/chicken_talk/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let talk = await gameUtil.gettalk(conn);

                returnValues['value'] = {
                    talk : talk
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});




// 버전체크
router.get('/version', (req, res, next) => {

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {
                let version = await gameUtil.getversion(conn);

                returnValues['value'] = {
                    version : version
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});




// 소나기 횟수 증가
router.get('/cloud_shower/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_CLOUD_SHOWER_COUNT);
                await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_CLOUD_SHOWER_COUNT);
                await gameUtil.CloudShowerCountIncrease(conn,user_code);

                let missions = await gameUtil.getMyMissionInfo(conn, user_code);



                returnValues['value'] = {
                    cloud_shower_count:missions.cloud_shower_count
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});




// 추천가능 확인
router.get('/referrer_count/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let count = await userUtil.getreferrercount(conn, user_code);

                returnValues['value'] = {
                    count: count
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});



/*
*      추천인등록
* */
router.post('/referrer/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let nick = req.body.nick;


    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);


                if(await userUtil.getPushTicket(conn, user_code) == 0) throw new CMError(statusCodes.CODE_ERR_NOT_FOUND_TICKET, "이미 추천을 했습니다.", 400);
                let count = await userUtil.getPushCount(conn, nick);

                if(nick!="티끌모아") {
                    if (count >= 10) throw new CMError(statusCodes.CODE_ERR_NOT_FOUND_NICK, "더이상 추천을 하실 수 없습니다.", 400);
                }

                let push_user_code = await userUtil.getPushusercode(conn, nick);

                if(push_user_code == user_code) throw new CMError(statusCodes.CODE_ERR_MY_NICK, "자신을 추천할 수 없습니다.", 400);


                await userUtil.usepush(conn, user_code);
                await userUtil.setpush(conn, nick);



                await gameUtil.updateUserGold(conn, user_code, settings.POINT_GOLD, settings.POINT_GOLD, 0);
                await gameUtil.addPointHistory(conn, user_code, 0, settings.POINT_GOLD,0, settings.POINT_TYPE_PUSH);

                await gameUtil.updateUserGold(conn, push_user_code, settings.POINT_GOLD, settings.POINT_GOLD, 0);
                await gameUtil.addPointHistory(conn, push_user_code, 0, settings.POINT_GOLD,0, settings.POINT_TYPE_PUSH);

                returnValues["value"] = {
                    rslt : "ok"
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});





// 이벤트 기간 확인
router.get('/event/get/', (req, res, next) => {


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {

                let check = await gameUtil.getEvent(conn);

                returnValues['value'] = {
                    check: check
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});





//  포인트 내역
router.get('/point/list/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let point_use_list = await gameUtil.getpointused(conn, user_code);

                let mypoint = await userUtil.getPointInfo(conn, user_code);

                returnValues['value'] = {
                    list : point_use_list,
                    acc_point : mypoint.acc_point,
                    used_point : mypoint.used_point,
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});





//  공지사항 가져오기
router.get('/notice/', (req, res, next) => {



    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {
                let notices = await gameUtil.getnotice(conn);

                let check = false;
                if(notices!=0)
                {
                    check = notices.notice_check;
                }

                returnValues['value'] = {
                    notice : notices.notice,
                    event_check : notices.event_check,
                    event_date : notices.event_date,
                    event_time : notices.event_time,
                    event_start_time : notices.event_start_time,
                    event_end_time : notices.event_end_time,
                    event_start_hour : notices.event_start_hour,
                    event_end_hour : notices.event_end_hour,
                    now_min : notices.now_min,
                    rain_type : notices.rain_type,
                    check : check
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});




//  치킨상점 목록 가져오기
router.get('/chicken_store/list/', (req, res, next) => {



    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {


                let datas;
                let responses;
                let errors;
                var request=require('request');
                request('https://wapi.gift-n.net/getGoodsInfoList?cid=GFN0583&brand_id=83&enc=18AD84D9A8C2C44FAE8A3FBB3ACF1B07',function(error, response, body){
                    if(!error&&response.statusCode==200) {
                        datas = body;
                        errors = error;
                        responses = response;
                    }else{
                        datas = body;
                        errors = error;
                        responses = response;
                    }
                });


                returnValues['value'] = {
                    test : "test",
                    datas : datas,
                    response : responses,
                    error : errors
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});



//  공지사항 가져오기
router.get('/chickencontrol/', (req, res, next) => {



    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {
                let percent = await gameUtil.getclickpercent(conn);
                returnValues['value'] = {
                    percent : percent
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});



// 유저코드 가져오기
router.get('/getusercode/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                returnValues['value'] = {
                    user_code : user_code
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});




// 광고 요청 증가
router.get('/ad/request/', (req, res, next) => {
    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {
                //let user_code = await sessionUtil.getUserCode(conn, session_key);
                let check = await gameUtil.check_ad_date(conn);
                if(check == 0)
                {
                    await gameUtil.set_ad_date(conn);
                }
                await gameUtil.request_ad_increase(conn);

                returnValues['value'] = {

                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});





// 광고 요청 증가
router.get('/ad/show/', (req, res, next) => {
    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {
                //let user_code = await sessionUtil.getUserCode(conn, session_key);
                let check = await gameUtil.check_ad_date(conn);
                if(check == 0)
                {
                    await gameUtil.set_ad_date(conn);
                }
                await gameUtil.show_ad_increase(conn);

                returnValues['value'] = {

                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


/*
*
* 내 디바이스 정보 입력
* */
router.post('/device/my/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;
    let device = req.body.device;
    let pixcel = req.body.pixcel;

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;

            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);
                await gameUtil.setmyinfo(conn,user_code,pixcel,device);


                returnValues['value'] = {

                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});





// 광고 링크 캐시퍼 클릭수 증가 증가
router.get('/ad/cashper/', (req, res, next) => {
    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {

                //let user_code = await sessionUtil.getUserCode(conn, session_key);
                let check = await gameUtil.check_rink_ad_date(conn);
                if(check == 0)
                {
                    await gameUtil.set_rink_ad_date(conn);
                }
                await gameUtil.request_rink_ad_cashper_increase(conn);

                returnValues['value'] = {

                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});



// 광고 링크 스타일패치 클릭수 증가 증가
router.get('/ad/style_patch/', (req, res, next) => {
    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {
                //let user_code = await sessionUtil.getUserCode(conn, session_key);

                let check = await gameUtil.check_rink_ad_date(conn);
                if(check == 0)
                {
                    await gameUtil.set_rink_ad_date(conn);
                }
                await gameUtil.request_rink_ad_style_patch_increase(conn);

                returnValues['value'] = {

                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


// 출석체크
router.get('/attend/check/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {

              let user_code = await sessionUtil.getUserCode(conn, session_key);
                await gameUtil.set_attend_date_check(conn,user_code);

                returnValues['value'] = {
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});




// 취침 상태 체크
router.get('/sleepmod/state/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let my_sleep_info = await gameUtil.check_sleep(conn,user_code);
                let wake_up = 0;
                let sleep_mode = 0;
                let sleep_time=null;
                let check_date = null;
                if(my_sleep_info!=-1) {
                    sleep_mode = my_sleep_info.mode;
                    sleep_time = my_sleep_info.delay_time;
                    check_date = my_sleep_info.check_date;
                    if (my_sleep_info.check_hour == 1 && my_sleep_info.mode == 1) {
                        //자동 기상
                        wake_up = 1;
                        await gameUtil.set_wake_up(conn, user_code);
                        // 골드 차감
                        await gameUtil.updateUserGold(conn, user_code, settings.MAX_SLEEP_GOLD, settings.MAX_SLEEP_GOLD, 0);
                        // 골드 사용 히스토리
                        await gameUtil.addPointHistory(conn, user_code, 0, settings.MAX_SLEEP_GOLD,0, settings.POINT_TYPE_SLEEP_GOLD);
                    }
                }else{
                    sleep_mode = 0;
                    check_date = 1;
                    my_sleep_info = null;
                }




                returnValues['value'] = {
                    mode : sleep_mode,
                    sleep_time : sleep_time,
                    check_date : check_date,
                    wake_up : wake_up,
                    sleep_gold : settings.MAX_SLEEP_GOLD
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


// 취침모드
router.get('/sleepmod/sleep/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let my_sleep_info = await gameUtil.check_sleep(conn,user_code);

                if(my_sleep_info==-1)
                {
                    await gameUtil.set_sleep_mode(conn, user_code);
                    await gameUtil.set_sleep_setting(conn, user_code);
                }else {
                    if (my_sleep_info.check_date == 0) {
                        //하루 한번만 가능
                        //throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "하루에 한번만 가능합니다.", 500);
                    }
                    if (my_sleep_info.mode == 1) {
                        //취침모드 진행중
                        throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "이미 취침 진행중 입니다.", 500);
                    }

                    if (my_sleep_info.mode == 0) {
                        //가눙
                        await gameUtil.set_sleep_mode(conn, user_code);
                        await gameUtil.set_sleep_setting(conn, user_code);
                    }
                }


                returnValues['value'] = {
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


// 기상모두
router.get('/sleepmod/wakeup/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let my_sleep_info = await gameUtil.check_sleep(conn,user_code);
                let getgold = 0;

                if(my_sleep_info.mode == 1)
                {
                    await gameUtil.set_wake_up(conn,user_code);
                    await gameUtil.set_wake_sleep_setting(conn,user_code);
                    getgold = await gameUtil.check_sleep_time(conn,user_code);
                    if(getgold<0) {
                        getgold = 0;
                    }
                    if(getgold>18000) {
                        getgold = 18000;
                    }
                    if(getgold!=0) {
                        // 골드 차감
                        await gameUtil.updateUserGold(conn, user_code, getgold, getgold, 0);
                        // 골드 사용 히스토리
                        await gameUtil.addPointHistory(conn, user_code, 0, getgold, 0, settings.POINT_TYPE_SLEEP_GOLD);
                    }

                }else{
                    throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "이미 일어 났습니다.", 500);
                }


                returnValues['value'] = {
                    wake_up : 1,
                    getgold : getgold
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});


// 기상 골드 체크
router.get('/sleepmod/getgold/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let getgold = await gameUtil.check_sleep_time(conn,user_code);
                if(getgold<0) {
                    getgold = 0;
                }
                if(getgold>18000) {
                    getgold = 18000;
                }
                returnValues['value'] = {
                    getgold : getgold
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});





// 리플 확인
router.get('/repl/check/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let repl_state  = await gameUtil.repl_check(conn,user_code);

                returnValues['value'] = {
                    datecheck : repl_state.datecheck,
                    replcheck : repl_state.replcheck
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});




// 리플 세팅
router.get('/repl/set/:session_key', (req, res, next) => {
    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400))
        return;
    }


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_SUCCESS,
        reason: "success"
    };

    pool.getConnection()
        .then(async conn => {
            connection = conn;
            try {

                let user_code = await sessionUtil.getUserCode(conn, session_key);
                await gameUtil.repl_set(conn,user_code);


                returnValues['value'] = {
                };

                res.status(200)
                    .json(returnValues)
                    .end();

            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }
        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        })
});




/*
*      이벤트 선물 주울시
* */
router.get('/event/get/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let rain_type = await gameUtil.geteventtype(conn);
                let points = 0;
                if(rain_type===0) {
                    points = rand.int(50, 150);
                    await gameUtil.updateUserGold(conn, user_code, points, points, 0);
                    // 골드 획득내역
                    await gameUtil.addPointHistory(conn, user_code, 0, points,0, settings.POINT_TYPE_EVENT_CHRISMAS);

                }else if (rain_type===1)
                {
                    points = rand.int(1, 10);
                    await gameUtil.updateUserPoint(conn, user_code, points, points, 0);
                    // 골드 획득내역
                    await gameUtil.addPointHistory(conn, user_code, points, 0,0, settings.POINT_TYPE_EVENT_CHRISMAS);
                }
                returnValues["value"] = {
                    gold : points,
                    rain_type : rain_type
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});


/*
*      광고 순서
* */
router.get('/ad/order/', (req, res, next) => {

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let adorder = await gameUtil.getadorder(conn);

                returnValues["value"] = {
                    adorder : adorder
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});





/*
*      하트 상태 보기
* */
router.get('/heart/check/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;

                //throw new CMError(statusCodes.CODE_ERR_HEART, "더이상 시간이지나도 하트 충전 안됨", 400);

                returnValues["value"] = {

                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});



/*
*      하트 사용
* */
router.get('/heart/use/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let userPoint = await userUtil.getPointInfo(conn, user_code);
                let heart_count = userPoint.heart;
                let max_setting_check = 0;
                if(heart_count <= 0) throw new CMError(statusCodes.CODE_ERR_TOWN_HEART_NOT_COUNT, "하트가 부족합니다.", 500);
                //
                // if(heart_count >= settings.MAX_HEART_COUNT)
                // {
                //     max_setting_check = 1;
                //     await gameUtil.setlasthearttime(conn,user_code);
                // }

                await gameUtil.updateUserHeart(conn, user_code, -1, 0, 1);
                await gameUtil.addHeartHistory(conn, user_code, -1, settings.HEART_TYPE_MINI_GAME);
                heart_count = heart_count -1;
                let delay_time= await gameUtil.getlasthearttime(conn, user_code);

                returnValues["value"] = {
                    max_setting_check : max_setting_check,
                    heart_count : heart_count,
                    delay_time : delay_time
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});




/*
*      랭킹 등록
* */
router.get('/rank/set/:point/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let point = req.params.point;

    if (!session_key|| !point) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                //let userrankinfo = await gameUtil.getmystoprank(conn, user_code);
                if(point > 700 || point < 600)
                {
                    await gameUtil.setmyrank(conn, user_code, 0);
                }else{
                    await gameUtil.setmyrank(conn, user_code, point);
                }


                await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_GAME_FRIED_CHICKEN);
                await gameUtil.FriedChickenCountIncrease(conn, user_code);


                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});






/*
*    스탑워치  랭킹 가져오기
* */
router.get('/rank/get/:date/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let date = req.params.date;

    if (!session_key||!date) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let list = await gameUtil.getstoprank(conn,date);

                returnValues["value"] = {
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*      랭킹 날짜 가져오기
* */
router.get('/rank/getdate/', (req, res, next) => {


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;

                let list = await gameUtil.getstoprankdate(conn);

                returnValues["value"] = {
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});





/*
*    분류알바  랭킹 가져오기
* */
router.get('/rank/color/get/:date/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let date = req.params.date;

    if (!session_key||!date) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let list = await gameUtil.getcolorrank(conn,date);

                returnValues["value"] = {
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*    분류알바  랭킹 날짜 가져오기
* */
router.get('/rank/color/getdate/', (req, res, next) => {


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;

                let list = await gameUtil.getcolorrankdate(conn);

                returnValues["value"] = {
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});



/*
*      분류 랭킹 등록
* */
router.get('/rank/color/set/:point/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let point = req.params.point;

    if (!session_key|| !point) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                //let userrankinfo = await gameUtil.getmystoprank(conn, user_code);


                await gameUtil.setcolormyrank(conn, user_code, point);
                await gameUtil.setcolormyranklog(conn, user_code, point);

                await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_GAME_COLOR_CHICKEN);
                await gameUtil.ColorChickenCountIncrease(conn, user_code);

                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});









/*
*    플라이치킨  랭킹 가져오기
* */
router.get('/rank/fly/get/:date/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let date = req.params.date;

    if (!session_key||!date) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                //let user_code = await sessionUtil.getUserCode(conn, session_key);
                let list = await gameUtil.getflyrank(conn,date);

                returnValues["value"] = {
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*    플라이치킨  랭킹 날짜 가져오기
* */
router.get('/rank/fly/getdate/', (req, res, next) => {


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;

                let list = await gameUtil.getflyrankdate(conn);

                returnValues["value"] = {
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});




/*
*      플라잉치킨 랭킹 등록
* */
router.get('/rank/fly/set/:point/:meter/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let point = req.params.point;
    let meter = req.params.meter;

    if (!session_key|| !point || !meter) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                await gameUtil.setflymyrank(conn, user_code, point,meter);

                await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_GAME_FLY_CHICKEN);
                await gameUtil.FlyChickenCountIncrease(conn, user_code);

                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});










/*
*      우편 가져오기
* */
router.get('/message/get/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let list = await gameUtil.getmessages(conn,user_code);

                returnValues["value"] = {
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});



/*
*      아이템 받기
* */
router.get('/message/getitem/:messageid/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let messageid = req.params.messageid;

    if (!session_key || !messageid) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;

                await connection.beginTransaction();

                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                await gameUtil.getmessageitem(conn, messageid);
                let iteminfo = await gameUtil.getidxmessage(conn, messageid);

                if (iteminfo.point_type === 1)
                {
                    await gameUtil.updateUserGold(conn, user_code, iteminfo.point, iteminfo.point, 0);
                    await gameUtil.addPointHistory(conn, user_code, 0, iteminfo.point,0, settings.POINT_TYPE_MESSAGE);
                } else if (iteminfo.point_type === 2)
                {
                    await gameUtil.updateUserPoint(conn, user_code, iteminfo.point, iteminfo.point, 0);
                    await gameUtil.addPointHistory(conn, user_code, iteminfo.point, 0,0, settings.POINT_TYPE_MESSAGE);
                } else if (iteminfo.point_type === 3)
                {
                    await gameUtil.updateUserTicket(conn, user_code, iteminfo.point, iteminfo.point, 0);
                    await gameUtil.addPointHistory(conn, user_code, 0, 0,iteminfo.point, settings.POINT_TYPE_MESSAGE);
                }else if(iteminfo.point_type === 4)
                {
                    await gameUtil.updateUserHeart(conn, user_code, iteminfo.point, iteminfo.point, 0);
                    await gameUtil.addHeartHistory(conn, user_code, iteminfo.point, settings.POINT_TYPE_MESSAGE);
                }

                await connection.commit();

                returnValues["value"] = {
                    point_type : iteminfo.point_type,
                    point : iteminfo.point
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});




/*
*      메시지 삭제
* */
router.get('/message/del/:messageid/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let messageid = req.params.messageid;

    if (!session_key || !messageid) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                await gameUtil.deletemessage(conn,messageid,user_code);

                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});




/*
*      메시지 전체 삭제
* */
router.get('/message/delall/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;


    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                await gameUtil.deleteallmessage(conn,user_code);

                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});



/*
*      메시지 확인
* */
router.get('/message/check/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let check = await gameUtil.getcheckmessages(conn,user_code);

                returnValues["value"] = {
                    check : check
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});




/*
*      무료충전 가능한지 확인
* */
router.get('/heart/freecheck/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let check = await gameUtil.getcheckfreeheart(conn, user_code);

                returnValues["value"] = {
                    check : check
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});



/*
*      리워드 하트 충전
* */
router.get('/heart/get/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let userPoint = await userUtil.getPointInfo(conn, user_code);
                let heart_count = userPoint.heart;

                if(heart_count >  0)  throw new CMError(statusCodes.CODE_ERR_HEART_NOT_ZERO, "하트가 0개가 아닙니다.", 500);

                await gameUtil.setlasthearttime(conn,user_code);
                await gameUtil.updateUserHeart(conn, user_code, 3, 3, 0);
                await gameUtil.addHeartHistory(conn, user_code, 3, settings.HEART_TYPE_REWORD);




                returnValues["value"] = {
                    heart_count : heart_count +3
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});




/*
*      랭킹 가져오기
* */
router.get('/ranking/get/:types/:day_type/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let types = req.params.types;
    let day_type = req.params.day_type;

    if (!session_key || !types || !day_type) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let userinfo = await userUtil.getUserInfo(conn, user_code);

                let list = null;
                let myscore = 0;

                //myscore = await gameUtil.getmydayrank_point(conn,user_code);
               // list = await gameUtil.getdayrank_point(conn);

                if(types == settings.RANK_USER_POINT)
                {
                    if(day_type==settings.RANK_DAY)
                    {
                        myscore = await gameUtil.getmydayrank_point(conn,user_code);
                        list = await gameUtil.getdayrank_point(conn);
                    }else if(day_type == settings.RANK_WEEK)
                    {
                        myscore = await gameUtil.getmyweekrank_point(conn,user_code);
                        list = await gameUtil.getweekrank_point(conn);
                    }else
                    {
                        myscore = await gameUtil.getmyallrank_point(conn,user_code);
                        list = await gameUtil.getallrank_point(conn);
                    }
                }else if(types == settings.RANK_USER_GOLD)
                {
                    if(day_type==settings.RANK_DAY)
                    {
                        myscore = await gameUtil.getmydayrank_gold(conn,user_code);
                        list = await gameUtil.getdayrank_gold(conn);
                    }else if(day_type == settings.RANK_WEEK)
                    {
                        myscore = await gameUtil.getmyweekrank_gold(conn,user_code);
                        list = await gameUtil.getweekrank_gold(conn);
                    }else
                    {
                        myscore = await gameUtil.getmyallrank_gold(conn,user_code);
                        list = await gameUtil.getallrank_gold(conn);
                    }
                }else if(types == settings.RANK_CHICKEN_UPGRADE)
                {
                    myscore = await gameUtil.getmyallrank_upgrade_chicken(conn,user_code);
                    list = await gameUtil.getallrank_upgrade_chicken(conn);
                }else if(types == settings.RANK_A_RANK_CHICKEN)
                {
                    if(day_type==settings.RANK_DAY)
                    {
                        myscore = await gameUtil.getmydayrank_a_rnak(conn,user_code);
                        list = await gameUtil.getdayrank_a_rnak(conn);
                    }else if(day_type == settings.RANK_WEEK)
                    {
                        myscore = await gameUtil.getmyweekrank_a_rnak(conn,user_code);
                        list = await gameUtil.getweekrank_a_rnak(conn);
                    }else
                    {
                        myscore = await gameUtil.getmyallrank_a_rnak(conn,user_code);
                        list = await gameUtil.getallrank_a_rnak(conn);
                    }
                }else if(types == settings.RANK_CHICKEN_SELL)
                {
                    myscore = await gameUtil.getmyallrank_sell_chicken(conn,user_code);
                    list = await gameUtil.getallrank_sell_chicken(conn);
                }else if(types == settings.RANK_GOLD_EGG)
                {
                    if(day_type==settings.RANK_DAY)
                    {
                        myscore = await gameUtil.getmydayrank_goldegg(conn,user_code);
                        list = await gameUtil.getdayrank_goldegg(conn);
                    }else if(day_type == settings.RANK_WEEK)
                    {
                        myscore = await gameUtil.getmyweekrank_goldegg(conn,user_code);
                        list = await gameUtil.getweekrank_goldegg(conn);
                    }else
                    {
                        myscore = await gameUtil.getmyallrank_goldegg(conn,user_code);
                        list = await gameUtil.getallrank_goldegg(conn);
                    }
                }else if(types == settings.RANK_EGG_SELL)
                {
                    if(day_type==settings.RANK_DAY)
                    {
                        myscore = await gameUtil.getmydayrank_eggsell(conn,user_code);
                        list = await gameUtil.getdayrank_eggsell(conn);
                    }else if(day_type == settings.RANK_WEEK)
                    {
                        myscore = await gameUtil.getmyweekrank_eggsell(conn,user_code);
                        list = await gameUtil.getweekrank_eggsell(conn);
                    }else
                    {
                        myscore = await gameUtil.getmyallrank_eggsell(conn,user_code);
                        list = await gameUtil.getallrank_eggsell(conn);
                    }
                }else if(types == settings.RANK_BUG)
                {
                    if(day_type==settings.RANK_DAY)
                    {
                        myscore = await gameUtil.getmydayrank_bug(conn,user_code);
                        list = await gameUtil.getdayrank_bug(conn);
                    }else if(day_type == settings.RANK_WEEK)
                    {
                        myscore = await gameUtil.getmyweekrank_bug(conn,user_code);
                        list = await gameUtil.getweekrank_bug(conn);
                    }else
                    {
                        myscore = await gameUtil.getmyallrank_bug(conn,user_code);
                        list = await gameUtil.getallrank_bug(conn);
                    }
                }else if(types == settings.RANK_PLANT)
                {
                    if(day_type==settings.RANK_DAY)
                    {
                        myscore = await gameUtil.getmydayrank_plant(conn,user_code);
                        list = await gameUtil.getdayrank_plant(conn);
                    }else if(day_type == settings.RANK_WEEK)
                    {
                        myscore = await gameUtil.getmyweekrank_plant(conn,user_code);
                        list = await gameUtil.getweekrank_plant(conn);
                    }else
                    {
                        myscore = await gameUtil.getmyallrank_plant(conn,user_code);
                        list = await gameUtil.getallrank_plant(conn);
                    }
                }else if(types == settings.RANK_CLEAN)
                {
                    if(day_type==settings.RANK_DAY)
                    {
                        myscore = await gameUtil.getmydayrank_clean(conn,user_code);
                        list = await gameUtil.getdayrank_clean(conn);
                    }else if(day_type == settings.RANK_WEEK)
                    {
                        myscore = await gameUtil.getmyweekrank_clean(conn,user_code);
                        list = await gameUtil.getweekrank_clean(conn);
                    }else
                    {
                        myscore = await gameUtil.getmyallrank_clean(conn,user_code);
                        list = await gameUtil.getallrank_clean(conn);
                    }
                }else if(types == settings.RANK_PLAY_CHICKEN)
                {
                    if(day_type==settings.RANK_DAY)
                    {
                        myscore = await gameUtil.getmydayrank_play(conn,user_code);
                        list = await gameUtil.getdayrank_play(conn);
                    }else if(day_type == settings.RANK_WEEK)
                    {
                        myscore = await gameUtil.getmyweekrank_play(conn,user_code);
                        list = await gameUtil.getweekrank_play(conn);
                    }else
                    {
                        myscore = await gameUtil.getmyallrank_play(conn,user_code);
                        list = await gameUtil.getallrank_play(conn);
                    }
                }

                returnValues["value"] = {
                    myscore : myscore,
                    mynick : userinfo.nick,
                    types : types,
                    day_type : day_type,
                    list : list

                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });




});




/*
*      치킨 투표 등록
* */
router.get('/rank/vote/set/:number/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let number = req.params.number;

    if (!session_key|| !number ) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                await gameUtil.setvotemyselect(conn, user_code, number);

                //await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_GAME_FLY_CHICKEN);
                //await gameUtil.FlyChickenCountIncrease(conn, user_code);

                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});





/*
*      치킨 투표 랭킹 가져오기
* */
router.get('/rank/vote/get/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let myinfo = await gameUtil.getvotemyselect(conn, user_code);
                let voteinfo = await gameUtil.getvoteinfo(conn);
                let list = await gameUtil.getvoterank(conn);

                let vote_check=true;
                if(list===0)
                {
                    vote_check = false;
                }

                returnValues["value"] = {
                    list : list,
                    myselect : myinfo,
                    vote_check : vote_check,
                    voteinfo : voteinfo,
                    price_x : 100

                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});






/*
*      치킨 투표 랭킹 날짜 가져오기
* */
router.get('/rank/vote/get/date/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key ) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let list = await gameUtil.getvoterankdates(conn);

                returnValues["value"] = {
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});




/*
*      치킨 투표 랭킹 리스트 가져오기
* */
router.get('/rank/vote/get/list/:dates/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let dates = req.params.dates;

    if (!session_key ) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);


                let my_info  = await gameUtil.getvotemyrankinfo(conn,user_code,dates)
                let vote_info = await gameUtil.getvoterankinfo(conn, dates);
                let vote_list = await gameUtil.getvoteranklist(conn, dates);

                returnValues["value"] = {
                    my_info : my_info,
                    vote_info : vote_info,
                    vote_list : vote_list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*      게임코드 가져오기
* */
router.get('/rank/fw/get/gamecode/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key ) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let game_code = await gameUtil.getfwgamecode(conn,user_code);

                returnValues["value"] = {
                    game_code : game_code

                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});




/*
*      게임진행 - 결과 가져오기 및 로그기록
* */
router.get('/rank/fw/set/game/:gamecode/:select_num/:win_count/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let gamecode = req.params.gamecode;
    let select_num = req.params.select_num;
    let win_count =  req.params.win_count;

    if (!session_key || !gamecode || !select_num || !win_count) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);


                let fire_hand = rand.int(0, 2);
                let rslt = 0;

                if(fire_hand === 0)
                {
                    if(select_num==="0")
                    {
                        //draw
                        rslt = 2;
                    }else if(select_num==="1")
                    {
                        //lose
                        rslt = 3;
                    }else{
                        //win
                        rslt = 1;
                    }
                }else if(fire_hand === 1)
                {
                    if(select_num==="0")
                    {
                        //win
                        rslt = 1;
                    }else if(select_num==="1")
                    {
                        //draw
                        rslt = 2;
                    }else{
                        //lose
                        rslt = 3;
                    }
                }else if(fire_hand === 2)
                {
                    if(select_num==="0")
                    {
                        //lose
                        rslt = 3;
                    }else if(select_num==="1")
                    {
                        //win
                        rslt = 1;
                    }else{
                        //draw
                        rslt = 2;
                    }
                }
                if(rslt===2) {
                    await gameUtil.setfwlog(conn, user_code, gamecode, select_num, 2, 1+(win_count*1) );
                }else if(rslt===3)
                {
                    await gameUtil.setfwlog(conn, user_code, gamecode, select_num, 3, -1);
                }


                returnValues["value"] = {
                    fire_hand : fire_hand,
                    select_num : select_num,
                    rslt : rslt
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});



/*
*      승리보너스 획득 및 로그기록
* */
router.get('/rank/fw/set/winbonus/:gamecode/:select_num/:win_count/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let gamecode = req.params.gamecode;
    let select_num = req.params.select_num;
    let win_count =  req.params.win_count;

    if (!session_key || !gamecode || !select_num || !win_count) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let bonus = rand.int(1, 5);

                await gameUtil.setfwlog(conn, user_code, gamecode, select_num, 1, (bonus+3)*(win_count*1));


                returnValues["value"] = {
                    bonus : bonus
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});



/*
*      최종기록 저장
* */
router.get('/rank/fw/set/gameend/:gamecode/:score/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let gamecode = req.params.gamecode;
    let score = req.params.score;

    if (!session_key || !gamecode ) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                await gameUtil.setfwrank(conn,user_code,gamecode,score);

                returnValues["value"] = {

                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});







/*
*    fw (불 vs 물)  랭킹 가져오기
* */
router.get('/rank/fw/get/:date/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let date = req.params.date;

    if (!session_key||!date) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                // 사용자 코드 획득 없는 경우 에러
                //let user_code = await sessionUtil.getUserCode(conn, session_key);
                let list = await gameUtil.getfwrank(conn,date);

                returnValues["value"] = {
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*    불닭vs 물닭  랭킹 날짜 가져오기
* */
router.get('/rank/fw/getdate/', (req, res, next) => {


    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;

                let list = await gameUtil.getfwrankdate(conn);

                returnValues["value"] = {
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});





/*
*    길드 길드 가입상태 알아보기
* */
router.get('/guild/get/myinfo/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let info = await gameUtil.getguildcheck(conn,user_code);
                let guild_check =true;
                if(info===0)
                {
                    guild_check =false;
                }

                returnValues["value"] = {
                    guild_check : guild_check,
                    info : info
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});




/*
*    길드 이름 중복체크
* */
router.get('/guild/namecheck/:guild_name/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let guild_name = req.params.guild_name;

    if (!session_key|| !guild_name) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }
    if(guild_name.length>10)
    {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "마을 이름이 너무 깁니다.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let guild_name_check = await gameUtil.getguildnamecheck(conn,guild_name);

                returnValues["value"] = {
                    guild_name_check : guild_name_check,
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});



/*
*    길드 만들기
* */
router.post('/guild/create/:session_key', (req, res, next) => {

        let session_key = req.params.session_key;
        let guild_name = req.body.guild_name;
        let guild_info = req.body.guild_info;
        let guild_sign_check = req.body.guild_sign_check;

        if (!session_key) {
            next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
            return;
        }

        if (!guild_name) {
            next(new CMError(statusCodes.CODE_ERR_PARAMS, "마을이름을 입력해주세요.", 400));
            return;
        }
        if(guild_name.length>10)
        {
            next(new CMError(statusCodes.CODE_ERR_PARAMS, "마을 이름이 너무 깁니다.", 400));
            return;
        }
        if (!guild_sign_check) {
            next(new CMError(statusCodes.CODE_ERR_PARAMS, "마을 가입방식을 선택해주세요.", 400));
            return;
        }

        let connection;
        let returnValues = {
            value: {},
            code: statusCodes.CODE_ERR_DB,
            reason: ""
        };

        pool.getConnection()
            .then(async conn => {
                try {

                    connection = conn;
                    let user_code = await sessionUtil.getUserCode(conn, session_key);

                    let info = await gameUtil.getguildcheck(conn,user_code);
                    let check = await gameUtil.getsignrequest_check(conn,user_code)

                    if(check!=0) {
                        throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "가입 요청중에는 길드를 만드실 수 없습니다.", 500);
                    }
                    await connection.beginTransaction();

                    if(info===0)
                    {
                        let userPoint = await userUtil.getPointInfo(conn, user_code);
                        if (userPoint.gold < 300000) throw new CMError(statusCodes.CODE_ERR_NOT_ENOUGH_GOLD, "골드 부족", 400);

                        // 골드 확인
                        await gameUtil.updateUserGold(conn, user_code, -300000, 0, 300000);

                        // 골드 사용 히스토리
                        await gameUtil.addPointHistory(conn, user_code, 0, -300000,0, settings.POINT_TYPE_BUY_ITEM);


                        //길드만들기
                        await gameUtil.guildcreate(conn,guild_name,guild_info,guild_sign_check,user_code);
                        let guild_num = await gameUtil.getguildnum(conn,guild_name);
                        //길드 유저 등록
                        await gameUtil.guild_sign_up(conn,user_code,guild_num,settings.TOWN_GUILD_MASTER);

                        await gameUtil.guild_log(conn,user_code,guild_num,'마을이 생성에 성공하였습니다.',settings.TOWN_LOG_CREATE)

                    }else{
                        throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "이미 마을에 가입되어있습니다.", 500);
                    }
                    await connection.commit();

                    returnValues["value"] = {
                        //success : true
                    };

                    returnValues["code"] = statusCodes.CODE_SUCCESS;
                    returnValues["reason"] = "success";


                    res.status(200)
                        .json(returnValues)
                        .end();


                } catch (err) {
                    await connection.rollback();
                    errHandler.doHandleError(err, next);
                } finally {
                    connection.release();
                }

            })
            .catch(err => {
                errHandler.doCatch(connection, err, next);
            });
});





////




/*
*    길드 리스트 가져오기
* */
router.get('/guild/list/get/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let check = await gameUtil.getsignrequest_check(conn,user_code)
                let list = null;
                if(check===0) {
                    list = await gameUtil.getguildlist(conn);
                }else{
                    list = await gameUtil.getrequest_guildinfo(conn,check.guild_num);
                }


                returnValues["value"] = {
                    list : list,
                    check : check
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});



/*
*    길드 요청 리스트 가져오기
* */
router.get('/guild/request/list/get/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                //let guild_info = await gameUtil.getguildcheck(conn,user_code);

                let info = await gameUtil.getguildcheck(conn,user_code);
                if(info.guild_level===1) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "권한이 없습니다.", 500);

                let list = await gameUtil.getguildrequestlist(conn,info.guild_num);


                returnValues["value"] = {
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});




/*
*    검색 길드 리스트 가져오기
* */
router.get('/guild/list/search/:search_text/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let search_text = req.params.search_text;

    if (!session_key || !search_text) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let check = await gameUtil.getsignrequest_check(conn,user_code)
                let list = await gameUtil.getsearchlist(conn, search_text);
                if(check!=0){
                    throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "가입 요청중에는 검색하실 수 없습니다.", 500);
                }

                returnValues["value"] = {
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});





/*
*    내 길드 정보 가져오기
* */
router.get('/guild/info/get/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let info = await gameUtil.getguildcheck(conn,user_code);

                if(info===0) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "마을에 가입되어있지 않습니다. 관리자에게 문의해주세요.", 500);

                let guild_info = await gameUtil.getguildinfo(conn,info.guild_num);
                let guilduser_list = await gameUtil.getguilduser_list(conn,info.guild_num);

                // info.guild_num
                // info.guild_level
                // info.user_guild_point


                // 길드 명  / 길드마스터 닉네임 / 길드 공지
                // 누적 점수 리스트->나중에
                // 주간 점수 리스트->나중에
                // 길드원 리스트
                // 요청 리스트


                returnValues["value"] = {
                    myguild_num : info.guild_num,
                    mylevel : info.guild_level,
                    guild_info : guild_info,
                    guilduser_list: guilduser_list

                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});




/*
*    길드 가입 요청 & 바로가입 하기
* */
router.get('/guild/sign/:guild_num/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let guild_num = req.params.guild_num;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let info = await gameUtil.getguildcheck(conn,user_code);

                await connection.beginTransaction();
                let guild_info = await gameUtil.getguildinfo(conn,guild_num);

                if(info===0)
                {
                    if(await gameUtil.getguilduser_count(conn,guild_num) >=9) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "더 이상 마을에 가입할 수 없습니다.", 500);

                    if(guild_info.guild_sign_type === 1)
                    {
                        //바로가입

                        await gameUtil.guild_sign_up(conn,user_code,guild_num,1);

                        await gameUtil.guild_log(conn,user_code,guild_num,'마을에 가입하였습니다.',settings.TOWN_LOG_SIGN)

                    }else if(guild_info.guild_sign_type === 2)
                    {
                        //승인 후 가입
                        await gameUtil.guild_sign_request(conn,user_code,guild_num,'');
                    }

                }else{
                     throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "이미 마을에 가입되어있습니다. 관리자에게 문의해주세요.", 500);
                }

                await connection.commit();

                returnValues["value"] = {
                    guild_sign_type : guild_info.guild_sign_type
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*    길드 가입 요청 승인
* */
router.get('/guild/sign_ok/:sign_user_code/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let sign_user_code = req.params.sign_user_code;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let guild_info = await gameUtil.getguildcheck(conn,user_code);

                let info = await gameUtil.getguildcheck(conn,sign_user_code);
                if(guild_info.guild_level===1) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "권한이 없습니다.", 500);

                await connection.beginTransaction();
                if(info===0)
                {

                    if(await gameUtil.getguilduser_count(conn,guild_info.guild_num) >=9) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "더 이상 마을에 가입할 수 없습니다.", 500);

                    await gameUtil.guild_sign_request_cancel(conn,sign_user_code);
                    await gameUtil.guild_sign_up(conn,sign_user_code,guild_info.guild_num,1);
                    await gameUtil.guild_log(conn,user_code,guild_info.guild_num,'가입 승인을 하였습니다.',settings.TOWN_LOG_SIGN)
                    await gameUtil.guild_log(conn,sign_user_code,guild_info.guild_num,'마을에 가입하였습니다.',settings.TOWN_LOG_SIGN)

                }else{
                    throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "해당 유저는 이미 마을에 가입되어있습니다.", 500);
                }
                await connection.commit();


                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*    길드 가입 요청 거절
* */
router.get('/guild/sign_reject/:sign_user_code/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let sign_user_code = req.params.sign_user_code;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let guild_info = await gameUtil.getguildcheck(conn,user_code);

                //let info = await gameUtil.getguildcheck(conn,sign_user_code);
                if(guild_info.guild_level===1) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "권한이 없습니다.", 500);

                await gameUtil.guild_sign_request_cancel(conn,sign_user_code);


                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});




/*
*    길드 가입 요청 취소
* */
router.get('/guild/sign_cancel/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let info = await gameUtil.getguildcheck(conn,user_code);

                if(info===0)
                {
                    await gameUtil.guild_sign_request_cancel(conn,user_code);

                }else{
                    throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "이미 마을에 가입되어있습니다.", 500);
                }


                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});



/*
*    길드 설정 변경
* */
router.post('/guild/setting/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let guild_info = req.body.guild_info;
    let guild_notice = req.body.guild_notice;
    let guild_sign_type = req.body.guild_sign_type;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let info = await gameUtil.getguildcheck(conn,user_code);


                if(info.guild_level===1) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "권한이 없습니다.", 500);

                await gameUtil.setmodifyguildinfo(conn,info.guild_num,guild_info,guild_notice,guild_sign_type);
                await gameUtil.guild_log(conn,user_code,info.guild_num,'길드 설정을 변경하였습니다.',settings.TOWN_LOG_SETTING)



                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});




/*
*    내 인삿말 바꾸기
* */
router.get('/guild/set/myinfo/:message/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let message = req.params.message;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                //let info = await gameUtil.getguildcheck(conn,user_code);
                await gameUtil.setguildmyinfo(conn,user_code,message);

                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*    부이장 위임
* */
router.get('/guild/set/sub_master/:guild_user_code/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let guild_user_code = req.params.guild_user_code;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let info = await gameUtil.getguildcheck(conn,user_code);
                let sub_info = await gameUtil.getguildcheck(conn,guild_user_code);

                if(info.guild_level===1) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "권한이 없습니다.", 500);
                if(await gameUtil.getsubmaster_check(conn,info.guild_num) === -1) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "부이장은 한명만 임명할 수 있습니다.", 500);
                if(info.guild_num!=sub_info.guild_num) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "해당 유저의 길드정보가 다릅니다. 관리자에게 문의해주세요.", 500);

                await gameUtil.setsubmaster(conn,guild_user_code);
                await gameUtil.guild_log(conn,guild_user_code,info.guild_num,'부이장으로 임명 되었습니다.',settings.TOWN_LOG_MASTER);


                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});



/*
*    부이장 해임
* */
router.get('/guild/set/sub_master_del/:guild_user_code/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let guild_user_code = req.params.guild_user_code;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let info = await gameUtil.getguildcheck(conn,user_code);
                let sub_info = await gameUtil.getguildcheck(conn,guild_user_code);

                if(info.guild_level===1) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "권한이 없습니다.", 500);
                //if(await gameUtil.getsubmaster_check(conn,info.guild_num) === -1) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "부이장은 한명만 임명할 수 있습니다.", 500);
                if(info.guild_num!=sub_info.guild_num) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "해당 유저의 길드정보가 다릅니다. 관리자에게 문의해주세요.", 500);

                await gameUtil.setmaster_del(conn,guild_user_code);
                await gameUtil.guild_log(conn,guild_user_code,info.guild_num,'부이장에서 해임 되었습니다.',settings.TOWN_LOG_MASTER);


                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*    이장 위임
* */
router.get('/guild/set/master/:guild_user_code/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let guild_user_code = req.params.guild_user_code;

    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let info = await gameUtil.getguildcheck(conn,user_code);
                let sub_info = await gameUtil.getguildcheck(conn,guild_user_code);

                if(info.guild_level===1) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "권한이 없습니다.", 500);
                //if(await gameUtil.getsubmaster_check(conn,info.guild_num) === -1) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "부이장은 한명만 임명할 수 있습니다.", 500);
                if(info.guild_num!=sub_info.guild_num) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "해당 유저의 길드정보가 다릅니다. 관리자에게 문의해주세요.", 500);

                await connection.beginTransaction();

                await gameUtil.setmaster_del(conn,user_code);
                await gameUtil.setmaster(conn,guild_user_code);
                await gameUtil.setmaster_guild(conn,guild_user_code,info.guild_num);

                await gameUtil.guild_log(conn,user_code,info.guild_num,'이장에서 해임 되었습니다.',settings.TOWN_LOG_MASTER);
                await gameUtil.guild_log(conn,guild_user_code,info.guild_num,'이장으로 임명 되었습니다.',settings.TOWN_LOG_MASTER);

                await connection.commit();

                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*    길드 해산
* */
router.get('/guild/del/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;


    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let info = await gameUtil.getguildcheck(conn,user_code);

                if(await gameUtil.getguilduser_count(conn,info.guild_num) !=1) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "본인을 제외한 길드원이 없어야 합니다.", 500);

                await connection.beginTransaction();

                await gameUtil.delete_guild(conn,user_code,info.guild_num);
                await gameUtil.guild_escape(conn,user_code);

                await gameUtil.guild_sign_all_cancel(conn,info.guild_num);

                await gameUtil.guild_log(conn,user_code,info.guild_num,'마을이 해산 되었습니다.',settings.TOWN_LOG_CREATE);

                await connection.commit();

                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});



/*
*    길드 추방
* */
router.get('/guild/ban/:guild_user_code/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;
    let guild_user_code = req.params.guild_user_code;


    if (!session_key || !guild_user_code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let info = await gameUtil.getguildcheck(conn,user_code);
                let sub_info = await gameUtil.getguildcheck(conn,guild_user_code);

                if(info.guild_level===1) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "권한이 없습니다.", 500);
                if(info.guild_num!=sub_info.guild_num) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "해당 유저의 길드정보가 다릅니다. 관리자에게 문의해주세요.", 500);

                await connection.beginTransaction();

                await gameUtil.guild_escape(conn,guild_user_code);

                await gameUtil.guild_log(conn,user_code,info.guild_num,'추방 하였습니다.',settings.TOWN_LOG_SIGN);
                await gameUtil.guild_log(conn,guild_user_code,info.guild_num,'추방 되었습니다.',settings.TOWN_LOG_SIGN);

                await connection.commit();

                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                await connection.rollback();
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});


/*
*    길드 탈퇴
* */
router.get('/guild/escape/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;


    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                let info = await gameUtil.getguildcheck(conn,user_code);

                await gameUtil.guild_escape(conn,user_code);

                await gameUtil.guild_log(conn,user_code,info.guild_num,'탈퇴 하였습니다.',settings.TOWN_LOG_SIGN);



                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});




/*
*    내 접속시간 갱신
* */
router.get('/guild/my_access/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;


    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);

                await gameUtil.setaccesstime(conn,user_code);


                returnValues["value"] = {
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});



/*
*    광장 메시지 가져오기
* */
router.get('/guild/squar/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;


    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let info = await gameUtil.getguildcheck(conn,user_code);
                let list = await gameUtil.getguildsquar(conn,info.guild_num);


                returnValues["value"] = {
                    user_code : user_code,
                    list : list
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});



/*
*    카카오 비밀번호 가져오기
* */
router.get('/kakao/pass/:session_key', (req, res, next) => {

    let session_key = req.params.session_key;


    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let user_code = await sessionUtil.getUserCode(conn, session_key);


                let pass = await gameUtil.getkakaopass(conn);



                returnValues["value"] = {
                    pass : pass
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";


                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                errHandler.doHandleError(err, next);
            } finally {
                connection.release();
            }

        })
        .catch(err => {
            errHandler.doCatch(connection, err, next);
        });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  게시판




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////









module.exports = router;



