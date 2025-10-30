const mongoose = require("mongoose");

// Flexible schema to handle any Excel structure
const ExcelDataSchema = new mongoose.Schema({
    sheetName: { type: String },
    rows: [
        {
            type: Object, // Each row is a dynamic object (columns vary)
        },
    ],
});

module.exports = mongoose.model("ExcelData", ExcelDataSchema);
