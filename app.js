require("dotenv").config();
require("./config/connection");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const feedsRouter = require("./routes/feeds");
const categoriesRouter = require("./routes/categories.route");
const { errorHandler } = require("./middlewares/errorHandler");

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/feeds", feedsRouter);
app.use("/categories", categoriesRouter);
app.use(errorHandler);

module.exports = app;
