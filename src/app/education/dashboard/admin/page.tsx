'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/education/context/AuthContext';
import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';
import {
  UserPlus,
  PlusCircle,
  BookOpen,
  FileText,
  CalendarDays,
  BarChart3,
  Settings,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // State cho dữ liệu từ API
  const [stats, setStats] = useState({
    totalStudents: 12560,
    totalLecturers: 356,
    totalClasses: 512,
    totalCourses: 1248,
    studentGrowth: 8.2,
    lecturerGrowth: 4.1,
    classGrowth: 6.7,
    courseGrowth: 5.3,
  });
  
  const [studyStats, setStudyStats] = useState({
    attendanceRate: 92.5,
    passRate: 87.3,
    graduationRate: 89.1,
    employmentRate: 95.2,
    attendanceGrowth: 3.2,
    passGrowth: 2.7,
    graduationGrowth: 4.5,
    employmentGrowth: 3.8,
  });
  
  const [currentDate, setCurrentDate] = useState('');
  const [loading, setLoading] = useState(true);

  const userName = 
    user?.fullName || 
    (user as any)?.name || 
    (user as any)?.displayName || 
    (user as any)?.username || 
    user?.email || 
    'Tài khoản Admin';

  // Format ngày tháng
  const formatDate = (date: Date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  };

  // API 1: Lấy thống kê tổng quan
  const fetchDashboardStats = async () => {
    try {
      const response = await request.get('/api/v1/dashboard/admin/stats');
      const data = unwrapApiResponse<any>(response);
      if (data) {
        setStats(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.log('Dashboard stats API chưa có, đang dùng dữ liệu mặc định');
    }
  };

  // API 2: Lấy số liệu từ các API đã có (số lượng sinh viên, giảng viên, lớp, môn)
  const fetchRealCounts = async () => {
    try {
      const [studentsRes, lecturersRes, classesRes, coursesRes] = await Promise.all([
        request.get('/api/v1/students/admin', { params: { size: 1 } }),
        request.get('/api/v1/instructors/admin', { params: { size: 1 } }),
        request.get('/api/v1/classes/admin', { params: { size: 1 } }),
        request.get('/api/v1/courses', { params: { size: 1 } }),
      ]);

      const studentsData = unwrapApiResponse<any>(studentsRes);
      const lecturersData = unwrapApiResponse<any>(lecturersRes);
      const classesData = unwrapApiResponse<any>(classesRes);
      const coursesData = unwrapApiResponse<any>(coursesRes);

      setStats(prev => ({
        ...prev,
        totalStudents: studentsData.totalElements || studentsData.length || prev.totalStudents,
        totalLecturers: lecturersData.totalElements || lecturersData.length || prev.totalLecturers,
        totalClasses: classesData.totalElements || classesData.length || prev.totalClasses,
        totalCourses: coursesData.totalElements || coursesData.length || prev.totalCourses,
      }));
    } catch (error) {
      console.log('Không thể lấy số liệu thực tế, giữ nguyên dữ liệu mặc định');
    }
  };

  // API 3: Lấy thống kê học tập
  const fetchStudyStats = async () => {
    try {
      const response = await request.get('/api/v1/dashboard/admin/study-stats');
      const data = unwrapApiResponse<any>(response);
      if (data) {
        setStudyStats(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.log('Study stats API chưa có, đang dùng dữ liệu mặc định');
    }
  };

  useEffect(() => {
    setCurrentDate(formatDate(new Date()));
    
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchRealCounts(),      // API đã có - lấy số liệu thật
        fetchDashboardStats(),  // API sẽ có - dùng khi BE có
        fetchStudyStats(),      // API sẽ có - dùng khi BE có
      ]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pt-[20px] md:pt-[40px] space-y-6 bg-[#f8fafc] min-h-screen w-full max-w-full overflow-x-hidden font-sans">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:items-center">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 flex items-center gap-2">
            Xin chào, {userName} <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Chúc bạn một ngày làm việc hiệu quả!</p>
        </div>
        <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 shadow-sm flex items-center gap-2 flex-shrink-0">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          {currentDate}
        </div>
      </div>

      {/* 4 Thẻ thống kê hàng đầu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {/* Sinh viên */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(11,22,44,0.03)] border border-gray-100 flex items-start justify-between w-full">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-500">Sinh viên</p>
            <p className="text-[28px] font-bold text-gray-900 tracking-tight">{stats.totalStudents.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-[12px] pt-1">
              <span className="text-emerald-600 font-medium flex items-center">↑ {stats.studentGrowth}%</span>
              <span className="text-gray-400">so với tháng trước</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>

        {/* Giảng viên */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(11,22,44,0.03)] border border-gray-100 flex items-start justify-between w-full">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-500">Giảng viên</p>
            <p className="text-[28px] font-bold text-gray-900 tracking-tight">{stats.totalLecturers.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-[12px] pt-1">
              <span className="text-emerald-600 font-medium flex items-center">↑ {stats.lecturerGrowth}%</span>
              <span className="text-gray-400">so với tháng trước</span>
            </div>
          </div>
          <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>
          </div>
        </div>

        {/* Lớp học */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(11,22,44,0.03)] border border-gray-100 flex items-start justify-between w-full">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-500">Lớp học</p>
            <p className="text-[28px] font-bold text-gray-900 tracking-tight">{stats.totalClasses.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-[12px] pt-1">
              <span className="text-emerald-600 font-medium flex items-center">↑ {stats.classGrowth}%</span>
              <span className="text-gray-400">so với tháng trước</span>
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-2xl text-green-600 flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
          </div>
        </div>

        {/* Môn học */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(11,22,44,0.03)] border border-gray-100 flex items-start justify-between w-full">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-500">Môn học</p>
            <p className="text-[28px] font-bold text-gray-900 tracking-tight">{stats.totalCourses.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-[12px] pt-1">
              <span className="text-emerald-600 font-medium flex items-center">↑ {stats.courseGrowth}%</span>
              <span className="text-gray-400">so với tháng trước</span>
            </div>
          </div>
          <div className="p-3 bg-red-50 rounded-2xl text-red-500 flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M12 4v16M2 12h20"/></svg>
          </div>
        </div>
      </div>

      {/* Hàng giữa */}
      <div className="grid grid-cols-12 gap-6 w-full">
        {/* Biểu đồ Thống kê sinh viên */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(11,22,44,0.03)] border border-gray-100 w-full block">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <h3 className="font-bold text-gray-800 text-[16px]">Thống kê sinh viên</h3>
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> Tuyển mới
                </span>
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span> Tốt nghiệp
                </span>
              </div>
              <select className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 outline-none font-medium">
                <option>6 tháng gần đây</option>
              </select>
            </div>
          </div>
          
          <div className="relative h-56 w-full mt-4 block">
            <svg className="w-full h-full block" viewBox="0 0 500 180" preserveAspectRatio="none">
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#f1f5f9" strokeWidth="1" />
              <path d="M 20 110 L 110 80 L 200 90 L 290 65 L 380 72 L 470 40" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="470" cy="40" r="4" fill="#10B981" />
              <path d="M 20 150 L 110 140 L 200 155 L 290 135 L 380 142 L 470 120" fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="470" cy="120" r="4" fill="#F97316" />
            </svg>
            <div className="flex justify-between text-[11px] text-gray-400 font-medium px-1 mt-2">
              <span>Tháng 12</span><span>Tháng 1</span><span>Tháng 2</span><span>Tháng 3</span><span>Tháng 4</span><span>Tháng 5</span>
            </div>
          </div>
        </div>

        {/* Thông báo */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(11,22,44,0.03)] border border-gray-100 w-full">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-800 text-[16px]">Thông báo</h3>
            <button className="text-xs font-semibold text-emerald-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 leading-snug truncate">Thông báo nghỉ lễ 30/04 - 01/05</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Phòng Hành chính - 2 giờ trước</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 leading-snug truncate">Cập nhật thời khóa biểu học kỳ 2</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Phòng Đào tạo - 5 giờ trước</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2h12a2 2 0 0 0-2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 leading-snug truncate">Hạn nộp học phí học kỳ 2 năm 2023-2024</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Phòng Tài chính - 1 ngày trước</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 text-purple-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 leading-snug truncate">Workshop: Ứng dụng AI trong giảng dạy</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Khoa CNTT - 2 ngày trước</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lịch công tác */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(11,22,44,0.03)] border border-gray-100 w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-[16px]">Lịch công tác</h3>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-4 px-1">
            <button>&lt;</button>
            <span>Tháng 5, 2024</span>
            <button>&gt;</button>
          </div>
          <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-medium mb-2 w-full">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
              <div key={d} className="text-gray-400 text-[11px]">{d}</div>
            ))}
            {[29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2].map((date, i) => {
              const isCurrentMonth = i >= 2 && i <= 32;
              const isToday = date === 22 && isCurrentMonth;
              return (
                <div 
                  key={i} 
                  className={`py-1.5 text-[12px] flex items-center justify-center rounded-xl font-medium ${
                    isToday ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-100' : 
                    isCurrentMonth ? 'text-gray-800' : 'text-gray-300'
                  }`}
                >
                  {date}
                </div>
              );
            })}
          </div>
          <button className="w-full mt-4 text-xs font-bold text-emerald-600 text-center py-2.5 border border-dashed border-emerald-200 bg-emerald-50/30 rounded-xl hover:bg-emerald-50 transition">
            + Thêm lịch công tác
          </button>
        </div>
      </div>

      {/* Hàng dưới */}
      <div className="grid grid-cols-12 gap-6 w-full">
        {/* Tình hình học tập */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(11,22,44,0.03)] border border-gray-100 w-full">
          <h3 className="font-bold text-gray-800 text-[16px] mb-5">Tình hình học tập</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch w-full">
            {/* Thẻ 1 */}
            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100 flex flex-col justify-between h-full relative overflow-hidden w-full">
              <div>
                <p className="text-xs font-semibold text-gray-500 min-h-[32px] flex items-start">Tỷ lệ chuyên cần</p>
                <p className="text-[22px] font-bold text-gray-900 mt-2 tracking-tight">{studyStats.attendanceRate}%</p>
              </div>
              <div className="text-[11px] text-emerald-600 mt-4 pt-1 flex items-center justify-between gap-1">
                <span className="font-medium truncate">↑ {studyStats.attendanceGrowth}% <span className="text-gray-400 font-normal">so với trước</span></span>
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] flex-shrink-0">✓</div>
              </div>
            </div>

            {/* Thẻ 2 */}
            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100 flex flex-col justify-between h-full relative overflow-hidden w-full">
              <div>
                <p className="text-xs font-semibold text-gray-500 min-h-[32px] flex items-start">Tỷ lệ đạt</p>
                <p className="text-[22px] font-bold text-gray-900 mt-2 tracking-tight">{studyStats.passRate}%</p>
              </div>
              <div className="text-[11px] text-emerald-600 mt-4 pt-1 flex items-center justify-between gap-1">
                <span className="font-medium truncate">↑ {studyStats.passGrowth}% <span className="text-gray-400 font-normal">so với trước</span></span>
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center text-[10px] flex-shrink-0">★</div>
              </div>
            </div>

            {/* Thẻ 3 */}
            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100 flex flex-col justify-between h-full relative overflow-hidden w-full">
              <div>
                <p className="text-xs font-semibold text-gray-500 min-h-[32px] flex items-start">Tỷ lệ tốt nghiệp đúng hạn</p>
                <p className="text-[22px] font-bold text-gray-900 mt-2 tracking-tight">{studyStats.graduationRate}%</p>
              </div>
              <div className="text-[11px] text-emerald-600 mt-4 pt-1 flex items-center justify-between gap-1">
                <span className="font-medium truncate">↑ {studyStats.graduationGrowth}% <span className="text-gray-400 font-normal">so với trước</span></span>
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] flex-shrink-0">🎓</div>
              </div>
            </div>

            {/* Thẻ 4 */}
            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100 flex flex-col justify-between h-full relative overflow-hidden w-full">
              <div>
                <p className="text-xs font-semibold text-gray-500 min-h-[32px] flex items-start">Tỷ lệ SV có việc làm</p>
                <p className="text-[22px] font-bold text-gray-900 mt-2 tracking-tight">{studyStats.employmentRate}%</p>
              </div>
              <div className="text-[11px] text-emerald-600 mt-4 pt-1 flex items-center justify-between gap-1">
                <span className="font-medium truncate">↑ {studyStats.employmentGrowth}% <span className="text-gray-400 font-normal">so với trước</span></span>
                <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] flex-shrink-0">💼</div>
              </div>
            </div>
          </div>
        </div>

        {/* Truy cập nhanh */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(11,22,44,0.03)] border border-gray-100 w-full">
          <h3 className="font-bold text-gray-800 text-[16px] mb-5">Truy cập nhanh</h3>
          <div className="grid grid-cols-4 gap-4 w-full">
            {[
              { label: 'Thêm sinh viên', icon: <UserPlus className="h-5 w-5 text-emerald-600" />, href: '/education/dashboard/admin/students' },
              { label: 'Thêm GV', icon: <UserPlus className="h-5 w-5 text-emerald-600" />, href: '/education/dashboard/admin/lecturers' },
              { label: 'Tạo lớp học', icon: <PlusCircle className="h-5 w-5 text-emerald-600" />, href: '/education/dashboard/admin/classes' },
              { label: 'Tạo môn học', icon: <BookOpen className="h-5 w-5 text-emerald-600" />, href: '/education/dashboard/admin/courses' },
              { label: 'Lịch biểu', icon: <CalendarDays className="h-5 w-5 text-emerald-600" />, href: '/education/dashboard/admin/schedules' },
              { label: 'Báo cáo', icon: <BarChart3 className="h-5 w-5 text-emerald-600" />, href: '/education/dashboard/admin/reports' },
              { label: 'Cài đặt', icon: <Settings className="h-5 w-5 text-emerald-600" />, href: '/education/dashboard/admin/settings' },
            ].map((item, idx) => (
              <a key={idx} href={item.href} className="flex flex-col items-center gap-1.5 text-center group min-w-0 w-full">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center transition group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:scale-105 flex-shrink-0">
                  {item.icon}
                </div>
                <span className="text-[11px] font-medium text-gray-600 group-hover:text-emerald-600 transition block truncate w-full">
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
