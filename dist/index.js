"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const db_1 = require("./db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requireBody = zod_1.z.object({
        username: zod_1.z.string(),
        password: zod_1.z.string().min(2)
    });
    const parsedSuccess = requireBody.safeParse(req.body);
    if (!parsedSuccess.success) {
        return res.json({
            message: "You have been signed up"
        });
    }
    const username = req.body.username;
    const password = req.body.password;
    try {
        const existingUser = yield db_1.userModel.findOne({
            $or: [{ username }]
        });
        if (existingUser) {
            return res.status(409).json({
                message: "User with this username already exists"
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        console.log(hashedPassword);
        yield db_1.userModel.create({
            username: username,
            password: hashedPassword
        });
        res.status(201).json({
            message: "User created successfully",
        });
    }
    catch (e) {
        console.error("Error during signup:", e);
        res.status(500).json({
            message: "An internal server error occurred"
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    const user = yield db_1.userModel.findOne({
        username: username
    });
    //This creates a security vulnerability called user enumeration. An attacker can use this to figure out which usernames are valid in your system. They can try thousands of usernames, and every time they get the "Username does not exist" message, they know it's a dead end. But when they finally get a different response, they know they've found a real user's account to attack.
    // if(!user) {
    //     return res.json({
    //         message : "Username does not exist"
    //     })
    // }
    // MORE SECURE CODE
    if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
        // This runs if the user is not found OR the password doesn't match
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user._id.toString()
    }, config_1.JWT_SECRET);
    res.json({
        "token": token
    });
}));
app.post("/api/v1/content", middleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const link = req.body.link;
    const title = req.body.title;
    yield db_1.contentModel.create({
        link,
        title,
        //@ts-ignore
        userId: req.userId,
        tags: []
    });
    res.json({
        message: "Content has been added"
    });
}));
app.get("/api/v1/content", middleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore 
    const userId = req.userId;
    const content = yield db_1.contentModel.find({
        userId: userId
    }).populate("userId", "username");
    res.json({
        content
    });
}));
app.delete("/api/v1/content/:id", middleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.params.id;
    //@ts-ignore
    const UserId = req.userId;
    yield db_1.contentModel.deleteOne({
        _id: contentId,
        userId: UserId
    });
    res.json({
        message: "Content deleted"
    });
}));
app.post("api/v1/brain/share", (req, res) => {
});
app.get("api/v1/brain/:shareLink", (req, res) => {
});
app.listen(3000);
