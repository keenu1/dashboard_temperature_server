const express = require("express");
const router = express.Router();
const { db } = require("../../model/dbConnection"); // Assuming you have a separate file for database connection and export the db object
const multer = require("multer");
var cron = require('node-cron');
const upload = multer();
console.log(db);



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
    }





});

module.exports = router;
