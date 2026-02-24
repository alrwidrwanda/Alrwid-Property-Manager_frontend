import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Table as TableIcon } from "lucide-react";
import jsPDF from "jspdf";

export function ExportMenu({ data, filename, title, columns }) {
  const exportToCSV = () => {
    // Columns can be array of strings or objects {header, key}
    const headers = columns.map(c => typeof c === 'object' ? c.header : c);
    const keys = columns.map(c => typeof c === 'object' ? c.key : c);

    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        keys.map(key => {
          let val = row[key];
          if (val === null || val === undefined) val = '';
          return JSON.stringify(val);
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToWord = () => {
    const headers = columns.map(c => typeof c === 'object' ? c.header : c);
    const keys = columns.map(c => typeof c === 'object' ? c.key : c);

    const tableRows = data.map(row => {
      return `<tr>${keys.map(key => `<td style="padding: 8px; border: 1px solid #ddd; word-wrap: break-word; max-width: 150px; font-size: 10pt;">${row[key] !== null && row[key] !== undefined ? row[key] : ''}</td>`).join('')}</tr>`;
    }).join('');

    const tableHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          body { 
            font-family: 'Calibri', 'Arial', sans-serif; 
            font-size: 9pt; 
            line-height: 1.3;
            margin: 0;
            padding: 0;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px;
            table-layout: fixed;
          }
          th { 
            background-color: #f2f2f2; 
            color: #333; 
            font-weight: bold; 
            padding: 8px 6px; 
            border: 1px solid #999; 
            text-align: left;
            font-size: 9pt;
            word-wrap: break-word;
          }
          td { 
            padding: 8px 6px; 
            border: 1px solid #ddd; 
            vertical-align: top;
            font-size: 9pt;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          h1 { 
            color: #333; 
            font-size: 14pt; 
            margin-bottom: 10px;
            margin-top: 0;
          }
          p {
            font-size: 8pt;
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/msword' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Use landscape orientation for wider tables
    const doc = new jsPDF('landscape');
    const headers = columns.map(c => typeof c === 'object' ? c.header : c);
    const keys = columns.map(c => typeof c === 'object' ? c.key : c);
    
    // Title
    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    const tableData = data.map(row => keys.map(key => String(row[key] !== null && row[key] !== undefined ? row[key] : '')));

    // Manual table generation with organized layout
    let y = 30;
    const xStart = 10;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const tableWidth = pageWidth - (2 * margin);
    
    // Calculate optimal column widths based on content
    const calculateColumnWidths = () => {
      const minWidth = 15;
      const maxWidth = tableWidth / headers.length;
      const calculatedWidths = headers.map((header, i) => {
        // Sample first 5 rows to estimate width
        const samples = [header, ...tableData.slice(0, 5).map(row => row[i])];
        const maxLength = Math.max(...samples.map(s => String(s).length));
        const width = Math.min(Math.max(minWidth, maxLength * 2), maxWidth);
        return width;
      });
      
      // Adjust if total exceeds table width
      const total = calculatedWidths.reduce((a, b) => a + b, 0);
      if (total > tableWidth) {
        const scale = tableWidth / total;
        return calculatedWidths.map(w => w * scale);
      }
      return calculatedWidths;
    };
    
    const colWidths = calculateColumnWidths();
    const rowHeight = 10;

    // Set clean font
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    
    // Draw Header
    let xPos = xStart;
    headers.forEach((h, i) => {
      doc.setFillColor(240, 240, 240);
      doc.rect(xPos, y - 7, colWidths[i], rowHeight, 'F');
      doc.rect(xPos, y - 7, colWidths[i], rowHeight, 'S');
      
      // Wrap header text if needed
      const headerText = doc.splitTextToSize(String(h), colWidths[i] - 3);
      doc.text(headerText[0], xPos + 2, y);
      xPos += colWidths[i];
    });
    
    y += rowHeight - 7;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    // Draw Rows
    tableData.forEach((row, rowIndex) => {
      // Calculate row height
      let maxLines = 1;
      row.forEach((cell, i) => {
        const text = String(cell);
        const splitText = doc.splitTextToSize(text, colWidths[i] - 3);
        if (splitText.length > maxLines) maxLines = splitText.length;
      });

      const actualRowHeight = Math.max((maxLines * 4) + 4, rowHeight);

      // Check page break
      if (y + actualRowHeight > pageHeight - margin) {
        doc.addPage();
        y = 20;
        
        // Reprint header on new page
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        xPos = xStart;
        headers.forEach((h, i) => {
          doc.setFillColor(240, 240, 240);
          doc.rect(xPos, y - 7, colWidths[i], rowHeight, 'F');
          doc.rect(xPos, y - 7, colWidths[i], rowHeight, 'S');
          const headerText = doc.splitTextToSize(String(h), colWidths[i] - 3);
          doc.text(headerText[0], xPos + 2, y);
          xPos += colWidths[i];
        });
        y += rowHeight - 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
      }

      const rowY = y;
      xPos = xStart;

      // Draw cells
      row.forEach((cell, i) => {
        const text = String(cell);
        
        // Draw cell box
        doc.rect(xPos, rowY, colWidths[i], actualRowHeight, 'S');
        
        // Draw text with wrapping
        const splitText = doc.splitTextToSize(text, colWidths[i] - 3);
        doc.text(splitText, xPos + 2, rowY + 4);
        
        xPos += colWidths[i];
      });

      y += actualRowHeight;
    });

    doc.save(`${filename}.pdf`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={data.length === 0}>
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <TableIcon className="w-4 h-4 mr-2" />
          Excel (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToWord}>
          <FileText className="w-4 h-4 mr-2" />
          Word (DOC)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="w-4 h-4 mr-2" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}