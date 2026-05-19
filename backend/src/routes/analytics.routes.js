const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const a = require('../controllers/analytics.controller');

router.use(authRequired);
router.get('/overview', a.overview);

module.exports = router;
