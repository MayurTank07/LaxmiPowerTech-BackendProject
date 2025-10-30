// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const indentController = require('../controllers/indentController');

// // Multer temp storage for Excel files
// const upload = multer({
//   dest: path.join(__dirname, '..', 'tmp_uploads'), // temporary folder
//   limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       'application/vnd.ms-excel'
//     ];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only Excel files are allowed'));
//     }
//   }
// });

// // POST /api/indents/upload → Upload Excel and save to DB
// router.post('/upload', upload.single('file'), indentController.uploadExcel);

// // GET /api/indents → Fetch all saved indents
// router.get('/', indentController.getIndents);



// module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const indentController = require('../controllers/indentController');

// Multer storage for Excel
const upload = multer({
  dest: path.join(__dirname, '..', 'tmp_uploads'), // temp folder
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only Excel files are allowed'));
  }
});

// Routes
router.post('/upload', upload.single('file'), indentController.uploadExcel); // upload new Excel
router.get('/', indentController.getIndents); // get all indents
router.get('/last', indentController.getLastExcel); // fetch last uploaded Excel
router.get('/materials', indentController.getAllMaterials); // 👈 New route for CreateIndent.jsx


module.exports = router;


