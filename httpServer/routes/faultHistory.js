const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");

router.get('/', async (req, res, next) => {
  const lastFaults = await dbTool.getFaultHistory(20);
  if (lastFaults.length >= 0) 
    res.send(lastFaults);
  else 
    res.sendStatus(404);
});

module.exports = router;
