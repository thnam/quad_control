var express = require('express');
var router = express.Router();

router.get('/', async(req, res, next) => {
  try {
    const currentMode = await require(global.appRoot + "/utils/dbTools").getPulseMode();
    res.json(currentMode);
  } catch (e) {
    next (e);
  }
});

module.exports = router;
