const express = require('express');
const router = express.Router();
const { testPost } = require('../controllers/testController');
const { register, login } = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.post('/auth/register', register);
router.post('/auth/login', login);

router.post('/test', auth, testPost);

router.all('/', (req, res) => res.status(405).json({ error: 'Method Not Allowed' }));

module.exports = router;
