import React, { useState } from "react";
import { TemplateItem } from "../dung-chung/types";
import { IconZalo, IconEmail, IconFacebook, IconSms, IconSearch } from "../dung-chung/icons";

interface TemplateLibraryProps {
  onSelectTemplate: (template: TemplateItem) => void;
}

const CATEGORIES = [
  "Tất cả",
  "Giữ chân khách hàng",
  "Tối ưu hoá trải nghiệm",
  "Tương tác lại & gia hạn",
  "Cập nhật thông tin",
  "Nuôi dưỡng & chuyển đổi Lead",
  "Nền tảng",
];

const TEMPLATES_DATA: TemplateItem[] = [
  {
    id: "temp-1",
    name: "Gửi email xác nhận đăng ký Landing Page",
    description: "Tự động gửi email cảm ơn và xác nhận thông tin ngay sau khi khách hàng điền form trên landing page.",
    category: "Giữ chân khách hàng",
    tags: ["Email", "Landing Page"],
    recommends: true,
    triggerEvent: "⚡ Đăng ký Landing Page",
    conditionUse: "✓ Kết nối với tài khoản Gmail hoặc SMTP hoạt động",
    previewType: "email",
    previewTitle: "Xác nhận đăng ký tư vấn thành công",
    previewBody: "Xin chào {fullname},\n\nCảm ơn bạn đã đăng ký dịch vụ của chúng tôi. Yêu cầu của bạn đã được tiếp nhận thành công. Chuyên viên tư vấn của chúng tôi sẽ liên hệ lại với bạn trong vòng 24 giờ tới.\n\nThông tin đăng ký của bạn:\n- Số điện thoại: {phone}\n- Email: {email}\n\nTrân trọng,\nĐội ngũ hỗ trợ khách hàng.",
  },
  {
    id: "temp-2",
    name: "Gửi Zalo ZNS xác nhận đơn hàng thành công",
    description: "Gửi tin nhắn Zalo ZNS chính thức chăm sóc khách hàng ngay khi có đơn hàng mới từ Landing Page hoặc Haravan.",
    category: "Tối ưu hoá trải nghiệm",
    tags: ["Zalo ZNS", "Haravan", "Landing Page"],
    recommends: true,
    triggerEvent: "⚡ Tạo đơn hàng thành công",
    conditionUse: "✓ Zalo Official Account (OA) đã xác thực và liên kết hệ thống",
    previewType: "zalo",
    previewTitle: "Zalo OA - Thông báo đơn hàng",
    previewBody: "Cảm ơn quý khách đã mua sắm tại cửa hàng!\n\nĐơn hàng #{order_id} trị giá {order_total}đ đã được tiếp nhận và đang xử lý. Chúng tôi sẽ sớm cập nhật thông tin giao hàng đến quý khách.\n\nMọi thắc mắc xin liên hệ Hotline: 1900 xxxx.",
  },
  {
    id: "temp-3",
    name: "Nuôi dưỡng Lead từ Facebook Lead Ads bằng Zalo ZNS & Email",
    description: "Kết nối Facebook Lead Ads để gửi tin nhắn chào mừng kèm tài liệu qua Zalo và chuỗi email nuôi dưỡng tự động.",
    category: "Nuôi dưỡng & chuyển đổi Lead",
    tags: ["Facebook", "Zalo ZNS", "Email"],
    recommends: true,
    triggerEvent: "⚡ Có Lead mới từ Facebook Lead Ads",
    conditionUse: "✓ Kết nối Fanpage Facebook, Zalo OA và Gmail",
    previewType: "zalo",
    previewTitle: "Nhận tài liệu thành công",
    previewBody: "Chào {fullname},\n\nCảm ơn bạn đã quan tâm đến tài liệu hướng dẫn chuyển đổi số doanh nghiệp của chúng tôi.\n\n👉 Nhấp vào đây để tải tài liệu: https://link.ladipage.vn/e-book-free\n\nEmail hướng dẫn cài đặt chi tiết cũng đã được gửi đến hòm thư {email} của bạn.",
  },
  {
    id: "temp-4",
    name: "SMS nhắc nhở thanh toán đơn hàng chưa hoàn tất",
    description: "Gửi SMS Brandname tự động nhắc nhở khách hàng hoàn tất thanh toán sau 2 giờ kể từ khi giỏ hàng bị bỏ quên.",
    category: "Tương tác lại & gia hạn",
    tags: ["SMS", "Giỏ hàng"],
    triggerEvent: "⚡ Giỏ hàng bị bỏ quên > 2 giờ",
    conditionUse: "✓ Tài khoản SMS Brandname hoạt động (eSMS, VietGuys...)",
    previewType: "sms",
    previewTitle: "Mã OTP / Nhắc nhở",
    previewBody: "(Brandname) Chao {fullname}, don hang #{order_id} tai shop van chua hoan tat thanh toan. Vui long click vao link de tiep tuc mua hang: {checkout_url}. Tran trong!",
  },
  {
    id: "temp-5",
    name: "Cập nhật trạng thái vận đơn tự động qua Zalo ZNS",
    description: "Tự động gửi tin nhắn Zalo thông báo khi đơn hàng được giao cho đơn vị vận chuyển hoặc giao hàng thành công.",
    category: "Cập nhật thông tin",
    tags: ["Zalo ZNS", "Vận chuyển"],
    triggerEvent: "⚡ Trạng thái vận đơn thay đổi",
    conditionUse: "✓ Zalo OA, Kết nối cổng vận chuyển (GHTK, GHN, Viettel Post)",
    previewType: "zalo",
    previewTitle: "Thông báo hành trình đơn hàng",
    previewBody: "Đơn hàng #{order_id} đã được bàn giao cho đơn vị vận chuyển {shipping_carrier}.\n\nMã vận đơn của bạn: {shipping_code}.\nTrạng thái hiện tại: Đang giao hàng.\nDự kiến giao hàng trong 2-3 ngày tới.",
  },
  {
    id: "temp-6",
    name: "Email chúc mừng sinh nhật và tặng Voucher giảm giá",
    description: "Tự động gửi email chúc mừng sinh nhật khách hàng kèm mã ưu đãi độc quyền vào đúng 9:00 sáng ngày sinh nhật.",
    category: "Giữ chân khách hàng",
    tags: ["Email", "Voucher"],
    triggerEvent: "⚡ Đến ngày sinh nhật khách hàng (9:00 AM)",
    conditionUse: "✓ Gmail/SMTP, Database khách hàng phải lưu thông tin Ngày sinh nhật",
    previewType: "email",
    previewTitle: "Chúc mừng sinh nhật quý khách! Nhận quà tặng đặc biệt ngay",
    previewBody: "Chào {fullname},\n\nNhân ngày sinh nhật của bạn, chúng tôi xin chúc bạn một tuổi mới tràn đầy sức khỏe, hạnh phúc và thành công.\n\nĐể ngày vui của bạn thêm trọn vẹn, chúng tôi xin gửi tặng mã ưu đãi đặc quyền:\n🎁 Mã giảm giá: HPBD-{fullname}\n👉 Giảm ngay 20% cho tất cả đơn hàng áp dụng đến hết tháng này.\n\nChúc bạn có một ngày sinh nhật thật tuyệt vời!",
  },
  {
    id: "temp-7",
    name: "Gửi SMS Brandname xác thực mã OTP",
    description: "Luồng tự động xác thực số điện thoại bằng cách gửi mã OTP bảo mật chỉ trong 5 giây sau khi khách hàng bấm gửi form.",
    category: "Nền tảng",
    tags: ["SMS", "OTP"],
    triggerEvent: "⚡ Khách hàng yêu cầu gửi mã OTP",
    conditionUse: "✓ Đăng ký dịch vụ SMS OTP Brandname",
    previewType: "sms",
    previewTitle: "Xác thực OTP",
    previewBody: "(OTP-Brand) Ma OTP xac minh so dien thoai cua ban la {otp_code}. Ma co hieu luc trong 3 phut. Vui long khong chia se ma nay voi bat ky ai.",
  },
  {
    id: "temp-8",
    name: "Đồng bộ khách hàng từ Landing Page sang Google Sheet",
    description: "Tự động thêm thông tin liên hệ mới đăng ký từ Landing Page vào file Google Sheet của bạn theo thời gian thực.",
    category: "Nền tảng",
    tags: ["Google Sheet", "Landing Page"],
    triggerEvent: "⚡ Khách hàng điền form Landing Page",
    conditionUse: "✓ Kết nối tài khoản Google Drive và cấu hình phân quyền ghi",
    previewType: "email",
    previewTitle: "System Log - Sync data",
    previewBody: "Hệ thống tự động: Đã đồng bộ thông tin khách hàng {fullname} - SĐT: {phone} sang Google Sheet thành công tại cột dòng {row_index}.",
  },
  {
    id: "temp-9",
    name: "Tương tác lại với khách hàng cũ sau 30 ngày không mua hàng",
    description: "Tự động gửi email khảo sát ý kiến kèm ưu đãi giảm giá 10% cho khách hàng đã qua 30 ngày chưa phát sinh đơn hàng mới.",
    category: "Tương tác lại & gia hạn",
    tags: ["Email", "Khách hàng cũ"],
    triggerEvent: "⚡ Khách hàng không mua hàng trong 30 ngày",
    conditionUse: "✓ Gmail/SMTP và CRM cập nhật đơn hàng gần nhất",
    previewType: "email",
    previewTitle: "Chúng tôi nhớ bạn! Nhận ngay voucher 10% cho đơn hàng tiếp theo",
    previewBody: "Chào {fullname},\n\nĐã lâu rồi chúng tôi chưa thấy bạn mua sắm tại cửa hàng. Chúng tôi hy vọng mọi sản phẩm trước đó đều mang lại sự hài lòng cho bạn.\n\nNhân dịp này, chúng tôi muốn gửi tặng bạn mã giảm giá 10% để trải nghiệm các dòng sản phẩm mới nhất:\n👉 Mã giảm giá: BACK-TO-SHOP\n\nHy vọng được phục vụ bạn một lần nữa!",
  },
  {
    id: "temp-10",
    name: "Zalo ZNS thông báo lịch hẹn / lịch tư vấn trước 1 ngày",
    description: "Tự động nhắc lịch hẹn tư vấn, lịch lớp học, lịch hội thảo trước 24 giờ thông qua tin nhắn thương hiệu Zalo ZNS.",
    category: "Cập nhật thông tin",
    tags: ["Zalo ZNS", "Lịch hẹn"],
    triggerEvent: "⚡ Trước thời gian lịch hẹn 24 giờ",
    conditionUse: "✓ Kết nối Zalo OA xác thực",
    previewType: "zalo",
    previewTitle: "Nhắc nhở lịch hẹn tư vấn",
    previewBody: "Xin chào quý khách {fullname},\n\nĐây là tin nhắn nhắc nhở quý khách có lịch hẹn tư vấn dịch vụ vào lúc {appointment_time} ngày {appointment_date}.\n\nĐịa điểm: Văn phòng số 1.\nChúng tôi rất hân hạnh được đón tiếp quý khách!",
  },
  {
    id: "temp-11",
    name: "Tự động gắn Tag phân loại Lead theo sản phẩm đăng ký",
    description: "Tự động phân loại và gắn Tag khách hàng tương ứng với sản phẩm/landing page mà họ đăng ký để chăm sóc cá nhân hóa.",
    category: "Nuôi dưỡng & chuyển đổi Lead",
    tags: ["Tag", "Lead"],
    triggerEvent: "⚡ Khách hàng đăng ký Form",
    conditionUse: "✓ Hệ thống phân loại Tag nội bộ hoạt động",
    previewType: "facebook",
    previewTitle: "Tagging System",
    previewBody: "Hệ thống tự động: Đã phân tích hành vi của khách hàng và tự động gắn thẻ [VIP_CUSTOMER] và [LEAD_HOT] dựa trên thuộc tính sản phẩm.",
  },
];

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [subTab, setSubTab] = useState<"library" | "mine">("library");

  // Filtering templates
  const filteredTemplates = TEMPLATES_DATA.filter((temp) => {
    const matchesCategory = activeCategory === "Tất cả" || temp.category === activeCategory;
    const matchesSearch =
      temp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temp.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getTagStyle = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes("zalo")) return "bg-lime-50 text-lime-500 dark:bg-lime-950/20 dark:text-lime-300";
    if (t.includes("email")) return "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400";
    if (t.includes("sms") || t.includes("otp")) return "bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400";
    if (t.includes("facebook")) return "bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400";
    if (t.includes("sheet")) return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400";
    return "bg-slate-100 text-slate-650 dark:bg-gray-800 dark:text-gray-400";
  };

  const renderChannelIcon = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes("zalo")) return <IconZalo size={16} className="inline mr-1" />;
    if (t.includes("email")) return <IconEmail size={16} className="inline mr-1" />;
    if (t.includes("facebook")) return <IconFacebook size={16} className="inline mr-1 text-lime-600" />;
    if (t.includes("sms")) return <IconSms size={16} className="inline mr-1 text-purple-500" />;
    return null;
  };

  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Thư viện kịch bản mẫu
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Lựa chọn các kịch bản tự động hóa đã được tối ưu hóa để áp dụng ngay vào quy trình kinh doanh của bạn.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex space-x-6">
          <button
            onClick={() => setSubTab("library")}
            className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition ${
              subTab === "library"
                ? "border-lime-500 text-lime-500 dark:text-lime-300 dark:border-lime-300"
                : "border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Kịch bản mẫu
          </button>
          <button
            onClick={() => setSubTab("mine")}
            className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition ${
              subTab === "mine"
                ? "border-lime-500 text-lime-500 dark:text-lime-300 dark:border-lime-300"
                : "border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Kịch bản của tôi
          </button>
        </div>

        {/* Search */}
        <div className="relative w-72 mb-2 hidden md:block">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <IconSearch size={14} />
          </span>
          <input
            type="text"
            placeholder="Tìm mẫu kịch bản..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50/50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-750 focus:border-lime-400 rounded-lg outline-hidden text-slate-800 dark:text-white"
          />
        </div>
      </div>

      {subTab === "mine" ? (
        <div className="py-12 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <svg className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm font-bold text-slate-800 dark:text-white">Bạn chưa lưu kịch bản mẫu nào</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lưu kịch bản trong quá trình thiết kế ở Builder để chia sẻ lại.</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-6">
          {/* Categories Horizontal scroll list */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? "bg-lime-500 text-white shadow-2xs"
                      : "bg-white dark:bg-gray-900 text-slate-650 dark:text-slate-450 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Grid list of templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredTemplates.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectTemplate(item)}
                className="group flex flex-col justify-between p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs hover:shadow-md dark:hover:border-lime-900/50 hover:border-lime-400/50 transition duration-300 cursor-pointer"
              >
                <div>
                  {/* Category & Recommends badge */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[10px] font-extrabold text-lime-500 dark:text-lime-300 tracking-wider uppercase bg-lime-50 dark:bg-lime-950/20 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {item.recommends && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 px-2 py-0.5 rounded">
                        ★ Đề xuất
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition mb-2 line-clamp-2">
                    {item.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Tags and channels indicator footer */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/80 flex flex-wrap items-center justify-between gap-2">
                  {/* Channels icons list */}
                  <div className="flex items-center">
                    {item.tags.filter(t => ["zalo", "email", "sms", "facebook"].some(k => t.toLowerCase().includes(k))).map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center -mr-1 bg-white dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800 p-0.5">
                        {renderChannelIcon(tag)}
                      </span>
                    ))}
                  </div>

                  {/* Tags badges */}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getTagStyle(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="py-20 text-center text-slate-400 dark:text-slate-500">
              Không tìm thấy kịch bản mẫu phù hợp với từ khóa hoặc danh mục được chọn.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
