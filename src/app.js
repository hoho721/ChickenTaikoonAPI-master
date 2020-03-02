const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const {logger} = require('./utils/index');
const bodyParser = require('body-parser');
const useragent = require('express-useragent');
const helmet = require('helmet');
const utf8 = require('utf8');
const cors = require('cors');

const statusCodes = require('./conf/statusCodes');
const memberRouter = require('./service/member');
const pointRouter = require('./service/point');
const gameRouter = require('./service/game');
const commonRouter = require('./service/common');
const adminRouter = require('./service/admin');
const storeRouter = require('./service/store');

const log = logger.getLogger();
const app = express();

app.use(helmet());
app.use(cors());
app.use(useragent.express());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
app.use(express.static('uploads'));

//뷰 엔진 설정
/*app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');*/

app.all('/*', function (req, res, next) {
    log.info(`REQ:${req.url}`);
    next();
});

app.get('/favicon.ico', (req, res) => {
    res.sendStatus(204);
});

app.use('/service/member', memberRouter);
app.use('/service/point', pointRouter);
app.use('/service/game', gameRouter);
app.use('/service/common', commonRouter);
app.use('/service/admin', adminRouter);
app.use('/service/store',storeRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {

    console.log(err);
    const isCMErr = err.name === "CMError",
        reason = isCMErr ? err.reason : "failed",
        code = isCMErr ? err.code : statusCodes.CODE_ERR_OTHERS,
        httpCode = isCMErr ? 200 : 500;

    log.error(`CODE:${code} - HTTP CODE:${httpCode} - REASON:${reason}`);

    res.status(httpCode)
        .json({
            value: {},
            code: code,
            reason: reason
        })
        .end();
});

module.exports = app;
