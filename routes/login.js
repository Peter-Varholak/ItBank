var express = require('express');
var config = require('../config');
var db = require("../server/database/dbHandler");
var clientData = require("../server/database/data_objects/clientData");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: config.getTitle() });
});

router.post('/', function(req, res){
  var username = req.body.username;
  var pass = req.body.password;

  db.login(username, pass, function(result){
    if(typeof result == 'object') {
      res.render('main', { title: config.getTitle(), fullName: result.getFullName() });
    } else {
      var response = {
        type : "loginError",
        errorCode  : result
      };

      res.end(JSON.stringify(response));
    }
  });
});

module.exports = router;