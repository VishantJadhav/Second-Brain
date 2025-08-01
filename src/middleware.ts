import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config"

export const UserMiddleware = (req : Request, res : Response, next : NextFunction) => {

    const token = req.headers["authorization"];

    const decode = jwt.verify(token as string , JWT_SECRET);

    if(decode) {
        //@ts-ignore
        req.userId = decode.userId
        next()
    } else {
        res.status(403).json({
            message : "You are not logged in"
        })
    }

}