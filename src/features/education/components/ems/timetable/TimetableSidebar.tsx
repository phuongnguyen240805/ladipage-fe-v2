import React from 'react';
import { Search, CalendarDays, Clock, Users } from 'lucide-react';
import { Input } from "@/features/education/components/ui/input"; // Import Input của Shadcn UI

interface Props {
  courseClasses: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  externalEventsRef: React.RefObject<HTMLDivElement | null>;
}

export default function TimetableSidebar({ courseClasses, searchTerm, setSearchTerm, externalEventsRef }: Props) {
  // Lọc theo từ khóa tìm kiếm
  const filteredClasses = courseClasses.filter(c => 
    c.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.classCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-[220px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-white/60 text-[14px] shadow-sm backdrop-blur-xl dark:bg-gray-900/40 xl:min-h-0">
      <div className="p-4 border-b border-border bg-white/40 dark:bg-gray-900/40">
        <h2 className="flex items-center gap-2 text-[14px] font-bold text-foreground">
          <CalendarDays className="text-brand-500" size={20} />
          Lớp chưa có lịch
        </h2>
        
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            type="text"
            placeholder="Tìm môn học, mã lớp..."
            className="h-10 bg-background/50 pl-9 text-[14px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div 
        className="flex-1 space-y-3 overflow-y-auto p-4 custom-scrollbar"
        ref={externalEventsRef}
      >
        {filteredClasses.length === 0 ? (
          <div className="py-10 text-center text-[14px] text-muted-foreground">
            Không tìm thấy lớp học nào.
          </div>
        ) : (
          filteredClasses.map((c) => (
            <div
              key={c.id || c.courseClassId}
              className="fc-event cursor-grab active:cursor-grabbing group relative p-3 rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500/50 transition-all duration-200"
              data-id={c.id || c.courseClassId}
              data-title={`${c.classCode} - ${c.courseName}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="rounded bg-brand-50 px-2 py-0.5 text-[13px] font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                  {c.classCode}
                </span>
                <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
                  <Clock size={12} /> {c.credits || 3} TC
                </span>
              </div>
              <h3 className="mt-2 line-clamp-2 text-[14px] font-semibold text-foreground">
                {c.courseName}
              </h3>
              <div className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Users size={13} /> {c.currentStudents || 0}/{c.maxStudents || 40} Sinh viên
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
