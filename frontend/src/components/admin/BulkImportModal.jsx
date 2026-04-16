import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, X, Loader2 } from 'lucide-react';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { exportToExcel } from '../../utils/excelExport';

const BulkImportModal = ({ 
    onClose, 
    onSuccess, 
    templateData, 
    templateName = "Template", 
    expectedFileName = "Bulk_Import_Template.xlsx", 
    onUpload 
}) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const downloadTemplate = () => {
        exportToExcel(templateData, templateName, expectedFileName);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file first.");
            return;
        }

        setLoading(true);
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = xlsx.read(data, { type: 'array' });
                
                // Assuming first sheet is the one to read
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert sheet to JSON
                const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: "" }); // defval to ensure empty cells aren't omitted
                
                if (jsonData.length === 0) {
                    toast.error("The file is empty.");
                    setLoading(false);
                    return;
                }

                // Pass the raw parsed JSON to the parent page
                const success = await onUpload(jsonData);
                if (success) {
                    onSuccess(); // Trigger parent refresh
                    onClose();
                }
            } catch (error) {
                console.error("Parse/Upload Error:", error);
                toast.error("An error occurred. Make sure your file formatting matches the template.");
            } finally {
                setLoading(false);
            }
        };
        
        reader.onerror = () => {
             toast.error("Failed to read the file.");
             setLoading(false);
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="space-y-8">
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="text-primary-950 font-bold mb-1 text-sm">Download Template</h3>
                    <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                        To ensure data uploads correctly, please download our template. Do not change the column headers.
                    </p>
                </div>
                <button 
                    onClick={downloadTemplate}
                    className="flex-shrink-0 px-6 py-3 bg-white border border-blue-100 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                >
                    <Download size={14} />
                    Download .xlsx Template
                </button>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 group hover:border-accent-500 transition-colors bg-gray-50/50 hover:bg-accent-50/10 text-center flex flex-col items-center justify-center min-h-[200px] relative">
                <input 
                    type="file" 
                    accept=".xlsx, .xls, .csv" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {!file ? (
                    <>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="text-gray-400 group-hover:text-accent-500" size={24} />
                        </div>
                        <h4 className="text-primary-950 font-bold mb-2">Upload Excel or CSV file</h4>
                        <p className="text-xs text-gray-500">Drag and drop or click to choose file</p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-accent-500 rounded-full flex items-center justify-center shadow-lg shadow-accent-500/20 mb-4 animate-fade-in text-white">
                            <FileSpreadsheet size={24} />
                        </div>
                        <h4 className="text-primary-950 font-bold mb-1">{file.name}</h4>
                        <p className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</p>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            className="mt-4 px-4 py-2 bg-white text-red-500 rounded-lg text-[10px] font-bold border border-red-100 hover:bg-red-50 transition-colors z-20"
                        >
                            Remove File
                        </button>
                    </>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button 
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors text-xs font-bold"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="px-8 py-3 rounded-xl bg-primary-950 text-white hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-xl shadow-primary-950/20"
                >
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : 'Import Data'}
                </button>
            </div>
        </div>
    );
};

export default BulkImportModal;
