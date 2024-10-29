const express = require("express");
const router = express.Router();
const { db } = require("../../model/dbConnection"); // Assuming you have a separate file for database connection and export the db object
const multer = require("multer");
var cron = require('node-cron');
const upload = multer();
console.log(db);


router.get("/", upload.none(), async (req, res) => {
    try {
        // Manually get a connection from the pool
        const connection = await db.getConnection();

        try {
            const selectQuery = `SELECT value, created_at FROM (
                SELECT id, value, created_at FROM temperature ORDER BY id DESC LIMIT 10
            ) AS last_five ORDER BY id ASC`;

            const [result] = await connection.query(selectQuery);
            res.status(200).send({ status: true, data: result });
        } finally {
            // Release the connection back to the pool
            connection.release();
        }
    } catch (err) {
        console.error("Error fetching temperature data:", err);
        res.status(500).send({ status: false, error: "Database query failed." });
    }
});



module.exports = router;
