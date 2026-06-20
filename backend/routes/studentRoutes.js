const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { studentValidationRules, validate } = require('../middleware/validate');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

// Define API structures
router.get('/', getStudents);
router.get('/:id', getStudentById);

// POST and PUT need multi-part handling (upload) before parsing fields for validation
router.post('/', upload.single('photo'), studentValidationRules, validate, createStudent);
router.put('/:id', upload.single('photo'), studentValidationRules, validate, updateStudent);

router.delete('/:id', deleteStudent);

module.exports = router;
