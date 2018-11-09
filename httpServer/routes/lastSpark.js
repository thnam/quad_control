const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");

router.get('/', async (req, res, next) => {
  const lastSpark = await dbTool.getLastSpark();
  if (lastSpark.length == 1) 
    res.send(lastSpark[0]);
  else 
    res.sendStatus(404);
});

module.exports = router;
