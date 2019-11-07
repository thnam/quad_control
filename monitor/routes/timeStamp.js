const express = require('express');
const router = express.Router();
const channels = require(global.appRoot + "/utils/channels");

router.get('/timeStamp', function(req, res) {
  channels.date.addClient(req, res);
});

module.exports = router;
