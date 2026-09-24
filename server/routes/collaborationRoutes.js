const express = require('express');
const router = express.Router();
const {
  createCollaboration,
  getProjectCollaborations,
  getMyCollaborations,
  updateCollaborationStatus,
} = require('../controllers/collaborationController');
const { authenticateJWT, requireRoles } = require('../middleware/auth');

router.get('/my', authenticateJWT, getMyCollaborations);
router.get('/project/:projectId', getProjectCollaborations);
router.post('/', authenticateJWT, requireRoles('industry', 'admin'), createCollaboration);
router.patch('/:id/status', authenticateJWT, requireRoles('university', 'student', 'admin'), updateCollaborationStatus);

module.exports = router;
