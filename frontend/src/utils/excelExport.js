import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Robustly exports data to an Excel file in the browser.
 * Handles the binary conversion to prevent file corruption.
 * 
 * @param {Array} data - Array of objects to export
 * @param {string} sheetName - Name of the worksheet
 * @param {string} fileName - Name of the file to save as (including .xlsx)
 */
export const exportToExcel = (data, sheetName, fileName) => {
    if (!data || data.length === 0) {
        console.warn("No data provided for Excel export");
        return;
    }

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, sheetName);

    /* Generate binary string */
    const wbout = xlsx.write(wb, { bookType: 'xlsx', type: 'binary' });

    /* Convert binary string to ArrayBuffer */
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) {
        view[i] = wbout.charCodeAt(i) & 0xFF;
    }

    /* Create Blob with correct MIME type */
    const blob = new Blob([buf], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    /* Save file */
    saveAs(blob, fileName);
};
