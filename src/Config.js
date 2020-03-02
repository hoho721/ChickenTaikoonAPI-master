const path = require("path");
let config = require("dotenv").config({path: path.join(__dirname, "../.env.development")}).parsed;

export default {
    LOG_LEVEL:                      config.LOG_LEVEL,

    DB_HOST:                        config.MYSQL_HOST1,
    DB_PORT:                        Number(config.MYSQL_PORT1),
    DB_USER:                        config.MYSQL_USER1,
    DB_PASS:                        config.MYSQL_PASS1,
    DB_NAME:                        config.MYSQL_DB_NAME1,
    DB_POOL_CONN_LIMIT:             Number(config.MYSQL_CONNECTION_POOL_COUNT),

    PROJECT_DIR:                    __dirname,
    SERVER_KEY:                     config.SERVER_KEY,
    HASH_KEY:                       config.HASH_KEY,

    SERVER_PORT:                    config.HTTP_PORT,
};