var utils = require('../lib/utilities.js'),
    fs = require('fs'),
    _ = require('lodash'),
    parent = '/../',
    data = 'data/',
    dataStore = 'options.json',
    db = parent + data + dataStore;

/**
 * Read all options from data store
 */
exports.all = function(cb) {
    var fileName = __dirname + db;

    // read the db file
    fs.readFile(fileName, 'utf8', function(err, data) {
        if (err) {
            // deal with the operational failure directly
            if (err.code === 'ENOENT') {
                /**
                 * Note: I gather that this is not good practice and that
                 *       an edge case like this would warrant a view-model
                 *       where both objects are consolidated only for a 
                 *       specific view.
                 */
                var options = __dirname + '/../data/options_20140310.js',
                    prices = __dirname + '/../data/option_prices_20140310.js';

                getFileContents([options, prices], mergeObjects);

            } else {
                console.error('There was an error reading the file:' + fileName + '  ' + err);
            }
        }

        if (!err) {
            cb(err, JSON.parse(data));
        }
    });


    function getFileContents(arr, cb) {
        var obj = [],
            len = arr.length;

        for (var i = 0; i < len; i++) {
            obj.push(JSON.parse(fs.readFileSync(arr[i], 'utf8')));
        }

        cb(obj);
    }


    function mergeObjects(obj) {
        var objA = obj[0],
            objB = obj[1],
            consolidated = objA;

        _.set(consolidated, 'base_price', _.get(objB, 'base_price'));  

        _(objA.options)
            .keys()
            .each(function(id) {
                var price = objB.options[id];
                if (price) {
                    consolidated.options[id] = _.mergeWith(objA.options[id], objB.options[id], function(objValue, srcValue) {
                        if (!isNaN(objValue) && !isNaN(srcValue) && objValue < srcValue) {
                            return srcValue; 
                        } else {
                            return objValue;
                        }
                    });
                }
            });

        // sort the object
        var sorted = _.orderBy(consolidated.options, ['price'], ['desc']),
            i = 0;
        for (key in consolidated.options) {
            if (consolidated.options.hasOwnProperty(key)) {
                consolidated.options[key] = sorted[i];
                i++;
            }
        }

        consolidated = JSON.stringify(consolidated)

        // store the contents of the new object in a file to use later
        utils.createFile('./src/server/' + data + dataStore, consolidated);

        cb(null, JSON.parse(consolidated)); 
    }

};
