require('dotenv').config();
const express = require('express');
const app = express();
const db = require("./src/model/dbConnection");
const cron = require('node-cron');
const { generateUtcDateStringWithRandomNumber } = require('./src/function');
const http = require('http');

const PORT = process.env.PORT;
const PORT2 = process.env.PORT2;

// Create the server instance using the HTTP module so can has same port
const server = http.createServer(app);

// Socket.IO setup
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

// Middleware for cache control
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

// Socket connection handling
io.on("connection", (socket) => {
    //check if connected
    // console.log('connected!');
    let temperatureCronJob;

    //when client emit the getTemperatureData
    socket.on("getTemperatureData", () => {
        const fetchTemperatureData = async () => {
            const mockData = generateUtcDateStringWithRandomNumber();
            //insert and select the 5 data from database
            try {
                const insertQuery = "INSERT INTO temperature (value, created_at) VALUES (?,?)";
                await db.query(insertQuery, [mockData.randomNumber, mockData.utcDateString]);

                const selectQuery = `SELECT value, created_at FROM (
                    SELECT id, value, created_at  FROM temperature ORDER BY id DESC LIMIT 10
                ) AS last_five ORDER BY id ASC;`;
                const [result] = await db.query(selectQuery);

                socket.emit("timezone_data", { status: true, data: result });
            } catch (err) {
                console.error("Error fetching temperature data:", err);
                socket.emit("timezone_data", { status: false, message: "Server error" });
            }
        };

        // Start the cron job every 5 seconds
        temperatureCronJob = cron.schedule('*/5 * * * * *', fetchTemperatureData);
    });

    //when socket disconnect stop cron
    socket.on("disconnect", () => {
        //check if discconnected
        // console.log('disconnected');
        if (temperatureCronJob) {
            temperatureCronJob.stop();
            console.log("Cron job stopped due to disconnection.");
        }
    });

    socket.emit("test", "Connected!");
});

const basePath = process.env.BASE_PATH;

// Auth route for the dashboard
app.use(`${basePath}/data`, require("./src/pages/dashboard/index")(db)); // Pass the db connection

//check routing
app.get(`${basePath}/test`, (req, res) => {
    res.send({ status: true, message: "API data route working!" });
});

// Start listening for incoming connections on the same server instance
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle 404 responses
app.use((req, res) => {
    const output = { status: false, message: `Router not found ${req.method} ${req.path}` };
    res.status(200).send(output);
});

// Export the app for testing
module.exports = app;
