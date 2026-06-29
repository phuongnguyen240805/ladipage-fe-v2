"use client";

import React, { useState, useEffect } from "react";

interface TempEmail {
  id: string;
  address: string;
  username: string;
  domain: string;
  provider: string;
  createdTime: number;
}

interface InboxMessage {
  id: string;
  from: string;
  subject: string;
  body: string;
  otp?: string;
  receivedTime: number;
}

const mockDomains = ["eztool-temp.com", "moakt.co", "mailtogo.org", "inboxflow.net"];
const mockProviders = ["Moakt", "TempMail", "10MinMail"];

export default function TempEmailPage() {
  // Inputs
  const [username, setUsername] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [domain, setDomain] = useState("Ngẫu nhiên");
  const [provider, setProvider] = useState("Moakt");

  // State Lists
  const [emails, setEmails] = useState<TempEmail[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  
  // Inbox Messages
  const [messages, setMessages] = useState<Record<string, InboxMessage[]>>({});
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate random username
  const handleRandomize = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let randomUser = "user_";
    for (let i = 0; i < 7; i++) {
      randomUser += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUsername(randomUser);
  };

  // Create new email
  const handleCreateEmail = () => {
    const activeUsername = username.trim() || `user_${Math.random().toString(36).substring(2, 9)}`;
    const activeDomain = domain === "Ngẫu nhiên" 
      ? mockDomains[Math.floor(Math.random() * mockDomains.length)] 
      : domain;
    
    const address = subdomain.trim()
      ? `${activeUsername}@${subdomain.trim()}.${activeDomain}`
      : `${activeUsername}@${activeDomain}`;

    const newEmail: TempEmail = {
      id: Math.random().toString(36).substring(2, 9),
      address,
      username: activeUsername,
      domain: activeDomain,
      provider,
      createdTime: Date.now()
    };

    setEmails((prev) => [newEmail, ...prev]);
    setSelectedEmailId(newEmail.id);
    setUsername(""); // Clear username input

    // Seed mock inbox messages for this email after 4 seconds
    setTimeout(() => {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const mockMsgs: InboxMessage[] = [
        {
          id: Math.random().toString(),
          from: "Facebook Security <security@facebookmail.com>",
          subject: `${otpCode} là mã khôi phục tài khoản Facebook của bạn`,
          body: `Xin chào, chúng tôi nhận được yêu cầu khôi phục mật khẩu tài khoản của bạn. Mã bảo mật là: ${otpCode}. Nếu không phải bạn, hãy bỏ qua email này.`,
          otp: otpCode,
          receivedTime: Date.now()
        }
      ];
      setMessages((prev) => ({
        ...prev,
        [newEmail.id]: mockMsgs
      }));
    }, 4000);
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Delete email
  const handleDeleteEmail = (id: string) => {
    setEmails((prev) => prev.filter((item) => item.id !== id));
    if (selectedEmailId === id) {
      setSelectedEmailId(null);
    }
  };

  const selectedEmail = emails.find((e) => e.id === selectedEmailId);
  const currentMessages = selectedEmailId ? messages[selectedEmailId] || [] : [];

  // Simulate loading when switching email inboxes
  useEffect(() => {
    if (selectedEmailId) {
      setLoadingInbox(true);
      const timer = setTimeout(() => {
        setLoadingInbox(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedEmailId]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner Card */}
      <div className="flex items-center gap-4 bg-white dark:bg-[#11121e] border border-gray-100/50 dark:border-gray-900/30 p-5 rounded-2xl shadow-theme-xs select-none">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-sm">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-950 dark:text-white leading-tight">Email tạm thời</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">Tạo email tạm thời, xem inbox và lấy OTP nhanh.</p>
        </div>
      </div>

      {/* Configuration Form Row */}
      <div className="bg-white dark:bg-[#11121e] border border-gray-100/50 dark:border-gray-900/30 p-6 rounded-2xl shadow-theme-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          
          {/* USERNAME */}
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-wider text-gray-400 dark:text-gray-500 uppercase">USERNAME</label>
            <input
              type="text"
              placeholder="nhập username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-lime-500/35"
            />
          </div>

          {/* SUB DOMAIN */}
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-wider text-gray-400 dark:text-gray-500 uppercase">SUB DOMAIN</label>
            <input
              type="text"
              placeholder="để trống = domain chính"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-lime-500/35"
            />
          </div>

          {/* DOMAIN */}
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-wider text-gray-400 dark:text-gray-500 uppercase">DOMAIN</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-lime-500/35 cursor-pointer"
            >
              <option value="Ngẫu nhiên">Ngẫu nhiên</option>
              {mockDomains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* NGUỒN */}
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-wider text-gray-400 dark:text-gray-500 uppercase">NGUỒN</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-lime-500/35 cursor-pointer"
            >
              {mockProviders.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Buttons Section */}
        <div className="flex gap-3 justify-end mt-5 border-t border-gray-50 dark:border-gray-900/60 pt-4">
          <button
            onClick={handleRandomize}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-lime-500/20 text-lime-600 dark:text-lime-400 hover:bg-lime-50/20 text-xs font-bold transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3M4.5 12a48.567 48.567 0 01.138-3.662m0 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l-3 3m3-3l3 3" />
            </svg>
            Ngẫu nhiên
          </button>

          <button
            onClick={handleCreateEmail}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tạo Email
          </button>
        </div>
      </div>

      {/* Main Email & Inbox Dual Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Panel: Email list */}
        <div className="md:col-span-1 bg-white dark:bg-[#11121e] border border-gray-100/50 dark:border-gray-900/30 rounded-2xl shadow-theme-xs overflow-hidden flex flex-col min-h-[350px]">
          {/* List Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-900/60 select-none">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-800 dark:text-white">DANH SÁCH EMAIL</span>
              <span className="bg-lime-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                {emails.length}
              </span>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => emails.length > 0 && setEmails([])}
                className="p-1.5 rounded-lg border border-red-100 text-red-500 dark:border-red-950/40 dark:text-red-400 hover:bg-red-50/20 cursor-pointer"
                title="Xóa tất cả"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {emails.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center select-none">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-950/20 border border-gray-100/30 dark:border-gray-900/30 text-gray-400 dark:text-gray-500 flex items-center justify-center mb-3">
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500">Chưa có email</div>
              </div>
            ) : (
              emails.map((email) => {
                const active = email.id === selectedEmailId;
                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmailId(email.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      active
                        ? "bg-lime-50/40 border-lime-500/30 dark:bg-lime-950/20 dark:border-lime-900/30"
                        : "border-gray-50 hover:bg-gray-50/50 dark:border-gray-900/10 dark:hover:bg-gray-900/20"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-black text-gray-800 dark:text-gray-200 truncate select-all">{email.address}</div>
                      <div className="text-[9px] text-gray-400 dark:text-gray-500 font-bold mt-1 select-none">{email.provider}</div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(email.address, email.id);
                        }}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          copiedId === email.id
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-gray-100 text-gray-400 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-500 dark:hover:bg-gray-900"
                        }`}
                        title="Copy email"
                      >
                        {copiedId === email.id ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEmail(email.id);
                        }}
                        className="p-1.5 rounded-lg border border-red-50/50 text-red-400 hover:bg-red-50/20 dark:border-red-950/20 dark:text-red-400 cursor-pointer"
                        title="Xóa"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Inbox */}
        <div className="md:col-span-2 bg-white dark:bg-[#11121e] border border-gray-100/50 dark:border-gray-900/30 rounded-2xl shadow-theme-xs overflow-hidden flex flex-col min-h-[350px]">
          
          {/* Inbox Header */}
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-900/60 select-none">
            <span className="text-xs font-black text-gray-800 dark:text-white">CHI TIẾT HÒM THƯ</span>
            {selectedEmail && (
              <span className="ml-2 text-[10px] text-gray-400 dark:text-gray-500 font-bold">({selectedEmail.address})</span>
            )}
          </div>

          {/* Inbox Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {!selectedEmailId ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center select-none">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-950/20 border border-gray-100/30 dark:border-gray-900/30 text-gray-400 dark:text-gray-500 flex items-center justify-center mb-3">
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v4.5A2.25 2.25 0 002.25 13.5zm0 0V16.5a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V13.5m-18 0V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-4.5" />
                  </svg>
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500">Chưa có dữ liệu inbox</div>
              </div>
            ) : loadingInbox ? (
              <div className="h-full flex items-center justify-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-lime-500/20 border-t-lime-500 animate-spin"></div>
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center select-none">
                <div className="w-10 h-10 rounded-xl bg-lime-50/50 dark:bg-lime-950/15 text-lime-600 dark:text-lime-400 flex items-center justify-center mb-3 animate-pulse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="text-xs font-black text-gray-800 dark:text-gray-200">Đang chờ nhận thư mới...</div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold mt-1">Hệ thống sẽ tự động quét hòm thư mỗi vài giây.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-900 bg-gray-50/30 dark:bg-gray-950/10 space-y-3">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100/50 dark:border-gray-900/50 pb-3 gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">TỪ</div>
                        <div className="text-xs font-black text-gray-800 dark:text-gray-250 truncate select-all">{msg.from}</div>
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold shrink-0">
                        {new Date(msg.receivedTime).toLocaleTimeString()}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">TIÊU ĐỀ</div>
                      <div className="text-xs font-black text-gray-950 dark:text-white select-all">{msg.subject}</div>
                    </div>

                    {/* Body */}
                    <div>
                      <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">NỘI DUNG</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-white dark:bg-gray-950/20 p-4 rounded-xl border border-gray-100/30 dark:border-gray-900/30 mt-1.5 select-all">
                        {msg.body}
                      </div>
                    </div>

                    {/* Quick OTP Copy Action */}
                    {msg.otp && (
                      <div className="flex items-center justify-between bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 px-4 py-3 rounded-xl mt-3 select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">MÃ OTP: {msg.otp}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(msg.otp!, msg.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black tracking-wide uppercase transition-all shadow-xs cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                          </svg>
                          Sao chép OTP
                        </button>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
