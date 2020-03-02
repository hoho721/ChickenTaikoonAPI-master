import Utils from "./Utils"
import Logger from "./Logger"
import CMSqlHelper from "./CMSqlHelper"
/**
 * @public
 * @desc Utils Class의 Singletone object
 * @type {Utils}
 */
export const utils = new Utils();

export const logger = new Logger();

export const SQLHelper = new CMSqlHelper();
