import express from "express"
import statusCodes from '../conf/statusCodes'
import settings from "../conf/settings"
import shortid from "shortid"
import CMError from "../CMError";
import {SQLHelper, utils} from "../utils/index"
import {errHandler, userUtil, sessionUtil, gameUtil, chickenUtil} from "./utils";

const pool = SQLHelper.createPool();
const router = express.Router();


/*
* 아이디 중복 체크
*
* - uid : 아이디
*
* */
router.get('/check/uid/:uid', (req, res, next) => {

    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB,
        reason:""

    };

    let uid = req.params.uid;


    if (!uid) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    uid = uid.replace(/\s/gi, "");

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let exist = await userUtil.isExistUid(conn, uid);

                returnValues["value"] = {
                    isExist: exist
                };
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = exist ? "이미 존재하는 아이디 입니다." : "사용 가능한 아이디 입니다.";


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
*  닉네임 중복 확인
* */
router.get('/check/nick/:nick', (req, res, next) => {
    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_ERR_DB,
        reason:""

    };

    let nick = req.params.nick;


    if (!nick) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }


    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;
                let exist = await userUtil.isExistNick(conn, nick);

                returnValues["value"] = {
                    isExist: exist
                };
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = exist ? "이미 존재하는 닉네임 입니다." : "사용 가능한 닉네임 입니다.";


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
*  사용자 정보 추가
* */
router.post('/add/user', (req, res, next) => {
    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_SUCCESS,
        reason:""
    };

    let uid = req.body.uid;
    let upw = req.body.upw;
    let gender = req.body.gender;
    let age = req.body.age;
    let nick = req.body.nick;
    let joinType = req.body.joinType;

    joinType = !joinType ? settings.JOIN_TYPE_NORMAL : settings.JOIN_TYPE_GOOGLE;

    if (!uid || !upw || !gender || !age || !nick) {
        next(new CMError(statusCodes.CODE_ERR_PARAMS, "wrong parameter.", 400));
        return;
    }

    uid = uid.replace(/\s/gi, "");

    pool.getConnection()
        .then(async conn => {
            try {

                connection = conn;

                let pwEncResult = await utils.MakeCryptedPassword(upw);

                const key = pwEncResult.key;
                const salt = pwEncResult.salt;
                const code = shortid.generate();

                await connection.beginTransaction();
                let insertId = await userUtil.addUserInfo(conn, uid, key, nick, salt, code, joinType, gender, age);
                // 세션키 생성
                await sessionUtil.genSessionKey(conn, insertId);
                let session_key = await sessionUtil.findSessionKey(conn, insertId);

                // 사용자 포인트.
                await userUtil.makeUserPointInfo(conn, insertId);

                // 사용자 건물
                await userUtil.makeUserBuildingInfo(conn, insertId);

                // 연구 추가
                for(let i=1;i<=8;i++)
                {
                    await userUtil.makeUserDevelopmentInfo(conn, insertId, i);
                }

                await gameUtil.food_service(conn, insertId)

                //미션 기본 정보 추가
                await gameUtil.user_misison_log_insert(conn, insertId);


                // 계란 테이블
                await userUtil.makeUserEggTable(conn, insertId);

                // 저장고 상태
                await chickenUtil.genStorage(conn, insertId);

                // 업데이트 시간 수정
                await chickenUtil.updateDateUpdate(conn, insertId);

                await connection.commit();

                returnValues["value"] = {
                    session_key: session_key.session_key,
                    code: code
                };
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "";


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
*   사용자 정보 불러오기
* */
router.get('/my/info/:session_key', (req, res, next) => {
    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_SUCCESS,
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

                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let userInfo = await userUtil.getUserInfo(conn, user_code);

                returnValues["value"] = {
                    ...userInfo
                };
                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "";

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
*    회원 탈퇴
* */
router.get('//:session_key', (req, res, next) => {
    let connection;
    let returnValues = {
        value:{},
        code:statusCodes.CODE_SUCCESS,
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

                let user_code = await sessionUtil.getUserCode(conn, session_key);
                let userInfo = await userUtil.getUserInfo(conn, user_code);

                returnValues["value"] = {
                    ...userInfo
                };

                returnValues["code"] = statusCodes.CODE_SUCCESS;
                returnValues["reason"] = "";

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
