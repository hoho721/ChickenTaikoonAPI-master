import express from "express"
import statusCodes from '../conf/statusCodes'
import CMError from "../CMError";
import {SQLHelper} from "../utils/index"
import settings from '../conf/settings'
import md5 from 'md5'
import _ from "underscore";
import rp from "request-promise"
import {errHandler, userUtil, sessionUtil, gameUtil, devUtil, chickenUtil} from "./utils";
import chickenSettings from "../conf/chickenSetting";

const pool = SQLHelper.createPool();
const router = express.Router();


const doCatch = (conn, err, next) => {
    if (conn) conn.release();
    if (err instanceof CMError) {
        next(err);
    } else {
        const message = err ? err.toString() : "";
        next(new CMError(statusCodes.CODE_ERR_DB, message, 500));
    }
};

// 브랜드 상품 리스트
router.get('/product/brand/:code/list/:session_key', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let code = req.params.code;
    let session_key = req.params.session_key;


    if (!session_key || !code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }

    pool.getConnection()
        .then(async conn => {
            try {
                // TODO : 회원에게만 노출
                connection = conn;
                let rows = await connection.query('SELECT user_code FROM tb_session WHERE session_key=?', [session_key]);
                if(rows.length === 0) throw new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "can't find login info.", 500);
                let user_code =  rows[0].user_code;
                connection.release();


                let strSeed = settings.STORE_USER_KEY + settings.STORE_USER_ID + code;
                let enc = md5(strSeed);

                const options = {
                    method: "GET",
                    uri: `${settings.STORE_BASE_URL}/getGoodsInfoList?cid=${settings.STORE_USER_ID}&brand_id=${code}&enc=${enc}`,
                    json: true
                };


                rp(options)
                    .then(body => {
                        let result = JSON.parse(body);
                        let list = _.filter(result, (data) => data.STATUS === 'Y');
                        list = _.map(list, row => {
                                row.PRICE = row.PRICE * 70;
                                return {
                                    ...row,

                                }
                        });

                        returnValues["value"] = {
                            list: list
                        };
                        returnValues["code"] = statusCodes.CODE_SUCCESS;
                        returnValues["reason"] = "success.";

                        res.status(200)
                            .json(returnValues)
                            .end();

                    })
                    .catch(err => {

                        returnValues["value"] = {
                        };
                        returnValues["code"] = statusCodes.CODE_ERR_OTHERS;
                        returnValues["reason"] = "request error.";

                        res.status(200)
                            .json(returnValues)
                            .end();
                    });

            } catch (err) {
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });
});



// 상품 상세 정보
router.get('/product/goods/:goods_id/detail/:session_key', (req, res, next) => {

    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let goods_id = req.params.goods_id;
    let session_key = req.params.session_key;


    if (!session_key || !goods_id) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }

    let strSeed = settings.STORE_USER_KEY + settings.STORE_USER_ID + goods_id;
    let enc = md5(strSeed);

    const options = {
        method: "GET",
        uri: `${settings.STORE_BASE_URL}/getGoodsInfo?cid=${settings.STORE_USER_ID}&goods_id=${goods_id}&enc=${enc}`,
        json: true
    };

    rp(options)
        .then(body => {
            returnValues["value"] = {
                goods_name: body.GOODS_NAME,
                brand_id: body.BRAND_ID,
                brand_name: body.BRAND_NAME,
                price: (body.PRICE * 70),
                msg_type: body.MSG_TYPE,
                img_url: body.IMG_URL,
                exdate: body.EXDATE,
                goods_memo: body.GOODS_MEMO,
                brand_memo: body.BRAND_MEMO,
                status: body.STATUS
            };
            returnValues["code"] = statusCodes.CODE_SUCCESS;
            returnValues["reason"] = "success.";

            res.status(200)
                .json(returnValues)
                .end();

        })
        .catch(err => {

            returnValues["value"] = {
            };
            returnValues["code"] = statusCodes.CODE_ERR_OTHERS;
            returnValues["reason"] = err.toString();

            res.status(200)
                .json(returnValues)
                .end();
        });
});



