require("dotenv").config();
const express = require("express");
const app = express();

const logger = require("morgan");
const Sentry = require("./libs/sentry");

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

const PORT = 3000;
const web = require("./routes/web");
const api = require("./routes/api");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));
app.set("view engine", "ejs");

app.use("/", web);
app.use("/api/v1", api);

app.use(Sentry.Handlers.errorHandler());

app.use((err, req, res, next) => {
    res.status(500).json({ err: err.message });
});

app.use((req, res, next) => {
    res.status(404).json({ err: `Cannot ${req.method} ${req.url}` });
});

const server = require("http").createServer(app);
const io = require("socket.io")(server);
global.io = io;

io.on("connection", (socket) => {
    console.log("user connected");

    socket.on("disconnect", () => {
        console.log("user disconnect");
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`running on port ${PORT}`);
});

module.exports = app;
