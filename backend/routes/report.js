const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post("/", reportController.reportUser);
router.get("/has-reported/:reportedUserId", reportController.hasReportedUser);

module.exports = router;