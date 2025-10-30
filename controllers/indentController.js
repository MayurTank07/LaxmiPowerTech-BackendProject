const Indent = require('../models/Indent');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Upload Excel + save to MongoDB
exports.uploadExcel = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const targetPath = path.join(uploadsDir, `${Date.now()}-${file.originalname}`);
    fs.renameSync(file.path, targetPath);

    const workbook = XLSX.readFile(targetPath);
    const allRows = [];

    workbook.SheetNames.forEach(sheetName => {
      const ws = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws);
      rows.forEach(row => allRows.push({ ...row, sheetName }));
    });
    
    const indentDocs = allRows.map(row => ({
      sheetName: row.sheetName,
      rowIndex: row['SR NO.'] || 0,
      srNo: row['SR NO.'] || '',
      productCode: row['Product Code'] || '',
      category: row['Category'] || '',
      subCategory: row['Sub category'] || '',
      subCategory1: row['Sub category 1'] || '',
      photo: '',
      raw: row
    }));

    await Indent.insertMany(indentDocs);

    res.status(200).json({ 
      message: 'Excel uploaded successfully', 
      count: indentDocs.length,
      filename: path.basename(targetPath)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// app.post("/api/upload-excel", upload.single("file"), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: "No file uploaded" });
//         }

//         // Read the Excel workbook
//         const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//         const sheetNames = workbook.SheetNames;

//         const savedSheets = [];

//         for (const sheetName of sheetNames) {
//             const sheet = workbook.Sheets[sheetName];
//             const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

//             if (data.length === 0) continue;

//             // Convert each row into an object with col_1, col_2, ...
//             const headers = data[0];
//             const rows = data.map((rowArr, rowIndex) => {
//                 const obj = {};
//                 headers.forEach((h, i) => {
//                     obj[`col_${i + 1}`] = rowArr[i] ?? "";
//                 });
//                 return obj;
//             });

//             const sheetDoc = new ExcelModel({ sheetName, rows });
//             await sheetDoc.save();
//             savedSheets.push(sheetDoc);
//         }

//         res.json({ message: "✅ Excel uploaded successfully", data: savedSheets });
//     } catch (err) {
//         console.error("❌ Upload error:", err);
//         res.status(500).json({ error: "Error processing Excel file" });
//     }
// });


// app.post("/api/upload-excel", upload.single("file"), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: "No file uploaded" });
//         }

//         // Read the Excel workbook
//         const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//         const sheetNames = workbook.SheetNames;

//         const savedSheets = [];

//         for (const sheetName of sheetNames) {
//             const sheet = workbook.Sheets[sheetName];
//             const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

//             if (data.length === 0) continue;

//             // Convert each row into an object with col_1, col_2, ...
//             const headers = data[0];
//             const rows = data.map((rowArr, rowIndex) => {
//                 const obj = {};
//                 headers.forEach((h, i) => {
//                     obj[`col_${i + 1}`] = rowArr[i] ?? "";
//                 });
//                 return obj;
//             });

//             const sheetDoc = new ExcelModel({ sheetName, rows });
//             await sheetDoc.save();
//             savedSheets.push(sheetDoc);
//         }

//         res.json({ message: "✅ Excel uploaded successfully", data: savedSheets });
//     } catch (err) {
//         console.error("❌ Upload error:", err);
//         res.status(500).json({ error: "Error processing Excel file" });
//     }
// });

// Get all indents from MongoDB


exports.getIndents = async (req, res) => {
  try {
    const indents = await Indent.find().sort({ createdAt: -1 });
    const flattened = indents.map(doc => ({
      sheetName: doc.sheetName,
      ...doc.raw
    }));
    res.status(200).json(flattened);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get last uploaded Excel from /uploads folder
exports.getLastExcel = async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) return res.json({});

    const files = fs.readdirSync(uploadsDir)
      .filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'))
      .sort((a, b) => fs.statSync(path.join(uploadsDir, b)).mtimeMs - fs.statSync(path.join(uploadsDir, a)).mtimeMs);

    if (!files.length) return res.json({});

    const latestFile = path.join(uploadsDir, files[0]);
    const workbook = XLSX.readFile(latestFile);
    const allSheets = {};
    workbook.SheetNames.forEach(sheetName => {
      const ws = workbook.Sheets[sheetName];
      allSheets[sheetName] = XLSX.utils.sheet_to_json(ws);
    });

    res.status(200).json(allSheets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch last Excel data' });
  }
};



// =============================
// GET ALL MATERIALS (for CreateIndent.jsx)
// =============================
exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await Indent.find().sort({ createdAt: -1 });

    const result = materials.map(item => ({
      _id: item._id,
      category: item.category || item.raw["Category"] || "Unnamed Category",
      subCategory: item.subCategory || item.raw["Sub category"] || "—",
      subCategory1: item.subCategory1 || item.raw["Sub category 1"] || "—",
      photo:
        item.photo ||
        "https://cdn-icons-png.flaticon.com/512/2910/2910768.png",
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching materials:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// app.get("/api/get-excel-data", async (req, res) => {
//     try {
//         const allSheets = await ExcelModel.find({}).sort({ uploadedAt: -1 });

//         if (!allSheets || allSheets.length === 0) {
//             return res.status(404).json({ message: "No Excel data found" });
//         }

//         res.json({ data: allSheets });
//     } catch (err) {
//         console.error("❌ Fetch Excel data error:", err);
//         res.status(500).json({ error: "Failed to fetch Excel data" });
//     }
// });

// ✅ Fetch only the latest Excel file (optional)
// app.get("/api/excel/latest", async (req, res) => {
//     try {
//         const latest = await ExcelModel.findOne().sort({ uploadedAt: -1 });
//         if (!latest) {
//             return res.status(404).json({ message: "No latest Excel data found" });
//         }
//         res.json({ data: latest });
//     } catch (err) {
//         console.error("❌ Fetch latest Excel error:", err);
//         res.status(500).json({ error: "Server error fetching latest Excel" });
//     }
// });
 