const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authenticateJWT, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    let userId = req.user ? (req.user._id || req.user.id) : null;
    if (!userId) {
      const citizen = await User.findOne({ role: 'citizen' });
      userId = citizen ? citizen._id : null;
    }

    const filter = userId ? { recipient: userId } : {};
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = userId
      ? await Notification.countDocuments({
          recipient: userId,
          read: false,
        })
      : 0;

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/:id/read', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: userId },
      { read: true },
      { new: true }
    );
    res.json({ success: true, notification: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/read-all', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.updateMany({ recipient: userId }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: userId });
    res.json({ success: true, message: 'Notification removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
