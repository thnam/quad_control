const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");

router.get('/', async (req, res, next) => {
  const pulserStatus = await dbTool.getPulserStatus();
  res.json(pulserStatus);
});

module.exports = router;
