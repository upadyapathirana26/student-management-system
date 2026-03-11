'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Course } from '@/types';
import { BookOpen, LogOut, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, logout } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Call the new endpoint that returns a LIST of courses for this student
      // Ensure your Backend StudentController has: @GetMapping("/my-courses")
      const res = await api.get('/students/my-courses', { 
        params: { email: user?.email } 
      });
      
      setEnrolledCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-purple-600">Loading...</div>;

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
            <p className="text-xs text-purple-600 font-bold uppercase tracking-wide">Student View</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200 translate-x-1 font-semibold text-sm">
            <BookOpen size={20} /> My Courses
          </div>
        </nav>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-medium group">
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800">My Enrolled Courses</h2>
              <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.email}</p>
            </div>

            {enrolledCourses.length > 0 ? (
              /* SHOW GRID OF ENROLLED COURSES */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                      {course.imageFilename ? (
                        <img src={`http://localhost:8080/api/courses/images/${course.imageFilename}`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen size={48} /></div>
                      )}
                      <div className="absolute top-3 right-3">
                         <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                          <CheckCircle size={12} /> Enrolled
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-xl text-slate-800 mb-2">{course.title}</h3>
                      <p className="text-slate-500 text-sm mb-6 flex-1">{course.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                         <span className="text-sm font-bold text-indigo-600">{course.credits} Credits</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* SHOW NOT ENROLLED MESSAGE */
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-12 text-center text-yellow-800 flex flex-col items-center justify-center min-h-[400px]">
                <div className="bg-yellow-100 p-4 rounded-full mb-4">
                  <AlertCircle size={48} className="text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Not Enrolled in Any Course</h3>
                <p className="max-w-md text-yellow-700">You are registered but not assigned to any specific course yet. Please contact an administrator to be enrolled.</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}