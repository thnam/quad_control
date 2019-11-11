const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");

router.get('/', async (req, res, next) => {
  console.log(req.query);
  period = Number(req.query.period);
  npoints = Number(req.query.npoints);
  const th = await dbTool.getAvgCV(period, npoints);
  res.send(th);
});

module.exports = router;
