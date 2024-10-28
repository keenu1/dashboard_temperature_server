require('dotenv').config();
const express = require('express');
const app = express();
const { db } = require("./src/model/dbConnection");
const cron = require('node-cron');
const { generateUtcDateStringWithRandomNumber } = require('./src/function');
const io = require("socket.io")(3002, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});

app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

io.on("connection", (socket) => {
    console.log('connected!');

    let temperatureCronJob;

    socket.on("getTemperatureData", () => {
        const fetchTemperatureData = async () => {
            const currentDate = new Date();
            const mockData = generateUtcDateStringWithRandomNumber();

            try {
                const insertQuery = "INSERT INTO temperature (value, created_at) VALUES (?, STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%sZ'))";
                await new Promise((resolve, reject) => {
                    db.query(insertQuery, [mockData.randomNumber, mockData.utcDateString], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

                const selectQuery = `SELECT  value, created_at FROM (
                    SELECT id,value, DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at  FROM temperature ORDER BY id DESC LIMIT 10
                ) AS last_five ORDER BY id ASC;`;
                const result = await new Promise((resolve, reject) => {
                    db.query(selectQuery, [], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

                socket.emit("timezone_data", { status: true, data: result });
            } catch (err) {
                console.error("Error fetching temperature data:", err);
                socket.emit("timezone_data", { status: false, message: "Server error" });
            }
        };

        // Start the cron job every 5 seconds
        temperatureCronJob = cron.schedule('*/5 * * * * *', fetchTemperatureData);
    });

    socket.on("disconnect", () => {
        console.log('disconnected');
        // Stop the cron job when the user disconnects
        if (temperatureCronJob) {
            temperatureCronJob.stop();
            console.log("Cron job stopped due to disconnection.");
        }
    });

    socket.emit("test", "Connected!");
});

const basePath = process.env.BASE_PATH;

// Auth
app.use(
    `${basePath}/data`,
    require("./src/pages/dashboard/index")
);



app.use((req, res) => {
    const output = { status: false, message: "Router not found" };
    res.status(200).send(output);
});

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export the app for testing
module.exports = app; // Export the app instance for testing
