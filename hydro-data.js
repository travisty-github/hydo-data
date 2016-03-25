var fs = require('fs');
var configLoader = require('./modules/config-loader');
var parseExcel = require('./modules/parse-excel');

// Check minimum number of arguments
if (process.argv.length < 2) {
  console.log("Incorrect number of arguments. Usage: hydro-data <filename>");
  process.exit(1);
}

// Load configuration file. If it fails exit.
try {
  var config = configLoader('config.json');
} catch (err) {
  console.log(err);
  process.exit(1);
}

// Get file to load from command line
var fileName = process.argv[2];

// Check we can read the file. If not error and exit.
try {
  fs.accessSync(fileName, fs.R_OK, function(err) {
    console.log('Cannot read file' + fileName);
    process.exit(1);
  });
} catch (err) {
  console.log('File ' + fileName + ' not found.');
  console.log(err);
  process.exit(1);
}

// Parse file
var lakeLevels = parseExcel(fileName, config);

// Write output file.
fs.writeFileSync('out.json', JSON.stringify(lakeLevels));
