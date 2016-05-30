var express = require('express');
var config = require('../config');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('login', {title: config.getTitle()});
});

module.exports = router;
