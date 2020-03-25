const express = require('express');
const router = express.Router();

const webhookRouter = require('./webhook');
router.use('/webhook', webhookRouter);

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
