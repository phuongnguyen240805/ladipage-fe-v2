'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { scheduleAdjustmentApi } from '@/features/education/api/schedule-adjustment';
import { lecturerApi } from '@/features/education/api/lecturer';
import { toast } from 'sonner';
import { 
  FileText, Loader2, Check, X, RotateCcw, Search, 
  Calendar, AlertCircle, ChevronLeft, ChevronRight, 
  Clock, MapPin, CheckCircle2, User, BookOpen, AlertTriangle
} from 'lucide-react';
import { Badge } from '@/features/education/components/ui/badge';

export default function AdminScheduleAdjustmentsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLecturerId, setFilterLecturerId] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'history'>('pending');
  
  // Expanded card state
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  
  // Action state (Approve/Reject/Return)
  const [actioningRequestId, setActioningRequestId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'RETURN' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mini-calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchRequests();
    fetchLecturers();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await scheduleAdjustmentApi.searchAdmin();
      setRequests(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await lecturerApi.getAll();
      setLecturers(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Không thể tải danh sách giảng viên', error);
    }
  };

  const handleActionClick = (requestId: string, type: 'APPROVE' | 'REJECT' | 'RETURN') => {
    setActioningRequestId(requestId);
    setActionType(type);
    setAdminNote('');
  };

  const handleConfirmAction = async (requestId: string) => {
    if (!actionType) return;
    
    // Ghi chú của admin bắt buộc và ít nhất 10 ký tự cho Reject và Return
    if ((actionType === 'REJECT' || actionType === 'RETURN') && adminNote.trim().length < 10) {
      toast.error('Vui lòng nhập ghi chú lý do ít nhất 10 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      if (actionType === 'APPROVE') {
        await scheduleAdjustmentApi.approve(requestId, { note: adminNote });
        toast.success('Đã duyệt yêu cầu điều chỉnh lịch học');
      } else if (actionType === 'REJECT') {
        await scheduleAdjustmentApi.reject(requestId, { note: adminNote });
        toast.success('Đã từ chối yêu cầu điều chỉnh lịch học');
      } else if (actionType === 'RETURN') {
        await scheduleAdjustmentApi.returnToInstructor(requestId, { note: adminNote });
        toast.success('Đã trả yêu cầu về cho Giảng viên chỉnh sửa');
      }
      
      setActioningRequestId(null);
      setActionType(null);
      setAdminNote('');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý yêu cầu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDetail = (requestId: string) => {
    setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
    // Reset action state when switching requests
    if (actioningRequestId !== requestId) {
      setActioningRequestId(null);
      setActionType(null);
      setAdminNote('');
    }
  };

  // Helper formats
  const formatDateVi = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      return `${days[date.getDay()]}, ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': 
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Chờ duyệt</span>;
      case 'APPROVED': 
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Đã duyệt</span>;
      case 'REJECTED': 
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">Từ chối</span>;
      case 'RETURNED': 
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Yêu cầu sửa</span>;
      case 'CONFLICT_DETECTED': 
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">Có xung đột</span>;
      default: 
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200">{status}</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ABSENT_MAKEUP': return 'Nghỉ & Dạy bù';
      case 'EXTRA_SESSION': return 'Tăng tiết';
      case 'RESCHEDULE': return 'Đổi lịch';
      case 'ROOM_CHANGE': return 'Đổi phòng';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ABSENT_MAKEUP': return <span className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-lg text-rose-600">🚫</span>;
      case 'EXTRA_SESSION': return <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-lg text-emerald-600">➕</span>;
      case 'RESCHEDULE': return <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-lg text-blue-600">🔄</span>;
      case 'ROOM_CHANGE': return <span className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-lg text-purple-600">🚪</span>;
      default: return <span className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950/30 flex items-center justify-center text-lg text-slate-600">📝</span>;
    }
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Tab status filter
      if (activeTab === 'pending') {
        if (req.status !== 'PENDING' && req.status !== 'CONFLICT_DETECTED') return false;
      } else if (activeTab === 'approved') {
        if (req.status !== 'APPROVED') return false;
      } else {
        if (req.status === 'PENDING' || req.status === 'CONFLICT_DETECTED' || req.status === 'APPROVED') return false;
      }

      // Dropdown filters
      if (filterLecturerId !== 'ALL' && req.requestedByInstructorId !== filterLecturerId) return false;
      if (filterType !== 'ALL' && req.requestType !== filterType) return false;

      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const instructor = req.instructorName?.toLowerCase() || '';
        const classCode = req.classCode?.toLowerCase() || '';
        const courseClass = req.courseClassName?.toLowerCase() || '';
        if (!instructor.includes(query) && !classCode.includes(query) && !courseClass.includes(query)) return false;
      }

      return true;
    });
  }, [requests, activeTab, filterLecturerId, filterType, searchTerm]);

  // Compute stats
  const stats = useMemo(() => {
    const pending = requests.filter(r => r.status === 'PENDING').length;
    const conflicts = requests.filter(r => r.status === 'CONFLICT_DETECTED').length;
    const approved = requests.filter(r => r.status === 'APPROVED').length;
    return {
      total: requests.length,
      pending,
      conflicts,
      approved,
      processed: requests.length - pending - conflicts
    };
  }, [requests]);

  // Mini-calendar generation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const dayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon...
    // Adjust to start on Mon (0=Mon, 6=Sun)
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = [];
    // Pad previous month days
    for (let i = 0; i < offset; i++) {
      days.push({ day: null, dateStr: '', status: null });
    }
    // Populate current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      // Format as YYYY-MM-DD local time
      const yearStr = date.getFullYear();
      const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
      const dayStr = date.getDate().toString().padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

      // Check matching adjustments
      let dayStatus: 'absent' | 'makeup' | 'pending' | null = null;
      const dateRequests = requests.filter(r => r.absentDate === dateStr || r.proposedDate === dateStr);
      
      if (dateRequests.length > 0) {
        if (dateRequests.some(r => r.proposedDate === dateStr && r.status === 'APPROVED')) {
          dayStatus = 'makeup';
        } else if (dateRequests.some(r => r.absentDate === dateStr && r.status === 'APPROVED')) {
          dayStatus = 'absent';
        } else {
          dayStatus = 'pending';
        }
      }

      days.push({
        day: d,
        dateStr,
        status: dayStatus,
        isToday: new Date().toDateString() === date.toDateString()
      });
    }
    return days;
  }, [currentMonth, currentYear, requests]);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Find upcoming class list this week
  const upcomingSchedules = useMemo(() => {
    const today = new Date();
    return requests
      .filter(r => {
        if (!r.proposedDate) return false;
        const pDate = new Date(r.proposedDate);
        return pDate >= today && r.status === 'APPROVED';
      })
      .sort((a, b) => new Date(a.proposedDate).getTime() - new Date(b.proposedDate).getTime())
      .slice(0, 4);
  }, [requests]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-brand-500">📋</span> Quản lý điều chỉnh lịch dạy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Xét duyệt các yêu cầu báo nghỉ, dạy bù, dạy tăng tiết và thay đổi phòng học của giảng viên.
          </p>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng số đơn</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.total}</div>
          <div className="text-xs text-slate-400 mt-2">Tổng số yêu cầu đã nhận</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chờ phê duyệt</div>
          <div className="text-3xl font-extrabold text-amber-500 mt-2">{stats.pending}</div>
          <div className="text-xs text-amber-500/80 mt-2 flex items-center gap-1">
            <AlertCircle size={12} /> Cần kiểm tra xét duyệt
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Có xung đột</div>
          <div className="text-3xl font-extrabold text-rose-500 mt-2">{stats.conflicts}</div>
          <div className="text-xs text-rose-500/80 mt-2 flex items-center gap-1">
            <AlertTriangle size={12} /> Trùng phòng hoặc trùng lịch
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đã phê duyệt</div>
          <div className="text-3xl font-extrabold text-emerald-500 mt-2">{stats.approved}</div>
          <div className="text-xs text-emerald-500/85 mt-2 flex items-center gap-1">
            <CheckCircle2 size={12} /> Hệ thống tự cập nhật lịch
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs header & Filters */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => { setActiveTab('pending'); setExpandedRequestId(null); }}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-150 flex items-center gap-2 ${
                    activeTab === 'pending' 
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  ⏳ Chờ duyệt 
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === 'pending' ? 'bg-white text-brand-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350'
                  }`}>
                    {stats.pending + stats.conflicts}
                  </span>
                </button>
                <button 
                  onClick={() => { setActiveTab('approved'); setExpandedRequestId(null); }}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-150 flex items-center gap-2 ${
                    activeTab === 'approved' 
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  ✅ Đã duyệt
                </button>
                <button 
                  onClick={() => { setActiveTab('history'); setExpandedRequestId(null); }}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-150 flex items-center gap-2 ${
                    activeTab === 'history' 
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  📋 Lịch sử
                </button>
              </div>
            </div>

            {/* Sub Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Tìm GV, mã lớp, môn học..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <select 
                value={filterLecturerId}
                onChange={e => setFilterLecturerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="ALL">Tất cả giảng viên</option>
                {lecturers.map(l => (
                  <option key={l.employeeId} value={l.employeeId}>
                    {l.fullName} ({l.employeeCode})
                  </option>
                ))}
              </select>

              <select 
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="ALL">Tất cả loại yêu cầu</option>
                <option value="ABSENT_MAKEUP">Nghỉ & Dạy bù</option>
                <option value="EXTRA_SESSION">Tăng tiết</option>
                <option value="RESCHEDULE">Đổi lịch</option>
                <option value="ROOM_CHANGE">Đổi phòng</option>
              </select>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-500" />
                <span>Đang tải danh sách yêu cầu...</span>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
                <FileText className="w-12 h-12 opacity-25 mx-auto mb-3" />
                <div className="text-base font-semibold">Không tìm thấy yêu cầu nào</div>
                <p className="text-xs text-slate-400 mt-1">Không có đơn điều chỉnh lịch nào thỏa mãn bộ lọc hiện tại.</p>
              </div>
            ) : (
              filteredRequests.map(req => {
                const isExpanded = expandedRequestId === req.requestId;
                const isActioning = actioningRequestId === req.requestId;

                return (
                  <div 
                    key={req.requestId}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Card Header Clickable */}
                    <div 
                      onClick={() => toggleDetail(req.requestId)}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/10"
                    >
                      <div className="flex items-center gap-3">
                        {getTypeIcon(req.requestType)}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {getTypeLabel(req.requestType)} 
                            <span className="text-xs font-normal text-slate-500">• Lớp: {req.classCode}</span>
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                              <User size={13} /> {req.instructorName || 'Chưa rõ Gi giảng viên'}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen size={13} /> {req.courseClassName || 'Môn học'}
                            </span>
                            <span className="text-slate-400">Gửi: {new Date(req.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(req.status)}
                        <span className="text-slate-400 text-lg transition-transform duration-200">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>

                    {/* Card Body (Collapsible Detail) */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-5 space-y-5">
                        
                        {/* Timeline Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">📋 Chi tiết yêu cầu</div>
                            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                              <div>
                                <span className="font-semibold text-slate-500">Giảng viên:</span> {req.instructorName} ({req.instructorCode})
                              </div>
                              <div>
                                <span className="font-semibold text-slate-500">Lý do điều chỉnh:</span>
                                <div className="mt-1 p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl italic">
                                  "{req.reason || 'Không cung cấp lý do'}"
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Visual Timeline boxes */}
                          <div className="flex flex-col justify-center">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">⏱ Khung thời gian điều chỉnh</div>
                            <div className="flex items-center justify-between gap-2 p-4 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-sm">
                              {/* Left box: Absent Session */}
                              {req.requestType !== 'EXTRA_SESSION' ? (
                                <div className="flex-1 text-center p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-dashed border-rose-300 dark:border-rose-800 rounded-xl">
                                  <div className="text-[11px] font-bold text-rose-600 uppercase">Nghỉ (hủy buổi)</div>
                                  <div className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                                    {req.absentDate ? new Date(req.absentDate).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'}) : '-'}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">Tiết: {req.absentSlotCode || 'Ca học'} ({req.absentPeriods || 3}T)</div>
                                </div>
                              ) : (
                                <div className="flex-1 text-center p-3.5 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 rounded-xl">
                                  <div className="text-[11px] font-bold uppercase">Không hủy</div>
                                  <div className="text-sm mt-1">—</div>
                                </div>
                              )}

                              {/* Arrow */}
                              <div className="text-slate-400 font-bold px-1 flex flex-col items-center">
                                <span className="text-xl">➔</span>
                                <span className="text-[9px] uppercase tracking-tighter">Bù</span>
                              </div>

                              {/* Right box: Proposed Session */}
                              <div className="flex-1 text-center p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-xl">
                                <div className="text-[11px] font-bold text-emerald-600 uppercase">
                                  {req.requestType === 'ROOM_CHANGE' ? 'Đổi phòng học' : 'Học bù / Dạy mới'}
                                </div>
                                <div className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                                  {req.proposedDate ? new Date(req.proposedDate).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'}) : '-'}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  P.{req.proposedRoomCode || 'Phòng'} | Ca {req.proposedSlotCode || 'Ca'} ({req.proposedPeriods || 3}T)
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Automatic Checklist box */}
                        <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide flex items-center gap-1.5 mb-3">
                            🔍 Kết quả kiểm tra tự động
                          </h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                            <div className="flex items-center gap-2 py-1 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-400">
                              <span className="text-sm">✓</span> <span>Giảng viên không trùng lịch khác cùng giờ đề xuất</span>
                            </div>
                            
                            <div className={`flex items-center gap-2 py-1 px-2.5 rounded-lg ${
                              req.status === 'CONFLICT_DETECTED' 
                                ? 'bg-rose-50 dark:bg-rose-950/10 text-rose-800 dark:text-rose-400' 
                                : 'bg-emerald-50 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-400'
                            }`}>
                              <span>{req.status === 'CONFLICT_DETECTED' ? '✗' : '✓'}</span> 
                              <span>{req.status === 'CONFLICT_DETECTED' ? 'Phát hiện trùng phòng học hoặc trùng giờ sinh viên' : 'Phòng học đề xuất đang trống'}</span>
                            </div>

                            <div className="flex items-center gap-2 py-1 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-400">
                              <span className="text-sm">✓</span> <span>Ngày đề xuất bù nằm trong khung thời gian học kỳ</span>
                            </div>

                            <div className="flex items-center gap-2 py-1 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-400">
                              <span className="text-sm">✓</span> <span>Sức chứa phòng đáp ứng sĩ số lớp học</span>
                            </div>
                          </div>
                        </div>

                        {/* Inline Review Action Input area */}
                        {isActioning && (
                          <div className="p-4 bg-blue-50/50 dark:bg-slate-950/50 border border-blue-200 dark:border-slate-800 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-3 duration-250">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">
                              Ghi chú của Admin 
                              {(actionType === 'REJECT' || actionType === 'RETURN') && <span className="text-rose-500 ml-1">(Bắt buộc từ chối/yêu cầu sửa, tối thiểu 10 ký tự)</span>}
                            </label>
                            
                            <textarea 
                              value={adminNote}
                              onChange={e => setAdminNote(e.target.value)}
                              placeholder={
                                actionType === 'APPROVE' ? 'Thêm ghi chú phê duyệt (tùy chọn)...' :
                                actionType === 'REJECT' ? 'Nhập lý do từ chối yêu cầu (bắt buộc)...' :
                                'Nhập ghi chú hướng dẫn sửa đổi gửi cho Giảng viên (bắt buộc)...'
                              }
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            />

                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => { setActioningRequestId(null); setActionType(null); }}
                                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all"
                              >
                                Hủy bỏ
                              </button>
                              <button 
                                onClick={() => handleConfirmAction(req.requestId)}
                                disabled={isSubmitting}
                                className={`px-4 py-1.5 text-xs font-bold text-white rounded-lg flex items-center gap-1.5 transition-all ${
                                  actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/25' :
                                  actionType === 'REJECT' ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/25' :
                                  'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25'
                                }`}
                              >
                                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Xác nhận
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Banner status check */}
                        {req.status === 'APPROVED' && (
                          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl p-3 text-center text-xs font-bold text-emerald-800 dark:text-emerald-400">
                            ✅ Yêu cầu đã được phê duyệt thành công — Thời khóa biểu hệ thống đã được cập nhật tự động.
                            {req.adminNote && <div className="font-normal text-slate-600 dark:text-slate-400 mt-1">Ghi chú: "{req.adminNote}"</div>}
                          </div>
                        )}

                        {req.status === 'REJECTED' && (
                          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl p-3 text-center text-xs font-bold text-rose-800 dark:text-rose-450">
                            ❌ Yêu cầu đã bị từ chối.
                            {req.adminNote && <div className="font-normal text-slate-600 dark:text-slate-400 mt-1">Ghi chú: "{req.adminNote}"</div>}
                          </div>
                        )}

                        {req.status === 'RETURNED' && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-3 text-center text-xs font-bold text-blue-800 dark:text-blue-400">
                            ↩️ Đã trả đơn về yêu cầu giảng viên chỉnh sửa lại thông tin đề xuất.
                            {req.adminNote && <div className="font-normal text-slate-600 dark:text-slate-400 mt-1">Ghi chú: "{req.adminNote}"</div>}
                          </div>
                        )}

                        {/* Action buttons footer */}
                        {(req.status === 'PENDING' || req.status === 'CONFLICT_DETECTED') && !isActioning && (
                          <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
                            <button 
                              onClick={() => handleActionClick(req.requestId, 'RETURN')}
                              className="px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center gap-1.5 transition-colors border border-blue-200"
                            >
                              <RotateCcw size={14} /> Yêu cầu sửa
                            </button>
                            <button 
                              onClick={() => handleActionClick(req.requestId, 'REJECT')}
                              className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center gap-1.5 transition-colors border border-rose-200"
                            >
                              <X size={14} /> Từ chối
                            </button>
                            <button 
                              onClick={() => handleActionClick(req.requestId, 'APPROVE')}
                              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all border border-emerald-700"
                            >
                              <Check size={14} /> Phê duyệt & Đổi lịch
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar (1 col) */}
        <div className="space-y-6">
          
          {/* Mini Calendar Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>📅</span> {monthNames[currentMonth]} / {currentYear}
              </h3>
              <div className="flex gap-1">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Week Labels */}
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(label => (
                  <div key={label} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
                    {label}
                  </div>
                ))}

                {/* Day Blocks */}
                {calendarDays.map((dayObj, index) => {
                  if (!dayObj.day) {
                    return <div key={`empty-${index}`} className="aspect-square opacity-0 pointer-events-none" />;
                  }

                  let dayClass = 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';
                  let borderClass = 'border border-transparent';
                  
                  if (dayObj.status === 'absent') {
                    dayClass = 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 font-bold line-through';
                    borderClass = 'border border-rose-300 dark:border-rose-800';
                  } else if (dayObj.status === 'makeup') {
                    dayClass = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 font-bold';
                    borderClass = 'border border-emerald-300 dark:border-emerald-800';
                  } else if (dayObj.status === 'pending') {
                    dayClass = 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 font-bold';
                    borderClass = 'border border-amber-300 dark:border-amber-700';
                  }

                  if (dayObj.isToday) {
                    borderClass = 'border-2 border-brand-500 dark:border-brand-500 font-extrabold';
                  }

                  return (
                    <div 
                      key={`day-${dayObj.day}`}
                      title={dayObj.dateStr}
                      className={`aspect-square flex items-center justify-center text-xs rounded-lg cursor-pointer transition-all duration-100 ${dayClass} ${borderClass}`}
                    >
                      {dayObj.day}
                    </div>
                  );
                })}
              </div>

              {/* Legends */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-rose-100 dark:bg-rose-950/30 border border-rose-350" /> Nghỉ (Đã duyệt)
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-350" /> Dạy bù (Đã duyệt)
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-100 dark:bg-amber-950/30 border border-amber-350" /> Chờ duyệt
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded border border-brand-500" /> Hôm nay
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Schedule Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                📌 Buổi dạy bù sắp tới tuần này
              </h3>
            </div>
            
            <div className="p-4">
              {upcomingSchedules.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-8">
                  Không có lịch dạy bù sắp tới trong tuần.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSchedules.map(sched => (
                    <div 
                      key={sched.requestId} 
                      className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col gap-1 text-xs"
                    >
                      <div className="flex justify-between items-center font-bold text-slate-700 dark:text-slate-350">
                        <span>{formatDateVi(sched.proposedDate)}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/30 text-[10px]">
                          P.{sched.proposedRoomCode || 'Phòng'}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-0.5 truncate font-semibold" title={sched.courseClassName}>
                        {sched.courseClassName}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                        <span>GV: {sched.instructorName}</span>
                        <span>Ca {sched.proposedSlotCode || ''} ({sched.proposedPeriods || 3} tiết)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
