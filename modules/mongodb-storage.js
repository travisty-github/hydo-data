(function() {

  var mongojs = require('mongojs');

  function MongoDBStorage() {}

  MongoDBStorage.prototype.connect = function(url) {
    this.db = mongojs(url, ['lakes']);
    console.log('Connected to ' + url);
  };

  MongoDBStorage.prototype.close = function() {
    this.db.close();
  };

  MongoDBStorage.prototype.saveLakeData = function(lakeData, callback) {
    var lakeNames = [];
    var completedUpdates = 0;

    console.log('Updating records...');

    function completedUpdate() {
      completedUpdates++;
      if (completedUpdates >= lakeData.length) {
        console.log('Updates complete.');
        callback();
      }
    }

    lakeData = lakeData.map(function(lake) {
      lake.historicalLevels = lake.historicalLevels.map(function(historicalLevel) {
        return {
          level: historicalLevel.level,
          date: new Date(historicalLevel.date)
        };
      });
      return lake;
    });

    // Update records
    lakeData.forEach(function(lake) {
      this.db.lakes.update({
        name: lake.name
      }, {
        name: lake.name,
        historicalLevels: lake.historicalLevels
      }, {
        upsert: true
      }, function(err, data) {
        completedUpdate();
      });

    }, this);

  };

  module.exports = new MongoDBStorage();

}());
