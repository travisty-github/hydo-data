#!/bin/bash

DATA_PATH='http://www.hydro.com.au/system/files/water-storage/storage_summary-4.xls'
DATA_FILE='storage_summary-4.xls'
DATE_TODAY=`date +%Y-%m-%d`
DATABASE_URL='mongodb://localhost:27017/hydro-data'
FILE_ARCHIVE_FOLDER='./archive'

# If there is an existing data file remove it first
if [ -e "$DATA_FILE" ]
then
  printf "Removing existing data file.\n"1>&2
  rm "$DATA_FILE"
fi

# Get latest data file
if ! wget $DATA_PATH
then
  printf "Error retrieving data file. Exiting.\n"1>&2
  exit 1
fi

# Update
if ! node hydro-data.js --in-file "$DATA_FILE" --mongodb "$DATABASE_URL"
then
  printf "Error processing file. Exiting.\n"1>&2
  exit 1
fi

# Check there is not a file that exists with the same name as the archive folder
if [ -e "$FILE_ARCHIVE_FOLDER" ] && ! [ -d "$FILE_ARCHIVE_FOLDER" ]
then
  printf "A file exists with the name as the archive folder. Exiting.\n"1>&2
  exit 1;
fi

# Check whether archive subfolder exists and if not create it
if ! [ -d "$FILE_ARCHIVE_FOLDER" ]
then
  printf "Creating directory $FILE_ARCHIVE_FOLDER"
  if ! mkdir "$FILE_ARCHIVE_FOLDER"
  then
    printf "Failed to created archive folder. Exiting.\n"1>&2
    exit 1;
  fi
fi

# Move the file to the archive folder with a new name based on todays date
# Does not overwrite existing files
archive_filename=`echo "$DATA_FILE" | cut -d. -f1`
archive_extension=`echo "$DATA_FILE" | cut -d. -f2`
if ! mv -n "$DATA_FILE" "$FILE_ARCHIVE_FOLDER"/"$archive_filename"_"$DATE_TODAY"."$archive_extension"
then
  printf "Error moving file. Exiting.\n"1>&2
  exit 1
fi

# All done
printf "Done.\n"
exit 0
