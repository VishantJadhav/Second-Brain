"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const UserMiddleware = (req, res, next) => {
    const token = req.headers["authorization"];
    const decode = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
    if (decode) {
        //@ts-ignore
        req.userId = decode.userId;
        next();
    }
    else {
        res.status(403).json({
            message: "You are not logged in"
        });
    }
};
exports.UserMiddleware = UserMiddleware;
