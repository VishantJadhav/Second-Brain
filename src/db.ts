
import mongoose, { Schema, model } from "mongoose";

mongoose.connect("mongodb+srv://Vishant:TestPassword123@cluster0.72foyin.mongodb.net/")

const userSchema = new Schema ({
    username : {
        type : String,
        unique : true
    },
    password : {
        type : String,
        required : true
    }
})

export const userModel = model("users", userSchema);

const contentSchema = new Schema ({

    title : String,
    link : String,
    tags : [{type : mongoose.Types.ObjectId, ref: 'Tag'}],
    userId : {type : mongoose.Types.ObjectId, ref: 'users', required : true}

})

export const contentModel = model("content", contentSchema);