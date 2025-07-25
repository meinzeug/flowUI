const express = require('express');
const router = express.Router();
const { testPost } = require('../controllers/testController');
const { register, login } = require('../controllers/authController');
const { getProfile } = require('../controllers/profileController');
const { getStatus } = require('../controllers/statusController');
const { listUsers } = require('../controllers/usersController');
const { logActivity, listLogs, clearLogs } = require('../controllers/hiveController');
const { createProject, listProjects } = require('../controllers/projectsController');
const { executeWorkflow } = require('../controllers/workflowsController');
const auth = require('../middlewares/auth');

router.post('/auth/register', register);
router.post('/auth/login', login);

router.get('/status', getStatus);

router.get('/profile', auth, getProfile);
router.get('/users', auth, listUsers);

router.post('/test', auth, testPost);
router.post('/hive/log', auth, logActivity);
router.get('/hive/logs', listLogs);
router.delete('/hive/logs', auth, clearLogs);
router.post('/projects', auth, createProject);
router.get('/projects', auth, listProjects);
router.post('/workflows/:id/execute', auth, executeWorkflow);

router.all('/', (req, res) => res.status(405).json({ error: 'Method Not Allowed' }));

module.exports = router;
