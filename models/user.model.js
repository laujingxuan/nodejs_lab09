const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcryptjs");

//A Mongoose model is a wrapper on the Mongoose schema. A Mongoose schema defines the structure of the document, default values, validators, etc., whereas a Mongoose model provides an interface to the database for creating, querying, updating, deleting records, etc.

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        //cast email to lowercase before storing to database
        lowercase: true,
        validate: (value) => {
            if (!validator.isEmail(value)) {
                throw new Error({ error: "Invalid Email address" });
            }
        },
    },
    password: { type: String, required: true, minlength: 5 },
    roles: { type: [{ type: String }], default: ["user"] },
});

//a function that get an object and spread it into id, email and roles
const getJwtBody = ({ _id, email, roles }) => ({ _id, email, roles });

//adding instance method
schema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user(current object)
    const user = this;
    const token = jwt.sign(getJwtBody(user), process.env.JWT_KEY, {
        expiresIn: process.env.JWT_EXP,
    });
    return token;
};

//adding static methods
schema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error({ error: "Invalid login credentials" });
    }
    //compare encrypted password
    const isMatched = await bcrypt.compare(password, user.password);
    // const isMatched = password === user.password;
    if (!isMatched) {
        throw new Error({ error: "Invalid login credentials" });
    }
    return user;
};

schema.pre("save", async function (next) {
    // Hash the password before saving the user model
    const user = this;
    //isModified will only return true if you are changing the password.
    //means will only be triggered if password is changed/reset
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

//error message for sign up error that is easier to understand 
schema.post("save", function (error, doc, next) {
    if (error.name === "MongoError" && error.code === 11000) {
        next(new Error("Email already registered"));
    } else {
        next(error);
    }
});

//collection name in mongodb is users
const User = mongoose.model("User", schema, "users");

module.exports = User;