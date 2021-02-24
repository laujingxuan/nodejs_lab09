const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const auth = async (req, res, next) => {
    //Bearer <token> was sent in get request's header authorization
    const token = req.header("Authorization").replace("Bearer","").trim();
    console.log("Token: ", token);
    try {
        //(Asynchronous) If a callback is supplied, function acts asynchronously. The callback is called with the decoded payload if the signature is valid and optional expiration, audience, or issuer are valid. If not, it will be called with the error.
        const data = jwt.verify(token, process.env.JWT_KEY);
        console.log("Verified: ", data);
        req.user_id = data._id;
        req.token = token;

        const user = await User.findOne({ _id: data._id });
        if (!user) {
            throw new Error();
        }
        req.user = user;
        next();
        // //if verification successful, the data will be returned
        // jwt.verify(token, process.env.JWT_KEY, (err,data) => {
        //     if (err){
        //         res.status(401).send(err.message);
        //     }else{
        //         //dont straight away send data return from jwt, should retrieve the user data instead
        //         User.findById(data._id, (err, user) => {
        //             if (user){
        //                 res.json(user);
        //             }else{
        //                 res.status(404).send("User not found");
        //             }
        //         });            
        //     }
        // })        
    } catch (error) {
        console.log(JSON.stringify(error));
        console.log(error.stack);
        res.status(401).send({ error: "Not authorized to access this resource" });
    }

};

module.exports = auth;