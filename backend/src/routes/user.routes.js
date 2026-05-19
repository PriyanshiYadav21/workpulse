const router = require('express').Router();
const { authRequired, requireRole } = require('../middleware/auth');
const users = require('../controllers/user.controller');

router.use(authRequired);

// Admin-only: list all users
router.get('/', requireRole('admin'), users.listUsers);

// Admin-only: manage users (promote/demote, delete)
router.delete('/:id', requireRole('admin'), users.deleteUser);
router.patch('/:id/role', requireRole('admin'), users.setRole);

router.patch('/me', users.updateProfile);
router.post('/me/password', users.changePassword);

module.exports = router;
