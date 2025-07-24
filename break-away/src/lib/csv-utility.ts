import * as fs from 'fs';
import * as Papa from 'papaparse'; 
import { Log } from 'justin-core';

const parseCSVFile = async (filePath: string): Promise<object[]> => {
  try {
    const csvFileContent = fs.readFileSync(filePath, 'utf8');

    const results = Papa.parse<object>(csvFileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (results.errors.length > 0) {
      Log.error('Errors encountered during CSV parsing:', results.errors);
      throw new Error('CSV parsing errors occurred: ' + results.errors.map(e => e.message).join('; '));
    }
    return results.data;

  } catch (error) {
    Log.error(`Failed to read or parse CSV file at ${filePath}:`, error);
    throw error;
  }
}

export const CSVUtility =  {
    parseCSVFile
};