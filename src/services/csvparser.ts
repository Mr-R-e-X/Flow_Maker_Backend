import { bufferToStream } from "../controller/leadSource.controller.js";
import ApiError from "../utils/apiError.js";
import { getFileBufferFromCloudinary } from "../utils/uploadCloudinary.js";
import csv from "csv-parser";

// Improved type definition for row data to collect all fields
interface CsvRow {
  [key: string]: string; // This allows dynamic fields from the CSV
}

const parseBufferCsvToTable = async (publicId: string): Promise<CsvRow[]> => {
  try {
    const fileBuffer = await getFileBufferFromCloudinary(publicId);
    return new Promise<CsvRow[]>((resolve, reject) => {
      const rows: CsvRow[] = [];
      bufferToStream(fileBuffer)
        .pipe(csv())
        .on("data", (row) => {
          rows.push(row); // row is now dynamically typed
        })
        .on("end", () => {
          resolve(rows);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  } catch (err: any) {
    throw new ApiError(500, `Error parsing CSV: ${err.message}`);
  }
};

// Function to get all fields from the table
const getEmailsAndUsernamesFromTable = (table: CsvRow[]): CsvRow[] => {
  return table; // Simply return the whole table since it now includes all fields dynamically
};

export { parseBufferCsvToTable, getEmailsAndUsernamesFromTable };
