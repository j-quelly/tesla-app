var express = require('express'),
    router = express.Router(),
    Option = require('../models/option');


/**
 * GET all options
 */
router.all('/', function(req, res, next) {
    Option.all(function(err, options) {
        if (err) {
            res.send(err);
        }

        res.json(options);
    });
});

module.exports = router;