// 상품 구매
router.post('/purchase/goods/:goods_id', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let goods_id = req.params.goods_id;
    let session_key = req.body.session_key;
    let point = req.body.point;
    let img_url = req.body.img_url;
    let goods_name = req.body.goods_name;
    let brand_name = req.body.brand_name;


    if (!session_key || !goods_id  || !point || !img_url) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }


    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                await connection.beginTransaction();

                let rows = await connection.query('SELECT user_code FROM tb_session WHERE session_key=?', [session_key]);
                if(rows.length === 0) throw new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "can't find login info.", 500);
                let user_code =  rows[0].user_code;

                rows = await connection.query("SELECT point FROM tb_point WHERE user_code=?", [user_code]);
                if(rows.length === 0) throw new CMError(statusCodes.CODE_ERR_DB, "can't find point info.", 500);

                let user_point = rows[0].point;

                if(user_point < point ) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "보유하신 포인트가 부족합니다.", 500);

                // 거래 번호 생성
                let tid = new Date().getTime();
                let co_tid = `${user_code}_${tid}`;


                let strSeed = settings.STORE_USER_KEY + settings.STORE_USER_ID + goods_id + co_tid;
                let enc = md5(strSeed);

                const options = {
                    method: "GET",
                    uri: `${settings.STORE_BASE_URL}/getEpin?cid=${settings.STORE_USER_ID}&goods_id=${goods_id}&count=1&co_tid=${co_tid}&enc=${enc}&reserved=1`,
                    json: true
                };



                rp(options)
                    .then(async body => {
                        //body = JSON.parse(body);
                        if(body.rstCode === '0') {

                            //TODO: 사용자 포인트 차감

                            let epin = body.epin;
                            let exdate = body.exdate;
                            let order_id = body.order_id;
                            let etc = `${brand_name} - ${goods_name}`;
                            let result = await connection.query('INSERT INTO tb_store (epin, exdate, user_code, point, order_id, img_url, status, co_tid, goods_name, brand_name, gendate) VALUES(?,?,?,?,?,?,?,?,?,?,now())', [epin, exdate, user_code, point, order_id, img_url, 1, co_tid, goods_name, brand_name]);
                            //await connection.query('INSERT INTO tb_point_his (reg_date, user_code, point, type, msg) VALUES(now(), ?, ?, ?, ?)', [user_code, -point, settings.POINT_HISTORY_TYPE_SHOP_BUY, etc]);
                            //await connection.query('UPDATE tb_point SET point = point-? WHERE user_code=? and point>=?', [point, user_code, point]);

                            await gameUtil.updateUserPoint(conn, user_code, -point, 0, point);
                            await gameUtil.addPointHistory(conn, user_code, -point, 0, 0,settings.POINT_TYPE_CHICKEN_STORE_BUY);

                            returnValues["value"] = {};
                            returnValues["code"] = statusCodes.CODE_SUCCESS;
                            returnValues["reason"] = "success.";
                        } else {
                            returnValues["value"] = {};
                            returnValues["code"] = statusCodes.CODE_ERR_USER_ALERT;
                            returnValues["reason"] = body.rstMsg+" 관리자에게 문의하세요";
                        }

                        await connection.commit();

                        connection.release();

                        res.status(200)
                            .json(returnValues)
                            .end();

                    })
                    .catch(async err => {

                        await connection.rollback();

                        connection.release();

                        returnValues["value"] = {
                        };
                        returnValues["code"] = statusCodes.CODE_ERR_OTHERS;
                        returnValues["reason"] = err.toString();

                        res.status(200)
                            .json(returnValues)
                            .end();
                    });


            } catch (err) {
                await connection.rollback();
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });
});


