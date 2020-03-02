import express from "express"
import statusCodes from '../conf/statusCodes'
import CMError from "../CMError";
import {SQLHelper, utils} from "../utils/index"
import { errHandler, userUtil, sessionUtil, commonUtil } from "./utils";
import rand from "random";
import CommUtil from "./utils/CommUtil";

const pool = SQLHelper.createPool();
const router = express.Router();

/*
* 로그인
* */
router.post('/login', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB,
        reason:""
    };

    let uid = req.body.uid;
    let upw = req.body.upw;

    if (!uid || !upw) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;

                let userInfo = await commonUtil.getLoginInfo(conn, uid);

                let {salt, idx, code , tmp_age,age,gender,gendate} = userInfo;
                let encryptedUpw = userInfo.upw;
                let checkPw = await utils.ResolvePassword(upw, salt);

                if(checkPw !== encryptedUpw) {
                    throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "비밀번호가 일치하지 않습니다.", 500);
                }

                await sessionUtil.updateSessionKey(conn, idx);

                let session_info = await sessionUtil.findSessionKey(conn, idx);

                if(session_info.access_state === 1)
                {
                    throw new CMError(statusCodes.CODE_ERR_USER_ALERT, "접속이 제한되었습니다. 관리자에게 문의해주세요.", 500);
                }

                //

                if(tmp_age == null)
                {
                    tmp_age = 20;
                    if(age == 10)
                    {
                        tmp_age = rand.int(14, 20);
                    }else if(age == 20)
                    {
                        tmp_age = rand.int(20, 30);
                    }else if(age == 30)
                    {
                        tmp_age = rand.int(30, 40);
                    }else if(age == 40) {
                        tmp_age = rand.int(40, 50);
                    }
                    await commonUtil.settmpage(conn, idx,tmp_age);
                }


                //

                returnValues["value"] = {
                    session_key: session_info.session_key,
                    code: code,
                    age: tmp_age,
                    gender: gender+1,
                    user_code : idx,
                    email : uid,
                    gendate : gendate
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
*   푸시 토큰 업데이트
* */
router.post('/push/token', (req, res, next) => {
    let connection;
    let returnValues = {
        value:{},
        code: statusCodes.CODE_SUCCESS,
        reason:"success"
    };

    let session_key = req.body.session_key;
    let token = req.body.token;

    if (!session_key || !token) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;

                let user_code = await sessionUtil.getUserCode(conn, session_key);

                // 포시 토큰 업데이트
                await commonUtil.updatePushInfo(conn, user_code, token);

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
