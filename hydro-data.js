var fs = require('fs');
var xlsx = require('xlsx');
var configLoader = require('./modules/config-loader');

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

var workbook = xlsx.readFile(fileName);
var firstSheetName = workbook.SheetNames[0];
var worksheet = workbook.Sheets[firstSheetName];

// Find the last row in the date column
var columnARowNumbers = Object.getOwnPropertyNames(worksheet)
  .filter(function(item) {
    return /^A\d+$/.test(item);
  })
  .map(function(item) {
    return item.slice(1);
  });

var lastDataRow = Math.max(...columnARowNumbers);

// Build object containing lakes and their capacity levels
var lakeLevels = config.lakes.map(function(lake) {
  // Build name
  var name = "";
  lake.nameRows.forEach(function(nameRow) {
    if (name) {
      name += " / " + worksheet[this.column + nameRow].v;
    } else {
      name = worksheet[this.column + nameRow].v;
    }
  }, lake);
  // Remove * characters from titles.
  name = name.replace(/\*+/, '');

  // Build array of capacity levels
  var historicalLevels = [];
  for (var i = config.firstDataRow; i <= lastDataRow; i++) {
    historicalLevels.push({
      date: Date.parse(worksheet[config.dateColumn + i].w),
      level: worksheet[lake.column + i].v
    });

  }

  // Get maximum capacity (full storage level)
  var capacity = worksheet[lake.column + config.fullStorageRow].v;

  return {
    name: name,
    historicalLevels: historicalLevels,
    capacity: capacity
  };
});

fs.writeFileSync('out.json', JSON.stringify(lakeLevels));
