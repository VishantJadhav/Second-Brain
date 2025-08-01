import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { contentModel, userModel } from "./db";
import bcrypt from 'bcrypt';
import { JWT_SECRET } from './config';
import { UserMiddleware } from "./middleware";


const app = express();

app.use(express.json());

app.post("/api/v1/signup", async(req, res) => {

    const requireBody =  z.object({
        username : z.string(),
        password : z.string().min(2)
    })

    const parsedSuccess = requireBody.safeParse(req.body)

    if(!parsedSuccess.success) {
        return res.json({
            message : "You have been signed up"
        })
    }

    const username = req.body.username;
    const password = req.body.password;

    try {

         const existingUser = await userModel.findOne({
            $or: [{ username }]
        });

        if (existingUser) {
            
            return res.status(409).json({
                message: "User with this username already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

            await userModel.create({
            username : username,
            password : hashedPassword
            })

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
})


app.post("/api/v1/signin", async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const user = await userModel.findOne({
        username : username
    })

    //This creates a security vulnerability called user enumeration. An attacker can use this to figure out which usernames are valid in your system. They can try thousands of usernames, and every time they get the "Username does not exist" message, they know it's a dead end. But when they finally get a different response, they know they've found a real user's account to attack.
    // if(!user) {
    //     return res.json({
    //         message : "Username does not exist"
    //     })
    // }

    // MORE SECURE CODE
    if (!user || !(await bcrypt.compare(password, user.password))) {
    // This runs if the user is not found OR the password doesn't match
        return res.status(401).json({ 
            message: "Invalid username or password"
        });
    }

    const token = jwt.sign({
        userId : user._id.toString()
    }, JWT_SECRET);

    res.json({
        "token" : token
    })
})








app.post("/api/v1/content", UserMiddleware, async (req, res) => {

    const link = req.body.link;
    const title = req.body.title;

    await contentModel.create({
        link,
        title,
        //@ts-ignore
        userId : req.userId,
        tags : []

    })

    res.json({
        message : "Content has been added"
    })

})

app.get("/api/v1/content", UserMiddleware, async (req, res) => {

    //@ts-ignore 
    const userId = req.userId;
    const content = await contentModel.find({
        userId : userId
    }).populate("userId", "username");

    res.json({
        content
    })

}) 

app.delete("/api/v1/content/:id", UserMiddleware, async (req, res) => {

    const contentId = req.params.id;

    //@ts-ignore
    const UserId = req.userId;

    await contentModel.deleteOne({
        _id: contentId,
        userId: UserId
    })

    res.json({
        message : "Content deleted"
    })

})

app.post("api/v1/brain/share", (req, res) => {

})

app.get("api/v1/brain/:shareLink", (req, res) => {

})

app.listen(3000);