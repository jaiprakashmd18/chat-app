const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, banUser, makeAdmin, deleteUser, getReports, resolveReport, getGroups } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:userId/ban', banUser);
router.put('/users/:userId/admin', makeAdmin);
router.delete('/users/:userId', deleteUser);
router.get('/reports', getReports);
router.put('/reports/:id', resolveReport);
router.get('/groups', getGroups);

module.exports = router;
