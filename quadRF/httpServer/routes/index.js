var express = require('express');
var router = express.Router();
const config = require('config');

// Get homepage.
router.get('/',	function(req, res, next){
	res.render('index', {
		title: 'Express',
		config: config
	});
});

module.exports = router;