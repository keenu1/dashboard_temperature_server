const express = require("express");
const router = express.Router();
const { db } = require("../../model/dbConnection"); // Assuming you have a separate file for database connection and export the db object
const multer = require("multer");
var cron = require('node-cron');
const upload = multer();

// const io = require("socket.io")(3002, {
//     cors: {
//         origin: "http://localhost:3000", // adjust this if your frontend is on another port
//         methods: ["GET", "POST"],
//     }
// });
// io.on("connection", (socket) => {
//     console.log("Connected");
//     socket.emit("test", "Connected!");
// });


router.get("/", upload.none(), async (req, res) => {
    try {
        const selectQuery = `SELECT  value, created_at FROM (
            SELECT id, value, DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at  FROM temperature ORDER BY id DESC LIMIT 10
        ) AS last_five ORDER BY id ASC;`;
        const result = await new Promise((resolve, reject) => {
            db.query(selectQuery, [], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        res.status(200).send({ status: true, data: result });

    } catch (err) {
        console.error("Error fetching temperature data:", err);
        socket.emit("timezone_data", { status: false, message: "Server error" });
    }

    // cron.schedule('*/5 * * * * *', () => {
    //     console.log('running a task every 5 seconds');
    //     io.emit("update", "Message from server every 5 seconds");
    // });



});

module.exports = router;
