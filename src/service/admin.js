import express from "express"
import statusCodes from '../conf/statusCodes'
import settings from "../conf/settings"
import shortid from "shortid"
import CMError from "../CMError";
import {SQLHelper, utils} from "../utils/index"
import { errHandler, adminUtil } from "./utils";
import Config from "../Config";

const pool = SQLHelper.createPool();
const router = express.Router();

/*
* 업체 추가
* */
router.post('/company/:server_key', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB,
        reason:""
    };

    let server_key = req.params.server_key;
    let name = req.body.name;
    let days = req.body.days;
    let chicken_count = req.body.chicken_count;
    let level = req.body.level;
    let deposit = req.body.deposit;
    let penalty = req.body.penalty;
    let min_grade = req.body.min_grade

    if (!server_key || !name || !days || !chicken_count || !level || !deposit || !penalty || !min_grade) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    if(server_key !== Config.SERVER_KEY) {
        next(new CMError(statusCodes.CODE_ERR_INVALID_ACCESS, "server key is invalid.", 400));
        return;
    }

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;

                let idx = await adminUtil.addCompany( conn, name, days, chicken_count, level, deposit, penalty, min_grade );
                returnValues["value"] = {
                    idx: idx
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
*  게임 아이템 추가
* */
router.post('/item/store', (req, res, next) => {
    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB,
        reason:""
    };

    let server_key = req.body.server_key;
    let name = req.body.name;
    let description = req.body.description;
    let type = req.body.type;
    let price = req.body.price;

    if (!server_key || !name || !description || !type || !price) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    if(server_key !== Config.SERVER_KEY) {
        next(new CMError(statusCodes.CODE_ERR_INVALID_ACCESS, "server key is invalid.", 400));
        return;
    }

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;

                let idx = await adminUtil.addItem( conn, name, description, type, price );
                returnValues["value"] = {
                    idx: idx
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
*  연구 목록 추가
* */
router.post('/development/add', (req, res, next) => {
    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB,
        reason:""
    };

    let server_key = req.body.server_key;
    let type = req.body.type;
    let name = req.body.name;
    let price = req.body.price;
    let max_level = req.body.max_level;

    if (!server_key || !name || !type || !price || !max_level) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    if(server_key !== Config.SERVER_KEY) {
        next(new CMError(statusCodes.CODE_ERR_INVALID_ACCESS, "server key is invalid.", 400));
        return;
    }

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;

                let idx = await adminUtil.addDevelopment( conn, type, name, price, max_level );
                returnValues["value"] = {
                    idx: idx
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


// 닭 종류 추가
router.post('/add/chicken', (req, res, next) => {
    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB,
        reason:""
    };

    let server_key = req.body.server_key;
    let type = req.body.type;
    let name = req.body.name;
    let grade = req.body.grade;
    let type_name = req.body.type_name;

    if (!server_key || !name || !type || !grade || !type_name) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    if(server_key !== Config.SERVER_KEY) {
        next(new CMError(statusCodes.CODE_ERR_INVALID_ACCESS, "server key is invalid.", 400));
        return;
    }

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;

                let idx = await adminUtil.addChicken( conn, grade, name, type, type_name );
                returnValues["value"] = {
                    idx: idx
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

module.exports = router;
