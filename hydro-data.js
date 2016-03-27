var fs = require('fs');
var configLoader = require('./modules/config-loader');
var program = require('commander');
var parseExcel = require('./modules/parse-excel');
var MongoDBStorage = require('./modules/mongodb-storage');
MongoDBStorage.connect('mongodb://localhost:27017/hydro-data');

program
  .version('0.0.1')
  .description('Parse Hydro Tasmania system storage data spreadsheet.')
  .option('-i, --in-file [filename]', 'Source data file.')
  .option('-o, --out-file [filename]', 'Write parsed data to a file.')
  .option('-m, --mongodb [url]', 'Store parsed data in MongoDB database.')
  .parse(process.argv);

if (!program.inFile) {
  console.log('Source data file required.');
  process.exit(1);
}

if (!(program.outFile || program.mongodb)) {
  console.log('Must specify either an output file or MongoDB connection.');
  process.exit(1);
}

// Load configuration file. If it fails exit.
try {
  var config = configLoader('config.json');
} catch (err) {
  console.log(err);
  process.exit(1);
}

// Check we can read the file. If not error and exit.
try {
  fs.accessSync(program.inFile, fs.R_OK, function(err) {
    console.log('Cannot read file' + program.inFile);
    process.exit(1);
  });
} catch (err) {
  console.log('File ' + program.inFile + ' not found.');
  console.log(err);
  process.exit(1);
}

// Parse file
var lakeLevels = parseExcel(program.inFile, config);

var complete = function() {
  MongoDBStorage.close();
  process.exit(0);
};

MongoDBStorage.saveLakeData(lakeLevels, complete);

// Write output file.
fs.writeFileSync('out.json', JSON.stringify(lakeLevels));
