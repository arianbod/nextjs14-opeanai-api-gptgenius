// lib/fileAnalysis.js
import Papa from 'papaparse';
import * as XLSX from 'xlsx';  // Changed import style

export async function analyzeFileContent(fileContent, fileType) {
    try {
        let analysis = {
            summary: '',
            metadata: {},
            type: fileType
        };

        // Basic metadata regardless of file type
        const approximateSize = Math.ceil((fileContent.length * 3) / 4);  // base64 to bytes
        analysis.metadata.size = approximateSize;

        try {
            if (fileType === 'text/csv') {
                const text = Buffer.from(fileContent, 'base64').toString('utf-8');
                const result = Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true
                });

                if (result.data && result.data.length > 0) {
                    analysis.metadata = {
                        ...analysis.metadata,
                        rowCount: result.data.length,
                        columns: result.meta.fields || [],
                        sampleData: result.data.slice(0, 3)
                    };
                    analysis.summary = `CSV file with ${result.data.length} rows and ${result.meta.fields?.length || 0} columns`;
                }
            }
            else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
                const buffer = Buffer.from(fileContent, 'base64');
                const workbook = XLSX.read(buffer, {
                    type: 'buffer',
                    cellDates: true,
                    cellNF: true
                });

                if (workbook && workbook.SheetNames?.length > 0) {
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    let data = [];
                    try {
                        data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    } catch (err) {
                        console.warn('Error converting sheet to JSON:', err);
                    }

                    analysis.metadata = {
                        ...analysis.metadata,
                        sheets: workbook.SheetNames,
                        sheetCount: workbook.SheetNames.length,
                        rowCount: data.length,
                        firstSheetName: workbook.SheetNames[0]
                    };
                    analysis.summary = `Excel file with ${workbook.SheetNames.length} sheet${workbook.SheetNames.length > 1 ? 's' : ''}`;
                }
            }
            else if (fileType === 'text/plain') {
                const text = Buffer.from(fileContent, 'base64').toString('utf-8');
                const lines = text.split('\n');

                analysis.metadata = {
                    ...analysis.metadata,
                    lineCount: lines.length,
                    charCount: text.length,
                    preview: text.substring(0, 200) + (text.length > 200 ? '...' : '')
                };
                analysis.summary = `Text file with ${lines.length} line${lines.length !== 1 ? 's' : ''} and ${text.length} characters`;
            }
            else {
                // For unsupported file types, just provide basic info
                analysis.summary = `${fileType.split('/')[1].toUpperCase()} file`;
            }
        } catch (parseError) {
            console.warn('Error parsing file content:', parseError);
            analysis.summary = `${fileType.split('/')[1].toUpperCase()} file (content analysis failed)`;
            analysis.metadata.parseError = parseError.message;
        }

        return analysis;
    } catch (error) {
        console.error('Fatal error analyzing file:', error);
        return {
            summary: 'Error analyzing file content',
            metadata: {
                error: error.message
            },
            type: fileType
        };
    }
}