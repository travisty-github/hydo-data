var fs = require('fs');
var configLoader = require('./modules/config-loader');
var program = require('commander');
var parseExcel = require('./modules/parse-excel');
var MongoDBStorage = require('./modules/mongodb-storage');

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

// Callback for MongoDB update.
var complete = function() {
  MongoDBStorage.close();
  process.exit(0);
};

if (program.outFile) {
  // Write output file.
  fs.writeFileSync(program.outFile, JSON.stringify(lakeLevels));
}

// If data is to be stored in MongoDB, the complete() callback will exit the
// program. Otherwise we can just exit straight away.
if (program.mongodb) {
  MongoDBStorage.connect(program.mongodb);
  MongoDBStorage.saveLakeData(lakeLevels, complete);
} else {
  process.exit(0);
}
