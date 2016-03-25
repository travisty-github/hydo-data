fs = require('fs');

var configLoader = function(configFile) {

  try {
    fs.accessSync(configFile, fs.R_OK, function(err) {
      console.log('Cannot read configuration file' + configFile);
      process.exit(1);
    });
  } catch (err) {
    console.log('Configuration file ' + configFile + ' not found.');
    console.log(err);
    throw new Error('Could not find configuration file ' + configFile);
  }

  var data = fs.readFileSync(configFile);

  var config = null;
  try {
    config = JSON.parse(data);
  } catch (err) {
    console.log('Failed to parse configuration file.');
    console.log(err);
    throw new Error('Could not parse configuration file.');
  }

  return config;
};

module.exports = configLoader;
