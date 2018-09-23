const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");

router.get('/', async (req, res, next) => {
  const cv = await dbTool.getCV();
  res.json(cv);
});

module.exports = router;
