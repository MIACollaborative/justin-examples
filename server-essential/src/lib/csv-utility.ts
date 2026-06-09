import * as fs from 'fs';
import Papa from 'papaparse';
import { createLogger } from '@justin-consortium/core';

const Log = createLogger({ context: { source: "csv-utility" } });

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
      throw new Error('CSV parsing errors occurred: ' + results.errors.map((e: Papa.ParseError) => e.message).join('; '));
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