const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const n = require('../controllers/notification.controller');

router.use(authRequired);

router.get('/', n.listNotifications);
router.post('/:id/read', n.markRead);
router.post('/read-all', n.markAllRead);

module.exports = router;
