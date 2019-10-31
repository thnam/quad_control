const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");

router.get('/', async (req, res, next) => {
    const lastCV = await dbTool.getLastCV();
    res.send(lastCV[0]);
    // console.log(lastCV);
});

module.exports = router;
