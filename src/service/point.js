import express from "express"
import statusCodes from '../conf/statusCodes'
import CMError from "../CMError";
import {SQLHelper, utils} from "../utils/index"
import { errHandler, userUtil, sessionUtil } from "./utils";

const pool = SQLHelper.createPool();
const router = express.Router();

/*
* 내 포인트 정보 불러오기
* */
router.get('/my/:session_key', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB,
        reason:""
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

                let point = await userUtil.getPointInfo(conn, user_code);

                returnValues["value"] = {
                    ...point
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
