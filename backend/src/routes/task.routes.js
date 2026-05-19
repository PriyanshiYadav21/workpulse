const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const upload = require('../middleware/upload');
const tasks = require('../controllers/task.controller');
const comments = require('../controllers/comment.controller');
const attachments = require('../controllers/attachment.controller');

router.use(authRequired);

router.get('/', tasks.listTasks);
router.post('/', tasks.createTask);
router.post('/reorder', tasks.reorder);
router.get('/:id', tasks.getTask);
router.patch('/:id', tasks.updateTask);
router.delete('/:id', tasks.deleteTask);

router.get('/:taskId/comments', comments.listComments);
router.post('/:taskId/comments', comments.addComment);
router.delete('/comments/:id', comments.deleteComment);

router.get('/:taskId/attachments', attachments.listAttachments);
router.post('/:taskId/attachments', upload.single('file'), attachments.uploadAttachment);
router.delete('/attachments/:id', attachments.deleteAttachment);

module.exports = router;
