var express = require("express");
var router = express.Router();


/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});

/* Users login */
router.get("/login", function(req, res, next){
	res.render("users_login");
	// res.send("this is users login ing");
});

/* Users register */
router.get("/signup", function(req, res, next){
	res.render("users_signup");
});

module.exports = router;
