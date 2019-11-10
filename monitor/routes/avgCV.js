const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");

router.get('/', async (req, res, next) => {
    period = 60;
    npoints = 20;
    const th = await dbTool.getAvgCV(period, npoints);
    res.send(th);
});

module.exports = router;
