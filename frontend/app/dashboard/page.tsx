'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Course, Student } from '@/types';
import { 
  LayoutDashboard, Users, BookOpen, LogOut, Plus, Trash2, 
  Search, GraduationCap, X, Save, Edit2, Image as ImageIcon, AlertCircle, Check
} from 'lucide-react';

type ViewState = 'analytics' | 'students' | 'courses';
type ModalType = 'course' | 'student' | null;

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<ViewState>('analytics');
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // formState.courseIds is now an array of strings: ['id1', 'id2']
  const [formState, setFormState] = useState<any>({ courseIds: [] });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([api.get('/courses'), api.get('/students')]);
      setCourses(cRes.data);
      setStudents(sRes.data);
    } catch (err) { 
      console.error("Failed to fetch data:", err); 
      // Don't crash, just leave arrays empty
    }
    finally { setLoading(false); }
  };

    const handleOpenModal = (type: ModalType, item?: any) => {
    setModalOpen(type);
    if (item) {
      setEditingId(item.id);
      
      // CRITICAL FIX: Ensure we extract courseIds correctly
      // The backend sends 'courseIds' as a list of strings thanks to our getCourseIds() method
      const existingCourseIds = item.courseIds || []; 
      
      console.log("Editing Student:", item.firstName, "Current Course IDs:", existingCourseIds); // Debug log
      
      setFormState({ 
        ...item, 
        imageFile: null, 
        courseId: undefined, // Clear old single field
        courseIds: existingCourseIds // Set the array for checkboxes
      }); 
    } else {
      setEditingId(null);
      setFormState(type === 'course' ? { title: '', description: '', credits: 0, imageFile: null, imageFilename: '' } : { firstName: '', lastName: '', email: '', courseIds: [] });
    }
  };
   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalOpen === 'course') {
        const formData = new FormData();
        formData.append('title', formState.title);
        formData.append('description', formState.description);
        formData.append('credits', formState.credits);
        
        if (formState.imageFile) {
          formData.append('image', formState.imageFile);
        }

        const config = { headers: { 'Content-Type': 'multipart/form-data' } };

        if (editingId) await api.put(`/courses/${editingId}`, formData, config);
        else await api.post('/courses', formData, config);
      } 
      
      if (modalOpen === 'student') {
        const payload = { 
          firstName: formState.firstName,
          lastName: formState.lastName,
          email: formState.email,
          courseIds: formState.courseIds || [] 
        };

        // CRITICAL FIX: This block handles BOTH Create and Update
        if (editingId) {
          // UPDATE existing student
          await api.put(`/students/${editingId}`, payload);
        } else {
          // CREATE new student (This was missing before!)
          await api.post('/students', payload);
        }
      }
      
      setModalOpen(null);
      fetchData();
      alert("Saved successfully!");
      
    } catch (error: any) { 
      console.error("Full Error:", error);
      
      let msg = 'Failed to save changes';
      if (error.response) {
        msg = error.response.data?.message || `Server Error: ${error.response.status}`;
        console.error("Server Response:", error.response.data);
      }
      
      alert(msg); 
    }
  };

  const handleDelete = async (type: 'course' | 'student', id: string) => {
    if(!confirm('Are you sure?')) return;
    try {
      if (type === 'course') await api.delete(`/courses/${id}`);
      else await api.delete(`/students/${id}`);
      fetchData();
    } catch (error) { alert('Failed to delete'); }
  };

  const SidebarItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
        activeView === view 
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200 translate-x-1' 
          : 'text-slate-500 hover:bg-purple-50 hover:text-purple-700'
      }`}
    >
      <Icon size={20} strokeWidth={activeView === view ? 2.5 : 2} /> {label}
    </button>
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
      <p className="text-purple-600 font-medium animate-pulse">Loading System...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-20 shadow-xl shadow-slate-200/50">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-purple-200">
            <GraduationCap size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight text-lg">SMS Portal</h1>
            <p className="text-xs text-purple-600 font-bold uppercase tracking-wide">Administrator</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem view="analytics" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem view="students" icon={Users} label="Students" />
          <SidebarItem view="courses" icon={BookOpen} label="Courses" />
        </nav>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-medium group">
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm">
          <span className="font-bold text-purple-600 flex items-center gap-2"><GraduationCap size={20}/> SMS</span>
          <button onClick={logout}><LogOut size={20} className="text-red-500"/></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            
            {/* --- ANALYTICS VIEW --- */}
            {activeView === 'analytics' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div><h2 className="text-3xl font-bold text-slate-800 mb-2">Overview</h2><p className="text-slate-500">Welcome back, {user?.email}</p></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard icon={BookOpen} label="Total Courses" value={Array.isArray(courses) ? courses.length : 0} color="purple" />
                  <StatCard icon={Users} label="Total Students" value={Array.isArray(students) ? students.length : 0} color="indigo" />
                  <StatCard icon={GraduationCap} label="System Status" value="Active" color="emerald" isText />
                </div>
              </div>
            )}

            {/* --- STUDENTS VIEW --- */}
            {activeView === 'students' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800">Students Management</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage student registrations and enrollments</p>
                  </div>
                  <button onClick={() => handleOpenModal('student')} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold">
                    <Plus size={20} /> Add Student
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                      <Search className="absolute left-4 top-3.5 text-slate-400" size={20}/>
                      <input type="text" placeholder="Search students..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"/>
                    </div>
                  </div>
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                      <tr><th className="px-6 py-4 font-bold">Name</th><th className="px-6 py-4 font-bold">Email</th><th className="px-6 py-4 font-bold">Assigned Courses</th><th className="px-6 py-4 font-bold text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {/* SAFE FILTER CHECK */}
                      {Array.isArray(students) && students.length > 0 ? (
                        students
                          .filter((s) => s.firstName.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((student) => {
                            const hasCourses = student.courseIds && student.courseIds.length > 0;
                            return (
                              <tr key={student.id} className="bg-white hover:bg-purple-50/40 transition-colors group">
                                <td className="px-6 py-4 font-bold text-slate-800">{student.firstName} {student.lastName}</td>
                                <td className="px-6 py-4 text-slate-500">{student.email}</td>
                                <td className="px-6 py-4">
                                  {hasCourses ? (
                                    <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold">
                                      {student.courseIds?.length || 0} Course(s)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 text-slate-400 italic text-xs">
                                      <AlertCircle size={14} /> Unassigned
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={()=>handleOpenModal('student', student)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit / Assign Courses">
                                      <Edit2 size={18}/>
                                    </button>
                                    <button onClick={()=>handleDelete('student', student.id)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm" title="Delete Student">
                                      <Trash2 size={18}/>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                            {Array.isArray(students) ? "No students found." : "Loading students..."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- COURSES VIEW --- */}
            {activeView === 'courses' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div><h2 className="text-3xl font-bold text-slate-800">Course Catalog</h2><p className="text-slate-500 text-sm mt-1">Browse and manage courses</p></div>
                  <button onClick={() => handleOpenModal('course')} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold">
                    <Plus size={20} /> Add Course
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(courses) && courses.map(course => (
                    <div key={course.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-purple-100 hover:-translate-y-1 hover:border-purple-300 transition-all duration-300 flex flex-col">
                      <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                        {course.imageFilename ? (
                          <img 
                            src={`http://localhost:8080/api/courses/images/${course.imageFilename}`} 
                            alt={course.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={48} />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                           <span className="bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                            {course.credits} Credits
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">{course.title}</h3>
                        <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1">{course.description}</p>
                        
                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                          <button onClick={()=>handleOpenModal('course', course)} className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md">
                            <Edit2 size={16}/> Edit
                          </button>
                          <button onClick={()=>handleDelete('course', course.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md">
                            <Trash2 size={16}/> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* MODAL POPUP */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                {editingId ? <Edit2 size={20} className="text-purple-600"/> : <Plus size={20} className="text-purple-600"/>}
                {editingId ? (modalOpen === 'course' ? 'Edit Course' : 'Edit Student') : (modalOpen === 'course' ? 'Add New Course' : 'Register Student')}
              </h3>
              <button onClick={() => setModalOpen(null)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalOpen === 'course' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course Image</label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer bg-slate-50 hover:bg-purple-50 border-2 border-dashed border-slate-300 rounded-xl p-4 text-center transition-colors">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setFormState({...formState, imageFile: e.target.files?.[0] || null})}
                          className="hidden" 
                        />
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                          <ImageIcon size={24} />
                          <span className="text-sm font-medium truncate w-full">
                            {formState.imageFile ? formState.imageFile.name : "Click to upload image"}
                          </span>
                        </div>
                      </label>
                      {formState.imageFilename && !formState.imageFile && (
                         <img 
                           src={`http://localhost:8080/api/courses/images/${formState.imageFilename}`} 
                           className="w-20 h-20 object-cover rounded-lg border border-slate-200 shadow-sm" 
                           alt="Current"
                         />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course Title</label>
                    <input required placeholder="e.g. Advanced Java" value={formState.title} onChange={e=>setFormState({...formState, title:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                    <textarea required placeholder="Brief description..." rows={3} value={formState.description} onChange={e=>setFormState({...formState, description:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Credits</label>
                    <input type="number" required placeholder="0" value={formState.credits} onChange={e=>setFormState({...formState, credits:Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white" />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="First Name" value={formState.firstName} onChange={e=>setFormState({...formState, firstName:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white" />
                    <input required placeholder="Last Name" value={formState.lastName} onChange={e=>setFormState({...formState, lastName:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white" />
                  </div>
                  <input required type="email" placeholder="Email" value={formState.email} onChange={e=>setFormState({...formState, email:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white" />
                  
                  {/* MULTI-SELECT COURSE CHECKBOXES */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assign Courses</label>
                    <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto bg-white p-2 space-y-2 shadow-inner">
                      {Array.isArray(courses) && courses.map(c => {
                        const isSelected = formState.courseIds?.includes(c.id);
                        return (
                          <label key={c.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50 border border-transparent'}`}>
                            <input 
                              type="checkbox"
                              checked={isSelected || false}
                              onChange={(e) => {
                                const currentList = formState.courseIds || [];
                                if (e.target.checked) {
                                  setFormState({...formState, courseIds: [...currentList, c.id]});
                                } else {
                                  setFormState({...formState, courseIds: currentList.filter((id:string) => id !== c.id)});
                                }
                              }}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                            />
                            <span className="text-sm text-slate-700 font-medium flex-1">{c.title}</span>
                            {isSelected && <Check size={16} className="text-purple-600" />}
                          </label>
                        );
                      })}
                      {!Array.isArray(courses) || courses.length === 0 && <p className="text-xs text-slate-400 p-2">No courses available.</p>}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Select multiple courses to enroll the student in all of them.</p>
                  </div>
                </>
              )}
              
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setModalOpen(null)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, isText }: any) {
  const colors: any = { purple: "bg-purple-100 text-purple-600", indigo: "bg-indigo-100 text-indigo-600", emerald: "bg-emerald-100 text-emerald-600" };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`${colors[color]} p-4 rounded-2xl`}><Icon size={28} strokeWidth={2.5} /></div>
      <div><p className="text-slate-500 text-sm font-medium uppercase">{label}</p><p className={`text-3xl font-bold ${isText ? 'text-emerald-600' : 'text-slate-800'}`}>{value}</p></div>
    </div>
  );
}