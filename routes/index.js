const express = require('express');
const router = express.Router();

const webhookRouter = require('./webhook');
router.use('/webhook', webhookRouter);

router.get('/', function (req, res, next) {
  res.send("404 Not Found");
});

module.exports = router;
