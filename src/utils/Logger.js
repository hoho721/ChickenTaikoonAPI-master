import winston from 'winston';
import moment from 'moment';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../Config';
import path from 'path';
import fs from 'fs';

const logFormat = winston.format.printf(info => {
   return `${info.timestamp} ${info.level.toUpperCase()} ${info.message}`
});

function timeStampFormat() {
    var dates = moment.utc().format('YYYY-MM-DD HH:mm:ss');

    return moment(dates).local('kr').format('YYYY-MM-DD HH:mm:ss');
}

class Logger {
    constructor() {
        this.mkdirSync(path.join(config.PROJECT_DIR, "../log"));

        this.log = winston.createLogger(
            {
                level: "info",
                format: winston.format.combine(
                    winston.format.timestamp({
                        format: 'MM/DD HH:mm:ss.SSS'
                    }),
                    logFormat
                ),

                transports: [
                    new winston.transports.Console({stderrLevels: ["error", "warn"], colorize: true}),
                    /*new winston.transports.File({ filename: path.join(config.PROJECT_DIR, "../log/error.log"), level: 'error' }),
                    new winston.transports.File({ filename: path.join(config.PROJECT_DIR, "../log/combined.log")}),*/
                    new DailyRotateFile({
                        name: 'info-file',
                        filename: `${path.join(config.PROJECT_DIR, '../log/combined')}/%DATE%-combined.log`,
                        datePattern: 'YYYY-MM-DD',
                        maxSize: '20m',
                        maxFiles: '14d',
                        level: 'info',
                        showLevel: true,
                        timestamp: timeStampFormat
                    }),
                    new DailyRotateFile({
                        name: 'error-file',
                        filename: `${path.join(config.PROJECT_DIR, '../log/error')}/%DATE%-error.log`,
                        datePattern: 'YYYY-MM-DD',
                        maxSize: '20m',
                        maxFiles: '14d',
                        level: 'error',
                        showLevel: true,
                        timestamp: timeStampFormat
                    })
                ]
            }
        );


        this.log.log({
            level: 'info',
            message: '[Logger - constructor]'
        });
    }

    mkdirSync(dirPath) {
        try {
            fs.mkdirSync(dirPath);
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }
    }

    getLogger() {
        return this.log;
    }
}

export default Logger;