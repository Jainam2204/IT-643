const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');

router.post("/", reportController.reportUser);
router.get("/has-reported/:reportedUserId", reportController.hasReportedUser);
router.get("/my-stats", auth, reportController.getMyReportStats);
module.exports = router;