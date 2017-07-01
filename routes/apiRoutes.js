var express = require("express");

var router = express.Router();

router.get("/api/test", function(req, res) {
	res.json(req.user);
});

module.exports = router;