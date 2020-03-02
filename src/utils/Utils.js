import _ from 'underscore';
import crypto from "crypto";
import moment from "moment";
import settings from "../conf/settings";
import config from "../Config"

class Utils {
    constructor() {
    }

    /**
     * @public
     * @desc 값의 존재 여부를 체크 한다. 체크 대상은 undefined, null, NaN 이다.
     * @param value undefined, null, NaN 을 체크할 값
     * @returns {boolean} undefined, null, NaN 이 아니면 true 를 리턴 한다.
     */
    isExist(value) {
        return !_.isUndefined(value) && !_.isNull(value) && !_.isNaN(value);
    }

    toDateFormat(date, format) {
        return moment(date).format(format);
    }

    numberWithCommas(number) {
        if (number && number.toString()) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        return "0";
    };


    CodeEncryptAES (data, key) {
        const cipher = crypto.createCipher('aes-256-cbc', key);
        let result = cipher.update(data, 'utf8', 'base64'); // 'HbMtmFdroLU0arLpMflQ'
        result += cipher.final('base64'); // 'HbMtmFdroLU0arLpMflQYtt8xEf4lrPn5tX5k+a8Nzw='
        return result;

    };

    EncryptAES (data) {
        const cipher = crypto.createCipher('aes-256-cbc', config.SERVER_KEY);
        let result = cipher.update(data, 'utf8', 'base64'); // 'HbMtmFdroLU0arLpMflQ'
        result += cipher.final('base64'); // 'HbMtmFdroLU0arLpMflQYtt8xEf4lrPn5tX5k+a8Nzw='
        return result;


    };

    DecryptAES (data) {
        const decipher = crypto.createDecipher('aes-256-cbc', config.SERVER_KEY);
        let result2 = decipher.update(data, 'base64', 'utf8'); // 암호화할문 (base64, utf8이 위의 cipher과 반대 순서입니다.)
        result2 += decipher.final('utf8'); // 암호화할문장 (여기도 base64대신 utf8)
        return result2;
    };

    //단방향 암호화 key = 암호화된 pw, salt = 암화화를 위한 키
    MakeCryptedPassword (data) {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(64, (err, buf) => {
                crypto.pbkdf2(data, buf.toString('base64'), 100000, 64, 'sha512', (err, key) => {
                    if(err) {
                        return reject(err);

                    }

                    const result = {key: key.toString('base64'), salt: buf.toString('base64')};
                    return resolve(result);
                });
            })
        });
    };

    //단방향 암호화 확인
    ResolvePassword (data, salt) {
        return new Promise((resolve, reject) => {

            crypto.pbkdf2(data, salt, 100000, 64, 'sha512', (err, key) => {
                //console.log(key.toString('base64') === '기존 비밀번호');
                if(err) {
                    return reject(err);
                }
                return resolve(key.toString('base64'));
            });

        });
    };

    //아이템 type에 따른 key
    getItemKey(type) {
        if(type === settings.ITEM_SHOVEL) {
            return "shovel";
        } else if(type === settings.ITEM_PICKAX) {
            return "pickax";
        } else if(type === settings.ITEM_DRILL) {
            return "drill";
        } else if(type === settings.ITEM_HAMMER) {
            return "hammer";
        }
    }

    //임의 정수
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    //가중치 임의 정수 숫자가 낮을수록 나올 확률이 높다.
    getWeightedRandomInt(min, max) {
        return Math.round(max / (Math.random() * max + min));
    }

    // sha-256 해시
    // 광물 요청에 사용된 code.session_key 조합 체크
    getHashedCode(str) {
        return crypto.createHash('sha256').update(str).digest('hex');
    }
}

export default Utils;