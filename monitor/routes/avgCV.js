const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");

router.get('/', async (req, res, next) => {
    period = 30;
    npoints = 2880;
    const th = await dbTool.getAvgCV(period, npoints);
    res.send(th);
});

module.exports = router;