// 상품 구매 취소
router.post('/refund/goods/:order_id', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let order_id = req.params.order_id;
    let session_key = req.body.session_key;

    if (!session_key || !order_id) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }


    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                await connection.beginTransaction();

                let rows = await connection.query('SELECT user_code FROM tb_session WHERE session_key=?', [session_key]);
                if(rows.length === 0) throw new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "can't find login info.", 500);
                let user_code =  rows[0].user_code;

                rows = await connection.query('SELECT idx, point, goods_name, brand_name FROM tb_store WHERE user_code=? AND order_id=? AND status=1', [user_code, order_id]);

                let idx = rows[0].idx;
                let point = rows[0].point;
                let goods_name = rows[0].goods_name;
                let brand_name = rows[0].brand_name;
                let etc = `${brand_name} - ${goods_name} 구매 취소`;

                let strSeed = settings.STORE_USER_KEY + settings.STORE_USER_ID + order_id;
                let enc = md5(strSeed);

                const options = {
                    method: "GET",
                    uri: `${settings.STORE_BASE_URL}/CancelEpin?cid=${settings.STORE_USER_ID}&enc=${enc}&order_id=${order_id}`,
                    json: true
                };



                rp(options)
                    .then(async body => {

                        if(body.rstCode === '0') {

                            //TODO: 사용자 포인트 복구
                          //  await connection.query('INSERT INTO tb_point_his (reg_date, user_code, point, type, msg) VALUES(now(), ?, ?, ?, ?)', [user_code, point, settings.POINT_HISTORY_TYPE_SHOP_REFUND, etc]);
                            await connection.query('UPDATE tb_point SET point = point+? WHERE user_code=?', [point, user_code]);
                            await connection.query('UPDATE tb_store SET status=2 WHERE idx=?', [idx])


                            await gameUtil.addPointHistory(conn, user_code, point, 0,0, settings.POINT_TYPE_CHICKEN_STORE_BUY_CANCEL);

                            returnValues["value"] = {};
                            returnValues["code"] = statusCodes.CODE_SUCCESS;
                            returnValues["reason"] = "success.";
                        } else {
                            returnValues["value"] = {};
                            returnValues["code"] = statusCodes.CODE_ERR_USER_ALERT;
                            returnValues["reason"] = body.rstMsg;
                        }

                        await connection.commit();

                        connection.release();

                        res.status(200)
                            .json(returnValues)
                            .end();

                    })
                    .catch(async err => {

                        await connection.rollback();

                        connection.release();

                        returnValues["value"] = {
                        };
                        returnValues["code"] = statusCodes.CODE_ERR_OTHERS;
                        returnValues["reason"] = "request error.";

                        res.status(200)
                            .json(returnValues)
                            .end();
                    });


            } catch (err) {
                await connection.rollback();
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });
});


// 상품 보관함
router.post('/my/goods/:session_key', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let session_key = req.params.session_key;


    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;

                let rows = await connection.query('SELECT user_code FROM tb_session WHERE session_key=?', [session_key]);
                if(rows.length === 0) throw new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "can't find login info.", 500);
                let user_code =  rows[0].user_code;

                rows = await connection.query('SELECT idx, epin, exdate, point, order_id, img_url, status, co_tid, goods_name, brand_name, gendate FROM tb_store WHERE user_code=? AND status<>2', [user_code]);

                returnValues["value"] = {list:rows};
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success.";

                connection.release();

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });
});


// 브랜드 리스트 가져오기
router.get('/brand/list', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;

                let rows = await connection.query('SELECT idx, brand_name, brand_id, img_url FROM tb_store_brands ORDER BY brand_name ASC', []);
                returnValues["value"] = {list:rows};
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success.";

                connection.release();

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });
});


// 모바일 쿠폰 핀 상태 조회
router.get('/epin/status/:order_id', (req, res, next) => {
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let order_id = req.params.order_id;

    if (!order_id) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }


    let strSeed = settings.STORE_USER_KEY + settings.STORE_USER_ID + order_id;
    let enc = md5(strSeed);

    const options = {
        method: "GET",
        uri: `${settings.STORE_BASE_URL}/StatusEpin?cid=${settings.STORE_USER_ID}&enc=${enc}&order_id=${order_id}`,
        json: true
    };

    rp(options)
        .then(body => {

            console.log(body);
            if(body.rstCode === '0') {

                returnValues["value"] = {
                    use: body.use,
                    use_date: body.use_date,
                    branchname: body.branchname
                };
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = body.rstMsg;

            } else {
                returnValues["value"] = {};
                returnValues["code"] = statusCodes.CODE_ERR_USER_ALERT;
                returnValues["reason"] = body.rstMsg;
            }

            res.status(200)
                .json(returnValues)
                .end();

        })
        .catch( err => {

            returnValues["value"] = {};
            returnValues["code"] = statusCodes.CODE_ERR_OTHERS;
            returnValues["reason"] = "request error.";

            res.status(200)
                .json(returnValues)
                .end();
        });

});


