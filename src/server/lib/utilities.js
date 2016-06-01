var fs = require('fs');

exports.createFile = function(file, data, cb) {
    fs.writeFile(file, data, 'utf8', function(err) {
        if (err) {
            console.error('There was an error creating the file:' + file + '  ' + err);
            return;
        }

        if (typeof cb === 'function') {
        	cb();
    	}
    });

}
