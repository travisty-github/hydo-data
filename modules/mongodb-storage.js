(function() {

  var mongojs = require('mongojs');

  function MongoDBStorage() {
    this.test = "test";
  }


  MongoDBStorage.prototype.connect = function(url) {
    this.db = mongojs(url, ['lakes']);
  };

  MongoDBStorage.prototype.close = function() {
    this.db.close();
  };

  MongoDBStorage.prototype.saveLakeData = function(lakeData, callback) {
    console.log('Updating records...');

    var mongoLakeNames = null;
    var completedUpdates = 0;
    var numUpdates = 0;
    // Track each completed update.
    function completedUpdate() {
      completedUpdates++;
      if (completedUpdates >= numUpdates) {
        console.log('Updates complete.');
        callback();
      }
    }

    var self = this;

    // Get all the existing lakes and store the object id.
    this.db.lakes.find({}, {
      'name': '$name'
    }, function(err, data) {
      if (err) {
        throw new Error(err);
      }
      mongoLakeNames = data;
      doUpdates(self);
    });

    // Callback function for when query has finished to get all lake names.
    function doUpdates(self) {
      //Check each lake name in the data and see if it is already stored.
      // If not generate a new objectId and store it in mongoLakeNames, increment
      // the number of updates required and insert the document.
      lakeData.forEach(function(lake) {
        var match = mongoLakeNames.filter(function(mongoLake) {
          return mongoLake.name === lake.name;
        });
        if (match.length === 0) {
          var newLake = {
            _id: mongojs.ObjectId(),
            name: lake.name,
            capacity: lake.capacity
          };
          numUpdates++;
          mongoLakeNames.push(newLake);
          self.db.lakes.insert(newLake, completedUpdate);
        }
      });

      // Add updates for each historical level
      lakeData.forEach(function(lake) {
        numUpdates += lake.historicalLevels.length;
      });



      // Update records
      lakeData.forEach(function(lake) {
        lake.historicalLevels.forEach(function(dataPoint) {

          var lakeId = (mongoLakeNames.filter(function(mongoName) {
            return mongoName.name === lake.name;
          }))[0]._id;

          self.db.lakes.update({
            lakeId: lakeId,
            level: dataPoint.level,
            date: new Date(dataPoint.date)
          }, {
            lakeId: lakeId,
            level: dataPoint.level,
            date: new Date(dataPoint.date)
          }, {
            upsert: true
          }, function(err, data) {
            if (err) throw new Error(err);
            completedUpdate();
          });
        });

      });
    }

  };

  module.exports = new MongoDBStorage();

}());
