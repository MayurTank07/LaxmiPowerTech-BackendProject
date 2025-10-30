const mongoose = require('mongoose');

const indentSchema = new mongoose.Schema({
  sheetName: { type: String },
  rowIndex: { type: Number },
  srNo: { type: String },
  productCode: { type: String },
  category: { type: String },
  subCategory: { type: String },
  subCategory1: { type: String },
  photo: { type: String }, // saved image URL
  raw: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Indent', indentSchema);


