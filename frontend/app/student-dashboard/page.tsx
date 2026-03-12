'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Course } from '@/types';
import { BookOpen, LogOut, GraduationCap, AlertCircle, CheckCircle, User, Info } from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, logout } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Tab State: 'courses', 'profile', or 'about'
  const [activeTab, setActiveTab] = useState<'courses' | 'profile' | 'about'>('courses');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Courses
      const coursesRes = await api.get('/students/my-courses', { 
        params: { email: user?.email } 
      });
      setEnrolledCourses(coursesRes.data);

      // 2. Fetch Student Profile Details (Optional: if you want to show name/ID)
      // Assuming you have an endpoint to get student by email, or we can just use Auth context data
      // If you don't have a specific endpoint, we can just display user.email from context
      // For now, let's try to find the student record to show First/Last name
      try {
        const studentRes = await api.get('/students', { params: { email: user?.email } });
        if (studentRes.data && studentRes.data.length > 0) {
          setStudentData(studentRes.data[0]);
        }
      } catch (e) {
        console.log("Could not fetch detailed student profile, using auth data only.");
      }

    } catch (err) {
      console.error("Failed to fetch data:", err);
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
          {/* Courses Tab Button */}
          <button
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm ${
              activeTab === 'courses' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200 translate-x-1' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BookOpen size={20} /> My Courses
          </button>

          {/* Profile Tab Button */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm ${
              activeTab === 'profile' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200 translate-x-1' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <User size={20} /> My Profile
          </button>

          {/* About System Tab Button */}
          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm ${
              activeTab === 'about' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200 translate-x-1' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Info size={20} /> About System
          </button>
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
            
            {/* --- TAB CONTENT: MY COURSES --- */}
            {activeTab === 'courses' && (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-800">My Enrolled Courses</h2>
                  <p className="text-slate-500 text-sm mt-1">View your current curriculum and progress.</p>
                </div>

                {enrolledCourses.length > 0 ? (
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
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-12 text-center text-yellow-800 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="bg-yellow-100 p-4 rounded-full mb-4">
                      <AlertCircle size={48} className="text-yellow-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Not Enrolled in Any Course</h3>
                    <p className="max-w-md text-yellow-700">You are registered but not assigned to any specific course yet. Please contact an administrator.</p>
                  </div>
                )}
              </>
            )}

            {/* --- TAB CONTENT: MY PROFILE --- */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-800">My Profile</h2>
                  <p className="text-slate-500 text-sm mt-1">Manage your personal information.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-4 rounded-full">
                        <User size={40} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">
                          {studentData ? `${studentData.firstName} ${studentData.lastName}` : 'Student'}
                        </h3>
                        <p className="text-purple-100 opacity-90">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">First Name</label>
                        <p className="text-lg text-slate-800 font-medium">{studentData?.firstName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name</label>
                        <p className="text-lg text-slate-800 font-medium">{studentData?.lastName || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                      <p className="text-lg text-slate-800 font-medium">{user?.email}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Role</label>
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                        {user?.role || 'Student'}
                      </span>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <p className="text-sm text-slate-500 italic">
                        Note: To update your profile details, please contact the system administrator.
                        Email - admin.stmanagemt@gmail.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB CONTENT: ABOUT SYSTEM --- */}
            {activeTab === 'about' && (
              <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-800">About Student Management System</h2>
                  <p className="text-slate-500 text-sm mt-1">System overview and technical details.</p>
                </div>

                <div className="space-y-6">
                  {/* Overview Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Info className="text-purple-600" /> System Overview
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      The <strong>Student Management System (SMS)</strong> is a comprehensive platform designed to streamline academic administration. 
                      It facilitates seamless interaction between administrators and students, allowing for efficient course enrollment, 
                      real-time progress tracking, and secure data management.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      This system eliminates manual paperwork by digitizing student records, course catalogs, and enrollment processes, 
                      ensuring data integrity and accessibility from any device.
                    </p>
                  </div>

                  {/* Tech Stack Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Technical Architecture</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-blue-600 font-bold mb-2">Frontend</div>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>• Next.js 14</li>
                          <li>• React 18</li>
                          <li>• Tailwind CSS</li>
                          <li>• Axios</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-green-600 font-bold mb-2">Backend</div>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>• Spring Boot 3</li>
                          <li>• Java 17+</li>
                          <li>• Spring Security</li>
                          <li>• JWT Auth</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-orange-600 font-bold mb-2">Database</div>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>• Supabase</li>
                          <li>• PostgreSQL</li>
                          <li>• TypeORM / JPA</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Features Card */}
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white">
                    <h3 className="text-xl font-bold mb-4">Key Features</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <li className="flex items-center gap-2"><CheckCircle size={18} /> Secure Role-Based Access</li>
                      <li className="flex items-center gap-2"><CheckCircle size={18} /> Real-Time Course Enrollment</li>
                      <li className="flex items-center gap-2"><CheckCircle size={18} /> Dynamic Dashboard Analytics</li>
                      <li className="flex items-center gap-2"><CheckCircle size={18} /> Responsive Mobile Design</li>
                      <li className="flex items-center gap-2"><CheckCircle size={18} /> Automated Validation</li>
                      <li className="flex items-center gap-2"><CheckCircle size={18} /> RESTful API Architecture</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}