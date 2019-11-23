const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");

router.get('/', async (req, res, next) => {
  // console.log(req.body);
  const lastSpark = await dbTool.getSparkHistory(20);
  if (lastSpark.length >= 0) 
    res.send(lastSpark);
  else 
    res.sendStatus(404);
});

module.exports = router;
