const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const auth = require("../middleware/auth");
const router = express.Router();

// const app = express();

// app.use(auth);

//User registration
router.post("/users", async (req, res) => {
    // Create a new user
    console.log("Request body: ", req.body);
    try {
        const user = new User(req.body);
        //await ensure that the user is being save before generating the token
        await user.save();
        console.log("Saved user: ", JSON.stringify(user));
        const token = await user.generateAuthToken();
        res.status(201).send({ email: user.email, token });
    } catch (err) {
        console.log(err.stack);
        res.status(500).send({ error: err.message });
    }
});

//User login
router.post("/users/login", async (req, res) => {
    //Login a registered user
    try {
        let { email, password } = req.body;
        let user = await User.findByCredentials(email, password);
        if (!user) {
            return res.status(401).send({ error: "Login failed!" });
        }
        const token = await user.generateAuthToken();
        res.send({ email, token });
    } catch (err) {
        console.log(err.stack);
        res.status(400).send({ error: err.message });
    }
});

//auth middleware as one of the parameter in router.get
//then the request will pass through the auth middleware first before getting into the router logic
router.get("/users/profile", auth, async (req, res) => {
    let user = await User.findById(req.user._id);
    if(user){
        res.json(user);
    }else{
        res.status(404).send("User not found");
    }
    // res.send(token);
    // res.send(`Profile: ${JSON.stringify(req.user)} `);
});

module.exports = router;