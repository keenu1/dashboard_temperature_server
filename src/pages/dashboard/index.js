const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

// Accept db as a parameter because on deployment cannot read the db so parse as parameter
module.exports = (db) => {
    router.get("/", upload.none(), async (req, res) => {
        //select 5 data from data base
        try {
            const selectQuery = `SELECT value, created_at FROM (
                SELECT id, value, created_at FROM temperature ORDER BY id DESC LIMIT 10
            ) AS last_five ORDER BY id ASC`;

            const [result] = await db.query(selectQuery);
            res.status(200).send({ status: true, data: result });
        } catch (err) {
            console.error("Error fetching temperature data:", err);
            res.status(500).send({ status: false, error: "Database query failed." });
        }
    });

    return router; // Return the router instance
};
