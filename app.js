const express = require("express");
require("dotenv").config();
require("./models/db")
const app = express();
const userRouter = require("./routers/user.router");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(userRouter);

app.get("/", (req, res) => {
    res.send("Hello JWT");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});