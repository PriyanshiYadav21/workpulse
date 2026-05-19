const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const teams = require('../controllers/team.controller');

router.use(authRequired);

router.get('/', teams.listTeams);
router.post('/', teams.createTeam);
router.get('/:id', teams.getTeam);
router.post('/:id/members', teams.inviteMember);
router.delete('/:id/members/:userId', teams.removeMember);

module.exports = router;