// 모바일 쿠폰 상태 사용으로 변경
router.post('/epin/status/update/:order_id', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let order_id = req.params.order_id;
    let session_key = req.body.session_key;

    if (!order_id || !session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }



    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;

                let rows = await connection.query('SELECT user_code FROM tb_session WHERE session_key=?', [session_key]);
                if(rows.length === 0) throw new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "can't find login info.", 500);


                await connection.query('UPDATE tb_store SET status=3 WHERE order_id=?', [order_id]);
                returnValues["value"] = {};
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success.";

                connection.release();

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });

});


// 모바일 쿠폰 상태 삭제
router.post('/epin/status/delete/:idx', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let idx = req.params.idx;
    let session_key = req.body.session_key;
    let order_id = req.body.order_id;

    if (!idx || !session_key || !order_id) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }



    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;

                let rows = await connection.query('SELECT user_code FROM tb_session WHERE session_key=?', [session_key]);
                if(rows.length === 0) throw new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "can't find login info.", 500);

                await connection.query('DELETE FROM tb_store WHERE idx=? AND order_id=?', [idx, order_id]);
                returnValues["value"] = {};
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success.";

                connection.release();

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });

});

// 브랜드 추가
router.post('/add/brand', (req, res, next) => {

    let connection;

    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let brand_id = req.body.brand_id;
    let brand_name = req.body.brand_name;

    if (!brand_id || !brand_name) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }


    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                const options = {
                    method: "GET",
                    uri: `${settings.STORE_BASE_URL}/getBrandImage?cid=${settings.STORE_USER_ID}&brand_id=${brand_id}`,
                    json: true
                };

                rp(options)
                    .then(async body => {
                        if(body.STATUS === 'Y') {
                            let img_url = body.IMG_URL;
                            await connection.query('INSERT INTO tb_store_brands (brand_name, brand_id, img_url) VALUES (?,?,?)', [brand_name, brand_id, img_url]);
                            returnValues["value"] = {};
                            returnValues["code"] = statusCodes.CODE_SUCCESS;
                            returnValues["reason"] = "SUCCESS";

                        } else {
                            returnValues["value"] = {};
                            returnValues["code"] = statusCodes.CODE_ERR_USER_ALERT;
                            returnValues["reason"] = body.rstMsg;
                        }

                        connection.release();

                        res.status(200)
                            .json(returnValues)
                            .end();

                    })
                    .catch( err => {

                        connection.release();
                        returnValues["value"] = {};
                        returnValues["code"] = statusCodes.CODE_ERR_OTHERS;
                        returnValues["reason"] = err.toString();

                        res.status(200)
                            .json(returnValues)
                            .end();
                    });

            } catch (err) {
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });

});



// 오퍼월 추가
router.post('/offerwall/', (req, res, next) => {

    let connection;
    let returnValues = {
        value: {},
        code: statusCodes.CODE_ERR_DB,
        reason: ""
    };

    let appkey = req.body.appkey;
    let pubkey = req.body.pubkey;
    let user_code = req.body.usrkey;
    let app_title = req.body.app_title;
    let coin = req.body.coin;
    let transid = req.body.transid;
    let resign_flag = req.body.resign_flag;




    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;

                if(resign_flag === 'n')
                {
                    let check = await gameUtil.checkcpi(conn,user_code,appkey,pubkey,transid);
                    if(check === 1) throw new CMError(statusCodes.CODE_ERR_ALREADY_GET_POINT, "이미 받은 포인트 입니다.", 400);
                }

                await gameUtil.addcpi(conn,appkey,pubkey,user_code,app_title,coin,transid,resign_flag);
                // 포인트 지급
                await gameUtil.updateUserPoint(conn, user_code, coin, coin, 0);
                // 포인트 내역에 포인트, 골드 환수금 남김
                await gameUtil.addPointHistory(conn, user_code, coin, 0,0, settings.POINT_TYPE_COIN_SHOP);
                //await gameUtil.point_shop_Increase(conn, user_code);

                await gameUtil.missionupdate(conn,user_code,1,settings.MISSION_SHOP_COUNT);
                await gameUtil.missionupdate2(conn,user_code,1,settings.MISSION_SHOP_COUNT);



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


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// giftshow biz


// 브랜드 리스트 가져오기
router.get('/gift/brand/list', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;

                let rows = await connection.query('SELECT brandname,brandIConImg,brandCode FROM tb_gs_brands ORDER BY brandname ASC', []);
                returnValues["value"] = {list:rows};
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success.";

                connection.release();

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });
});



