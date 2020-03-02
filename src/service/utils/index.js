import ErrorHandler from "./ErrorHandler"
import UserUtil from "./UserUtil";
import SessionUtil from "./SessionUtil";
import CommUtil from "./CommUtil";
import AdminUtil from "./AdminUtil";
import GameUtil from  "./GameUtil";
import DevUtil from  "./DevUtil";
import ChickenUtil from './ChickenUtil';

export const errHandler = new ErrorHandler();
export const userUtil = new UserUtil();
export const sessionUtil = new SessionUtil();
export const commonUtil = new CommUtil();
export const adminUtil = new AdminUtil();
export const gameUtil = new GameUtil();
export const devUtil = new DevUtil();
export const chickenUtil = new ChickenUtil();