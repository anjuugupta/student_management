import React, { useState, useEffect } from 'react';
import {
  getStudents, createStudent, updateStudent, deleteStudent
} from './services/api';
import {
  Plus, Search, Edit2, Trash2, UserPlus, SlidersHorizontal, ChevronLeft, ChevronRight, Upload, X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', course: '', year: '1', date_of_birth: '',
  email: '', mobile_number: '', gender: 'Male', address: ''
};

export default function App() {
  // State lists
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form Management states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);

  // Load students automatically on parameter shifts
  useEffect(() => {
    fetchStudentList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, courseFilter]);

  const fetchStudentList = async () => {
    setLoading(true);
    try {
      const res = await getStudents(page, 5, search, courseFilter);
      setStudents(res.data.students);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching data", err);
      toast.error("Failed to load student records.");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const openAddModal = () => {
    setEditId(null);
    setErrors([]);
    setPhotoFile(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditId(student.id);
    setErrors([]);
    setPhotoFile(null);
    // Format incoming date string for inputs (YYYY-MM-DD)
    const formattedDate = student.date_of_birth ? student.date_of_birth.split('T')[0] : '';
    setFormData({
      name: student.name,
      course: student.course,
      year: student.year.toString(),
      date_of_birth: formattedDate,
      email: student.email,
      mobile_number: student.mobile_number,
      gender: student.gender,
      address: student.address
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (photoFile) data.append('photo', photoFile);

    try {
      if (editId) {
        await updateStudent(editId, data);
        toast.success("Student record updated.");
      } else {
        await createStudent(data);
        toast.success("Student registered successfully.");
      }
      setIsModalOpen(false);
      fetchStudentList();
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setErrors(err.response.data.errors);
        toast.error("Please fix the highlighted errors.");
      } else if (err.response && err.response.data.message) {
        setErrors([{ msg: err.response.data.message }]);
        toast.error(err.response.data.message);
      } else {
        setErrors([{ msg: "Something went wrong. Please check your fields." }]);
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to drop this student record?")) {
      try {
        await deleteStudent(id);
        toast.success("Student record deleted.");
        fetchStudentList();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete student record.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#f8fafc',
            fontSize: '14px',
            fontWeight: 500,
            padding: '10px 14px',
          },
          success: {
            iconTheme: { primary: '#4f46e5', secondary: '#f8fafc' },
          },
          error: {
            iconTheme: { primary: '#e11d48', secondary: '#f8fafc' },
          },
        }}
      />
      {/* Navbar Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Manager Pro</h1>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dynamic Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or admission no..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-slate-50/50"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={courseFilter}
              onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
              className="border border-slate-200 rounded-xl text-sm px-3 py-2 bg-white focus:outline-none focus:border-indigo-500 min-w-[160px]"
            >
              <option value="">All Courses</option>
              <option value="IT">IT</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>
        </div>

        {/* Core Student Listing Data Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-4">Student Profile</th>
                  <th className="px-6 py-4">Admission No</th>
                  <th className="px-6 py-4">Course Details</th>
                  <th className="px-6 py-4">Contact Data</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">Fetching record assets...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">No matching student profiles found.</td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.photo_url ? `http://localhost:5000${student.photo_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=e0e7ff&color=4338ca`}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-100"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.gender} • {student.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50/40 rounded px-2 py-1 inline-block">
                          {student.admission_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900 font-medium">{student.course}</p>
                        <p className="text-xs text-slate-500">Year {student.year}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900">{student.email}</p>
                        <p className="text-xs text-slate-500">{student.mobile_number}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* CRUD Overlay Form Modal Block */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-slate-900">
                {editId ? "Modify Record" : "Register Student"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {errors.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3 space-y-1">
                  {errors.map((err, idx) => (
                    <p key={idx}>• {err.msg}</p>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
                  <input
                    type="text" name="name" required
                    value={formData.name} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Course Branch *</label>
                  <select
                    name="course" required
                    value={formData.course} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="">Select Branch</option>
                    <option value="IT">IT</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Current College Year *</label>
                  <select
                    name="year" required
                    value={formData.year} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date of Birth *</label>
                  <input
                    type="date" name="date_of_birth" required
                    value={formData.date_of_birth} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Domain *</label>
                  <input
                    type="email" name="email" required
                    value={formData.email} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mobile Number *</label>
                  <input
                    type="tel" name="mobile_number" required
                    value={formData.mobile_number} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gender *</label>
                  <div className="flex items-center gap-4 pt-2">
                    {['Male', 'Female', 'Other'].map(g => (
                      <label key={g} className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                        <input
                          type="radio" name="gender" value={g}
                          checked={formData.gender === g}
                          onChange={handleInputChange}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Upload Student Avatar</label>
                  <label className="flex items-center gap-3 px-3 py-2 border border-dashed border-slate-300 rounded-xl text-sm cursor-pointer hover:bg-slate-50 transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-indigo-600 font-medium">Choose Image</span>
                    <span className="text-slate-400 text-xs truncate">
                      {photoFile ? photoFile.name : 'No image loaded'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Residential Address *</label>
                  <textarea
                    name="address" required rows={3}
                    value={formData.address} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button" onClick={closeModal}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  {editId ? "Save Modifications" : "Confirm Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}