// 브랜드 상품 리스트
router.get('/gift/product/brand/:code/list/:session_key', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let code = req.params.code;
    let session_key = req.params.session_key;


    if (!session_key || !code) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }

    pool.getConnection()
        .then(async conn => {
            try {
                // TODO : 회원에게만 노출
                connection = conn;
                let rows = await connection.query('SELECT user_code FROM tb_session WHERE session_key=?', [session_key]);
                if(rows.length === 0) throw new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "can't find login info.", 500);

                let rows2 = await connection.query('SELECT goodsName,goodsCode,realPrice,realPrice*70 as price,content,goodsImgB,goodsImgS,goodsCode FROM tb_gs_goods where brandCode = ? order by goodsName', [code]);
                returnValues["value"] = {list:rows2};
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success.";

                connection.release();

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });
});




// 상품 구매
router.post('/gift/purchase/goods/:goods_id', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let goods_id = req.params.goods_id;
    let session_key = req.body.session_key;

    if (!session_key || !goods_id ) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                await connection.beginTransaction();

                let rows = await connection.query('SELECT user_code,buy_state FROM tb_session WHERE session_key=?', [session_key]);
                if(rows.length === 0) throw new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "can't find login info.", 500);
                let user_code =  rows[0].user_code;
                if(rows[0].buy_state == 1) throw new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "(구매 실패) 관리자에게 문의해주세요.", 500);



                rows = await connection.query("SELECT point FROM tb_point WHERE user_code=?", [user_code]);
                if(rows.length === 0) throw new CMError(statusCodes.CODE_ERR_DB, "can't find point info.", 500);

                let user_point = rows[0].point;
                let goods = await connection.query("SELECT goodsName,goodsImgS,realPrice,realPrice*70 as price FROM tb_gs_goods WHERE goodsCode=?", [goods_id]);
                if(goods.length === 0) throw new CMError(statusCodes.CODE_ERR_DB, "can't find goods info.", 500);

                if(goods[0].price > user_point ) throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "보유하신 포인트가 부족합니다.", 500);

                // 거래 번호 생성
                let tid = new Date().getTime();
                let tr_id = `${user_code}_${tid}`;

                await connection.query("INSERT INTO `chicken`.`tb_gs_shop_log`(`user_code`,`goodsCode`,`td_id`,`check`,`gendate`)VALUES(?,?,?,1,now());", [user_code,goods_id,tr_id]);

                await connection.commit();
                //
                // returnValues["value"] = {good:goods};
                // returnValues["code"] = statusCodes.CODE_SUCCESS;
                // returnValues["reason"] = "success.";
                //
                // await connection.commit();
                //
                // connection.release();
                //
                // res.status(200)
                //     .json(returnValues)
                //     .end();

                const options = {
                    method: "GET",
                    //uri: `${settings.GIFT_STORE_BASE_URL}/send/?cid=${settings.STORE_USER_ID}&goods_id=${goods_id}&count=1&co_tid=${co_tid}&enc=${enc}&reserved=1`,
                    uri:`${settings.GIFT_STORE_BASE_URL}/send?api_code=0204&custom_auth_code=${settings.GIFT_STORE_CODE}&custom_auth_token=${settings.GIFT_STORE_TOKEN}&dev_yn=N&goods_code=${goods_id}&mms_msg=mms&mms_title=mms&callback_no=${settings.GIFT_STORE_PHONE}&phone_no=${settings.GIFT_STORE_PHONE}&tr_id=${tr_id}&user_id=${settings.GIFT_STORE_ID}&template_id=${settings.GIFT_TEMPLATE_ID}&banner_id=${settings.GIFT_BANNER_ID}&gubun=I`,
                    json: true
                };

                rp(options)
                    .then(async body => {
                        //body = JSON.parse(body);
                        await connection.beginTransaction();

                        if(body.code === '0000') {
                            //TODO: 사용자 포인트 차감
                            let order_no = body.result.result.orderNo;
                            let pin_no = body.result.result.pinNo;
                            let couponurl = body.result.result.couponImgUrl;


                            await connection.query("INSERT INTO tb_gs_shop(`user_code`,`state`,`goodsName`,`goodsCode`,`realprice`,`point`,`orderno`,`tr_id`,`pin_no`,`pinurl`,`goodsImgS`,`gendate`,`enddate`)VALUES(?,1,?,?,?,?,?,?,?,?,?,now(),DATE_ADD(now(),INTERVAL 30 DAY));", [user_code,goods[0].goodsName,goods_id,goods[0].realPrice,goods[0].price,order_no,tr_id,pin_no,couponurl,goods[0].goodsImgS]);

                            await gameUtil.updateUserPoint(conn, user_code, -goods[0].price, 0, goods[0].price);
                            await gameUtil.addPointHistory(conn, user_code, -goods[0].price, 0, 0,settings.POINT_TYPE_CHICKEN_STORE_BUY);

                            returnValues["value"] = {};
                            returnValues["code"] = statusCodes.CODE_SUCCESS;
                            returnValues["reason"] = "success.";
                        } else {
                            returnValues["value"] = {};
                            returnValues["code"] = statusCodes.CODE_ERR_USER_ALERT;
                            returnValues["reason"] = body.code+" 관리자에게 문의하세요";
                        }

                        await connection.commit();

                        connection.release();

                        res.status(200)
                            .json(returnValues)
                            .end();

                    })
                    .catch(async err => {

                        await connection.rollback();

                        connection.release();

                        returnValues["value"] = {tr_id:tr_id};
                        returnValues["code"] = statusCodes.CODE_ERR_OTHERS;
                        returnValues["reason"] = err.toString();

                        res.status(200)
                            .json(returnValues)
                            .end();
                    });

            } catch (err) {
                await connection.rollback();
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });
});



