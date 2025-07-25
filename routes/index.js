const express = require('express');
const router = express.Router();
const { testPost } = require('../controllers/testController');

router.post('/test', testPost);

router.all('/', (req, res) => res.status(405).json({ error: 'Method Not Allowed' }));

module.exports = router;
