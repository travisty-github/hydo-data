# Hydro Data
Parses Hydro Tasmania Dam levels spreadsheet to JSON format. Data can be
found at <http://www.hydro.com.au/water/energy-data>

## Usage
### Installation
Install required node modules:
```bash
npm install
```
### Running hydro-data
```bash
node hydro-data.js <spreadsheet filename>
```
The program will write the JSON data to `out.json`.
### Configuration
Configuration is stored in `config.json`. This defines which cells contain the relevant data for parsing:
* Which columns contain lakes (`column`) and where to get their names from (`nameRows`)
* Which row contains the full storage level for each lake (`fullStorageRow`)
* Which row contains the beginning of the historical levels (`firstDataRow`)
* Which column contains the dates (`dateColumn`). This column is also used to determine the extent of the data (i.e. how many rows of data are available).
