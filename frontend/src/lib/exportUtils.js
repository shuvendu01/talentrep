import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const exportToExcel = (data, filename = 'export.xlsx', sheetName = 'Sheet1') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  XLSX.writeFile(workbook, filename);
};

export const exportToPDF = (data, columns, filename = 'export.pdf', title = 'Export') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Prepare table data
  const tableData = data.map(row => columns.map(col => row[col.key] || ''));
  const headers = columns.map(col => col.label);
  
  // Add table
  doc.autoTable({
    startY: 35,
    head: [headers],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  doc.save(filename);
};

export const formatDataForExport = (data, formatters = {}) => {
  return data.map(row => {
    const formatted = { ...row };
    Object.keys(formatters).forEach(key => {
      if (formatted[key] !== undefined) {
        formatted[key] = formatters[key](formatted[key]);
      }
    });
    return formatted;
  });
};
