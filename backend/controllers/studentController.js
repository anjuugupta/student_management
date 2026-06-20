const db = require('../config/db');

// @desc    Get all students (with Pagination, Search, Filter)
// @route   GET /api/students
const getStudents = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', course = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let queryText = `SELECT * FROM students WHERE 1=1`;
    let countQueryText = `SELECT COUNT(*) FROM students WHERE 1=1`;
    let queryParams = [];
    let paramIndex = 1;

    // Search by Name or Admission Number
    if (search) {
      queryText += ` AND (name ILIKE $${paramIndex} OR admission_number ILIKE $${paramIndex})`;
      countQueryText += ` AND (name ILIKE $${paramIndex} OR admission_number ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Filter by Course
    if (course) {
      queryText += ` AND course = $${paramIndex}`;
      countQueryText += ` AND course = $${paramIndex}`;
      queryParams.push(course);
      paramIndex++;
    }

    // Total Count for Pagination metadata
    const totalCountResult = await db.query(countQueryText, queryParams);
    const totalItems = parseInt(totalCountResult.rows[0].count);

    // Append Sorting and Pagination
    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const studentsResult = await db.query(queryText, queryParams);

    res.status(200).json({
      students: studentsResult.rows,
      pagination: {
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get a single student by ID
// @route   GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM students WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add new student
// @route   POST /api/students
const createStudent = async (req, res) => {
  try {
    const { name, course, year, date_of_birth, email, mobile_number, gender, address } = req.body;
    
    // Check if email already exists
    const emailCheck = await db.query('SELECT id FROM students WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Photo URL path handling
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

    const queryText = `
      INSERT INTO students (name, course, year, date_of_birth, email, mobile_number, gender, address, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [name, course, year, date_of_birth, email, mobile_number, gender, address, photo_url];
    
    const result = await db.query(queryText, values);
    
    // Activity Log (Bonus item)
    console.log(`[ACTIVITY LOG]: Student created with ID ${result.rows[0].id} at ${new Date()}`);

    res.status(201).json({ message: 'Student created successfully.', student: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, course, year, date_of_birth, email, mobile_number, gender, address } = req.body;

    // Check if student exists
    const studentCheck = await db.query('SELECT * FROM students WHERE id = $1', [id]);
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    let photo_url = studentCheck.rows[0].photo_url;
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
    }

    const queryText = `
      UPDATE students 
      SET name = $1, course = $2, year = $3, date_of_birth = $4, email = $5, 
          mobile_number = $6, gender = $7, address = $8, photo_url = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *;
    `;
    const values = [name, course, year, date_of_birth, email, mobile_number, gender, address, photo_url, id];
    const result = await db.query(queryText, values);

    console.log(`[ACTIVITY LOG]: Student ID ${id} was updated at ${new Date()}`);
    res.status(200).json({ message: 'Student updated successfully.', student: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete student record
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    console.log(`[ACTIVITY LOG]: Student ID ${id} was deleted at ${new Date()}`);
    res.status(200).json({ message: 'Student record dropped successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
