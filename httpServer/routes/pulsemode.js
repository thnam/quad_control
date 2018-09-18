var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', async(req, res, next) => {
  try {
    const currentMode = await getPulseModeFromDB();
    res.json(currentMode);
  } catch (e) {
    next (e);
  }
});

module.exports = router;
