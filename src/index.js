var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import shell from 'shelljs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const libPath = path.resolve(__dirname, 'lib', 'tabula-1.0.5-with-dependencies.jar');
/**
 * Asynchronously extracts tables from a PDF file.
 *
 * @param {string} filePath - The path to the PDF file from which to extract tables.
 * @param {ExtractOptions} options - The options to use when extracting tables.
 * @returns {Promise<string>} A promise that resolves with the extracted tables.
 */
export function extractTables(filePath, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = Object.entries(options || {}).flatMap(([key, value]) => {
            key = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
            if (typeof value === 'boolean') {
                return value ? [`--${key}`] : [];
            }
            else if (Array.isArray(value)) {
                return value.flatMap((v) => [`--${key}`, v]);
            }
            else {
                return [`--${key}`, value];
            }
        });
        const command = `java -jar ${libPath} ${args.join(' ')} ${filePath}`;
        return new Promise((resolve, reject) => {
            const result = shell.exec(command, { silent: true });
            result.code !== 0
                ? reject(new Error(result.stderr))
                : resolve(result.stdout);
        });
    });
}