// 상품 보관함
router.post('/gift/my/goods/:session_key', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let session_key = req.params.session_key;


    if (!session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }

    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;

                let rows = await connection.query('SELECT user_code FROM tb_session WHERE session_key=?', [session_key]);
                if(rows.length === 0) throw new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "can't find login info.", 500);
                let user_code =  rows[0].user_code;

                rows = await connection.query('SELECT idx,user_code,state,goodsName,goodsCode,realprice,point,orderno,tr_id,pin_no,goodsImgS,pinurl,gendate,enddate FROM tb_gs_shop where state = 1 and user_code=?;', [user_code]);

                returnValues["value"] = {list:rows};
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success.";

                connection.release();

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });
});


// 모바일 쿠폰 핀 상태 조회
router.get('/gift/epin/status/:tr_id', (req, res, next) => {
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let tr_id = req.params.tr_id;

    if (!tr_id) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }

    const options = {
        method: "GET",
        //uri: `${settings.STORE_BASE_URL}/StatusEpin?cid=${settings.STORE_USER_ID}&enc=${enc}&order_id=${order_id}`,
        //https://bizapi.giftishow.com/bizApi/coupons?api_code=0201&custom_auth_code=REAL0de2c265e7c34b0396b316e472aa14dd&custom_auth_token=2Oxs9RFQDepp3xSBQ9Y06A==&dev_yn=N&tr_id=1_1576197261720
        uri:`${settings.GIFT_STORE_BASE_URL}/coupons?api_code=0201&custom_auth_code=${settings.GIFT_STORE_CODE}&custom_auth_token=${settings.GIFT_STORE_TOKEN}&dev_yn=N&tr_id=${tr_id}`,
        json: true
    };

    rp(options)
        .then(body => {

            console.log(body);
            if(body.code === '0000') {

                returnValues["value"] = {
                    result: body.result
                };
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success";

            } else {
                returnValues["value"] = {};
                returnValues["code"] = statusCodes.CODE_ERR_USER_ALERT;
                returnValues["reason"] = body.code+" 관리자에게 문의하세요";
            }

            res.status(200)
                .json(returnValues)
                .end();

        })
        .catch( err => {

            returnValues["value"] = {};
            returnValues["code"] = statusCodes.CODE_ERR_OTHERS;
            returnValues["reason"] = "request error.";

            res.status(200)
                .json(returnValues)
                .end();
        });


});


// 모바일 쿠폰 상태 사용으로 변경
router.post('/gift/epin/status/update/:tr_id', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let tr_id = req.params.tr_id;
    let session_key = req.body.session_key;

    if (!tr_id || !session_key) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }



    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;

                let rows = await connection.query('SELECT user_code FROM tb_session WHERE session_key=?', [session_key]);
                if(rows.length === 0) throw new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "can't find login info.", 500);

                await connection.query("INSERT INTO `chicken`.`tb_gs_shop_log`(`user_code`,`goodsCode`,`td_id`,`check`,`gendate`)VALUES(?,?,?,3,now());", [rows[0].user_code,"",tr_id]);

                await connection.query('UPDATE tb_gs_shop SET state=3 WHERE tr_id=?', [tr_id]);

                returnValues["value"] = {};
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "success.";

                connection.release();

                res.status(200)
                    .json(returnValues)
                    .end();


            } catch (err) {
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });

});



