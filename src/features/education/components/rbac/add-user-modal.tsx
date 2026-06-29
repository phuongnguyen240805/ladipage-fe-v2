import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  UserCircle, 
  ShieldCheck, 
  RefreshCw, 
  Key, 
  Search, 
  Check,
  Upload
} from 'lucide-react';
import { Modal } from '@/features/education/components/ui/modal';
import { DatePicker } from '@/features/education/components/ui/date-picker';
import type { Role } from '@/features/education/types/rbac';
import { request } from '@/features/education/utils/request';
import { parseUserList } from './shared';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  allRoles: Role[];
  onSave: (userData: any) => void;
}

const removeVietnameseTones = (str: string) => {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  str = str.replace(/ + /g, ' ');
  str = str.trim();
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, ' ');
  return str;
};

export function AddUserModal({ isOpen, onClose, allRoles, onSave }: AddUserModalProps) {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [roleSearch, setRoleSearch] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  // Metadata states
  const [divisions, setDivisions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  // Selected IDs states
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedMajorId, setSelectedMajorId] = useState('');
  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');

  // Fetch metadata when modal is open
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [divsRes, deptsRes, majorsRes, cohortsRes, programsRes] = await Promise.all([
          request.get('/api/v1/divisions/admin'),
          request.get('/api/v1/departments/admin'),
          request.get('/api/v1/majors/admin'),
          request.get('/api/v1/academic-cohorts/admin'),
          request.get('/api/v1/training-programs/admin')
        ]);
        setDivisions(parseUserList(divsRes));
        setDepartments(parseUserList(deptsRes));
        setMajors(parseUserList(majorsRes));
        setCohorts(parseUserList(cohortsRes));
        setPrograms(parseUserList(programsRes));
      } catch (err) {
        console.error('Lỗi khi tải metadata để tạo user:', err);
      }
    };
    if (isOpen) {
      fetchMetadata();
    }
  }, [isOpen]);

  // Set default selections
  useEffect(() => {
    if (divisions.length > 0 && !selectedDivisionId) setSelectedDivisionId(divisions[0].divisionId || divisions[0].id);
  }, [divisions, selectedDivisionId]);

  useEffect(() => {
    if (departments.length > 0 && !selectedDepartmentId) setSelectedDepartmentId(departments[0].departmentId || departments[0].id);
  }, [departments, selectedDepartmentId]);

  useEffect(() => {
    if (majors.length > 0 && !selectedMajorId) setSelectedMajorId(majors[0].majorId || majors[0].id);
  }, [majors, selectedMajorId]);

  useEffect(() => {
    if (cohorts.length > 0 && !selectedCohortId) setSelectedCohortId(cohorts[0].cohortId || cohorts[0].id);
  }, [cohorts, selectedCohortId]);

  useEffect(() => {
    if (programs.length > 0 && !selectedProgramId) setSelectedProgramId(programs[0].trainingProgramId || programs[0].id);
  }, [programs, selectedProgramId]);

  // Derive user type based on selected roles
  const rolesInfo = Array.from(selectedRoles).map(roleId => allRoles.find(r => (r.id || r.roleId) === roleId));
  const isStudent = rolesInfo.some(r => r?.code === 'STUDENT');
  const isLecturer = rolesInfo.some(r => r?.code === 'LECTURER');
  const isStaff = rolesInfo.some(r => r && r.code !== 'STUDENT' && r.code !== 'LECTURER') || selectedRoles.size === 0;

  const isFormValid = (() => {
    if (!fullName || !dob) return false;
    if (isStudent) {
      return !!selectedMajorId && !!selectedCohortId && !!selectedProgramId;
    }
    if (isLecturer) {
      return !!selectedDepartmentId;
    }
    if (isStaff) {
      return !!selectedDivisionId;
    }
    return true;
  })();

  // Auto-generate Email from Full Name
  useEffect(() => {
    if (!fullName.trim()) {
      setEmail('');
      return;
    }
    const cleanName = removeVietnameseTones(fullName.trim())
      .toLowerCase()
      .replace(/\s+/g, '.');
    setEmail(`${cleanName}@uems.edu.vn`);
  }, [fullName]);

  // Auto-generate Password from DoB (DDMMYYYY)
  useEffect(() => {
    if (!dob) {
      setPassword('');
      return;
    }
    const [year, month, day] = dob.split('-');
    setPassword(`${day}${month}${year}`);
  }, [dob]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      fullName,
      dob,
      email,
      password,
      roles: Array.from(selectedRoles),
      avatar,
      isStudent,
      isLecturer,
      isStaff,
      divisionId: selectedDivisionId || null,
      departmentId: selectedDepartmentId || null,
      majorId: selectedMajorId || null,
      academicCohortId: selectedCohortId || null,
      trainingProgramId: selectedProgramId || null,
    });
    // Reset form
    setFullName('');
    setDob('');
    setSelectedRoles(new Set());
    setAvatar(null);
    setSelectedDivisionId('');
    setSelectedDepartmentId('');
    setSelectedMajorId('');
    setSelectedCohortId('');
    setSelectedProgramId('');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="max-w-4xl w-full mx-4"
    >
      <div className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Thêm người dùng mới</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tạo tài khoản và phân quyền hệ thống</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-400 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Personal Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <UserCircle size={18} className="text-emerald-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Thông tin cá nhân</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A" 
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    value={dob}
                    onChange={setDob}
                    placeholder="Chọn ngày sinh"
                  />
                </div>

                {/* Dynamically show additional fields based on selected roles */}
                {isStudent && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Ngành học <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedMajorId}
                        onChange={e => setSelectedMajorId(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
                      >
                        <option value="">-- Chọn ngành học --</option>
                        {majors.map(m => (
                          <option key={m.majorId || m.id} value={m.majorId || m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Niên khóa <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedCohortId}
                        onChange={e => setSelectedCohortId(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
                      >
                        <option value="">-- Chọn niên khóa --</option>
                        {cohorts.map(c => (
                          <option key={c.cohortId || c.id} value={c.cohortId || c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Chương trình đào tạo <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedProgramId}
                        onChange={e => setSelectedProgramId(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
                      >
                        <option value="">-- Chọn chương trình đào tạo --</option>
                        {programs.map(p => (
                          <option key={p.trainingProgramId || p.id} value={p.trainingProgramId || p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {isLecturer && !isStudent && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Khoa/Bộ môn <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedDepartmentId}
                        onChange={e => setSelectedDepartmentId(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
                      >
                        <option value="">-- Chọn khoa/bộ môn --</option>
                        {departments.map(d => (
                          <option key={d.departmentId || d.id} value={d.departmentId || d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {isStaff && !isStudent && !isLecturer && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Phòng ban <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedDivisionId}
                        onChange={e => setSelectedDivisionId(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
                      >
                        <option value="">-- Chọn phòng ban --</option>
                        {divisions.map(d => (
                          <option key={d.divisionId || d.id} value={d.divisionId || d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Avatar Preview</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border-2 border-dashed border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-500 overflow-hidden">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : fullName ? (
                        <span className="text-xl font-bold">{fullName[0].toUpperCase()}</span>
                      ) : (
                        <UserCircle size={32} strokeWidth={1.5} />
                      )}
                    </div>
                    <label className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-100 transition border border-emerald-200 dark:border-emerald-800/50 cursor-pointer">
                      <Upload size={14} className="inline mr-1" />
                      Upload ảnh
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Account & Permissions */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <ShieldCheck size={18} className="text-emerald-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tài khoản & Quyền hạn</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                    Email đăng nhập
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-full uppercase tracking-tight">Tự động</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      readOnly
                      placeholder="email@uems.edu.vn" 
                      className="w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 italic cursor-not-allowed" 
                    />
                    <RefreshCw size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                    Mật khẩu mặc định
                    <span className="text-[11px] text-gray-400 font-normal">DDMMYYYY</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={password}
                      readOnly
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-mono tracking-wider cursor-not-allowed" 
                    />
                    <Key size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
                  <p className="mt-1.5 text-[11px] text-gray-400 italic">Mật khẩu này sẽ được gửi qua email cho user sau khi tạo</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    Gán vai trò
                    <div className="relative w-32">
                      <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text"
                        value={roleSearch}
                        onChange={(e) => setRoleSearch(e.target.value)}
                        placeholder="Tìm role..."
                        className="w-full pl-6 pr-2 py-1 text-[11px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-1 focus:ring-emerald-500/30"
                      />
                    </div>
                  </label>
                  
                  <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-inner bg-gray-50/30 dark:bg-gray-950/30">
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-[13px]">
                        <thead className="sticky top-0 bg-white dark:bg-gray-900 shadow-sm text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
                          <tr>
                            <th className="py-2 px-3 w-8"></th>
                            <th className="py-2 px-2">Role</th>
                            <th className="py-2 px-2 text-right pr-4 text-[11px] uppercase tracking-tighter">Perms</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                          {allRoles
                            .filter(r => 
                              !roleSearch || 
                              r.name.toLowerCase().includes(roleSearch.toLowerCase()) || 
                              r.code.toLowerCase().includes(roleSearch.toLowerCase())
                            )
                            .map(role => {
                              const roleId = role.id || role.roleId || '';
                              const isChecked = selectedRoles.has(roleId);
                              return (
                                <tr 
                                  key={roleId}
                                  className={`group hover:bg-emerald-50/40 dark:hover:bg-emerald-900/5 transition-colors cursor-pointer ${isChecked ? 'bg-emerald-50/60 dark:bg-emerald-900/10' : ''}`}
                                  onClick={() => {
                                    const newSet = new Set(selectedRoles);
                                    if (newSet.has(roleId)) newSet.delete(roleId);
                                    else newSet.add(roleId);
                                    setSelectedRoles(newSet);
                                  }}
                                >
                                  <td className="py-2.5 px-3">
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked}
                                      onChange={() => {}} 
                                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" 
                                    />
                                  </td>
                                  <td className="py-2.5 px-2">
                                    <p className="font-semibold text-gray-700 dark:text-gray-200">{role.name}</p>
                                    <p className="text-[11px] text-gray-400 line-clamp-1 truncate max-w-[150px]">{role.description || 'Không có mô tả'}</p>
                                  </td>
                                  <td className="py-2.5 px-2 text-right pr-4">
                                    <span className="inline-flex px-1.5 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-[10px] font-bold text-gray-500">
                                      {role.permissions?.length || 0}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                  <UserCircle size={14} />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Auto-pilot user creation active</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="button"
              onClick={handleSave}
              disabled={!isFormValid}
              className={`flex items-center gap-2 px-6 py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-all ${
                isFormValid
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 hover:-translate-y-0.5' 
                  : 'bg-gray-300 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Tạo user</span>
              <Check size={16} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
