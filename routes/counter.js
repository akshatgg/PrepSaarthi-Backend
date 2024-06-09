const express = require("express");
const { updateCount } = require("../controllers/counterController");
const router = express.Router();

router.route("/api/update-counts").post(updateCount)

module.exports = router;