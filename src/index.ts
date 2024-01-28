import { exec } from 'child_process';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

export interface ExtractOptions {
  /**
   * Portion of the page to analyze. Example: "269.875,12.75,790.5,561".
   * Accepts top,left,bottom,right i.e. y1,x1,y2,x2 where all values are in points relative to the top left corner.
   * If all values are between 0-100 (inclusive) and preceded by '%', input will be taken as % of actual height or width of the page.
   * Example: "%0,0,100,50". To specify multiple areas, pass an array.
   * Default is entire page.
   */
  area?: string | string[];

  /**
   * X coordinates of column boundaries. Example "10.1,20.2,30.3".
   * If all values are between 0-100 (inclusive) and preceded by '%', input will be taken as % of actual width of the page.
   * Example: "%25,50,80.6"
   */
  columns?: string;

  /**
   * Output format: (CSV,TSV,JSON). Default: CSV
   */
  format?: 'CSV' | 'TSV' | 'JSON';

  /**
   * Guess the portion of the page to analyze per page.
   */
  guess?: boolean;

  /**
   * Force PDF to be extracted using lattice-mode extraction (if there are ruling lines separating each cell, as in a PDF of an Excel spreadsheet)
   */
  lattice?: boolean;

  /**
   * [Deprecated in favor of -t/--stream] Force PDF not to be extracted using spreadsheet-style extraction (if there are no ruling lines separating each cell)
   */
  noSpreadsheet?: boolean;

  /**
   * Comma separated list of ranges, or all. Examples: "1-3,5-7", --pages 3 or "all". Default is "1"
   */
  pages?: string | 'all';

  /**
   * Password to decrypt document. Default is empty
   */
  password?: string;

  /**
   * Force PDF to be extracted using stream-mode extraction (if there are no ruling lines separating each cell)
   */
  stream?: boolean;

  /**
   * Use embedded line returns in cells. (Only in spreadsheet mode.)
   */
  useLineReturns?: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const libPath = path.resolve(
  __dirname,
  'lib',
  'tabula-1.0.5-with-dependencies.jar'
);

/**
 * Asynchronously extracts tables from a PDF file.
 *
 * @param {string} filePath - The path to the PDF file from which to extract tables.
 * @param {ExtractOptions} options - The options to use when extracting tables.
 * @returns {Promise<string>} A promise that resolves with the extracted tables.
 */
export async function extractTables(
  filePath: string,
  options?: ExtractOptions
) {
  const args = Object.entries(options || {}).flatMap(([key, value]) => {
    key =
      '--' + key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

    if (typeof value === 'boolean') {
      return value ? [key] : [];
    } else if (Array.isArray(value)) {
      return value.flatMap((v) => [key, v]);
    } else {
      return [key, value];
    }
  });

  const command = `java -jar ${libPath} ${args.join(' ')} ${filePath}`;

  return new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr));
      resolve(stdout);
    });
  });
}
