(function() {

  function parseExcel(fileName, config) {

    var xlsx = require('xlsx');
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

    return lakeLevels;
  }

  module.exports = parseExcel;

}());
