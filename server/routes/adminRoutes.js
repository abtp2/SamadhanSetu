const express = require('express');
const router = express.Router();
const {
  getVerificationQueue,
  verifyChallenge,
  getUniversities,
  createUniversity,
  getOrganizations,
  createOrganization,
} = require('../controllers/adminController');
const { authenticateJWT, requireRoles } = require('../middleware/auth');

router.get('/verification-queue', authenticateJWT, requireRoles('admin'), getVerificationQueue);
router.patch('/verify/:id', authenticateJWT, requireRoles('admin'), verifyChallenge);
router.get('/universities', getUniversities);
router.post('/universities', authenticateJWT, requireRoles('admin'), createUniversity);
router.get('/organizations', getOrganizations);
router.post('/organizations', authenticateJWT, requireRoles('admin'), createOrganization);

module.exports = router;
