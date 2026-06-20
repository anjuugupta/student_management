const { body, validationResult } = require('express-validator');

const studentValidationRules = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('course').trim().notEmpty().withMessage('Course is required.'),
  
  // 💡 FIXED: We convert the text string to an integer first using .toInt()
  body('year')
    .toInt()
    .isInt({ min: 1, max: 5 })
    .withMessage('Year must be a number between 1 and 5.'),
    
  body('date_of_birth').isISO8601().toDate().withMessage('Valid Date of Birth is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email address is required.'),
  body('mobile_number').matches(/^\+?[0-9]{10,15}$/).withMessage('Valid mobile number (10-15 digits) is required.'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other.'),
  body('address').trim().notEmpty().withMessage('Address is required.')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { studentValidationRules, validate };