// 상품 구매 취소
router.post('/gift/refund/goods/:tr_id', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB
    };

    let tr_id = req.params.tr_id;
    let session_key = req.body.session_key;

    if (!session_key || !tr_id) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
    }


    pool.getConnection()
        .then(async conn => {
            try {
                connection = conn;
                await connection.beginTransaction();

                let rows = await connection.query('SELECT user_code FROM tb_session WHERE session_key=?', [session_key]);
                if(rows.length === 0) throw new CMError(statusCodes.CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER, "can't find login info.", 500);
                let user_code =  rows[0].user_code;

                rows = await connection.query('SELECT idx, point, goodsName, goodsCode FROM tb_gs_shop WHERE user_code=? AND tr_id=? AND state=1', [user_code, tr_id]);

                let idx = rows[0].idx;
                let point = rows[0].point;
                let goodsCode = rows[0].goodsCode;
               // let brand_name = rows[0].brand_name;

                await connection.query("INSERT INTO `chicken`.`tb_gs_shop_log`(`user_code`,`goodsCode`,`td_id`,`check`,`gendate`)VALUES(?,?,?,2,now());", [user_code,goodsCode,tr_id]);

                const options = {
                    method: "GET",
                    //uri: `${settings.STORE_BASE_URL}/CancelEpin?cid=${settings.STORE_USER_ID}&enc=${enc}&order_id=${order_id}`,
                    uri:`${settings.GIFT_STORE_BASE_URL}/cancel?api_code=0202&custom_auth_code=${settings.GIFT_STORE_CODE}&custom_auth_token=${settings.GIFT_STORE_TOKEN}&dev_yn=N&tr_id=${tr_id}&&user_id=${settings.GIFT_STORE_ID}`,
                    //https://bizapi.giftishow.com/bizApi/cancel?api_code=0202&custom_auth_code=REAL0de2c265e7c34b0396b316e472aa14dd&custom_auth_token=2Oxs9RFQDepp3xSBQ9Y06A==&dev_yn=N&tr_id=1_1576201359844&user_id=skylsc1004@naver.com
                    json: true
                };

                rp(options)
                    .then(async body => {

                        if(body.code === '0000') {

                            //TODO: 사용자 포인트 복구
                            //  await connection.query('INSERT INTO tb_point_his (reg_date, user_code, point, type, msg) VALUES(now(), ?, ?, ?, ?)', [user_code, point, settings.POINT_HISTORY_TYPE_SHOP_REFUND, etc]);
                            await connection.query('UPDATE tb_point SET point = point+? WHERE user_code=?', [point, user_code]);
                            await connection.query('UPDATE tb_gs_shop SET state=2 WHERE tr_id=?', [tr_id])

                            await gameUtil.addPointHistory(conn, user_code, point, 0,0, settings.POINT_TYPE_CHICKEN_STORE_BUY_CANCEL);

                            returnValues["value"] = {};
                            returnValues["code"] = statusCodes.CODE_SUCCESS;
                            returnValues["reason"] = "success.";
                        } else {
                            returnValues["value"] = {};
                            returnValues["code"] = statusCodes.CODE_ERR_USER_ALERT;
                            returnValues["reason"] =  body.code+" 관리자에게 문의하세요";
                        }

                        await connection.commit();

                        connection.release();

                        res.status(200)
                            .json(returnValues)
                            .end();

                    })
                    .catch(async err => {

                        await connection.rollback();

                        connection.release();

                        returnValues["value"] = {
                        };
                        returnValues["code"] = statusCodes.CODE_ERR_OTHERS;
                        returnValues["reason"] = "request error.";

                        res.status(200)
                            .json(returnValues)
                            .end();
                    });


            } catch (err) {
                await connection.rollback();
                doCatch(connection, err, next);
            }

        })
        .catch(err => {
            doCatch(connection, err, next);
        });
});

module.exports = router;

