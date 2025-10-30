const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function parseExcelWithImages(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const result = [];
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

  workbook.eachSheet((worksheet) => {
    worksheet.eachRow((row, rowNumber) => {
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        rowData[`col${colNumber}`] = cell.value;
      });

      // Attach images (if any)
      const images = [];
      worksheet.getImages().forEach(img => {
        if (img.range.tl.nativeRow + 1 === rowNumber) {
          const workbookImage = workbook.getImage(img.imageId);
          const ext = workbookImage.extension;
          const filename = `${Date.now()}-${rowNumber}-${colNumber}.${ext}`;
          fs.writeFileSync(path.join(uploadDir, filename), workbookImage.buffer);
          images.push(`/uploads/${filename}`);
        }
      });

      rowData.images = images.length ? images : [];
      result.push(rowData);
    });
  });

  return result;
}

module.exports = parseExcelWithImages;
