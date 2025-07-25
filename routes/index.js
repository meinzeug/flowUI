const express = require('express');
const router = express.Router();
const { testPost } = require('../controllers/testController');
const { register, login } = require('../controllers/authController');
const { getProfile } = require('../controllers/profileController');
const { getStatus } = require('../controllers/statusController');
const { listUsers } = require('../controllers/usersController');
const auth = require('../middlewares/auth');

router.post('/auth/register', register);
router.post('/auth/login', login);

router.get('/status', getStatus);

router.get('/users', auth, listUsers);

router.get('/profile', auth, getProfile);

router.post('/test', auth, testPost);

router.all('/', (req, res) => res.status(405).json({ error: 'Method Not Allowed' }));

module.exports = router;
