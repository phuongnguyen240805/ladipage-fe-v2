export type FacebookErrorSolution = { title: string; fix: string };
const patterns: Array<[RegExp, FacebookErrorSolution]> = [
  [/invalid viewer|người xem không hợp lệ/i,{title:"Người nhận không hợp lệ",fix:"Kiểm tra FB User ID và đảm bảo hai tài khoản đã kết bạn Facebook."}],
  [/permission|#200|không đủ quyền/i,{title:"Thiếu quyền Facebook",fix:"Kết nối lại tài khoản có quyền Admin và cấp đủ ads_management/business_management."}],
  [/token|oauth|expired|190/i,{title:"Phiên Facebook đã hết hạn",fix:"Kết nối lại Facebook qua extension rồi thử lại."}],
  [/rate limit|#17|#4|#613|too many/i,{title:"Facebook giới hạn tần suất",fix:"Tăng delay, chia lô nhỏ và thử lại sau."}],
  [/spend cap|hạn mức chi tiêu/i,{title:"Đã chạm giới hạn chi tiêu",fix:"Điều chỉnh spend cap hoặc thanh toán số dư trước khi chạy tiếp."}],
  [/payment|card|billing|thẻ/i,{title:"Lỗi thanh toán",fix:"Kiểm tra thẻ, số dư và trạng thái billing của tài khoản quảng cáo."}],
  [/pixel.*owner|ownership.*pixel/i,{title:"Pixel không thuộc Business",fix:"Chia sẻ Pixel cho Business/TKQC trước khi tạo quảng cáo."}],
  [/minimum budget|budget.*minimum|ngân sách tối thiểu/i,{title:"Ngân sách dưới mức tối thiểu",fix:"Tăng ngân sách theo mức tối thiểu Facebook trả về."}],
  [/invalid parameter|#100/i,{title:"Tham số Facebook không hợp lệ",fix:"Kiểm tra ID, objective, placement và dữ liệu creative."}],
];
export function solveFacebookError(message?: string): FacebookErrorSolution | null { if(!message)return null; return patterns.find(([pattern])=>pattern.test(message))?.[1] ?? {title:"Facebook từ chối thao tác",fix:"Kiểm tra chi tiết lỗi, quyền tài khoản và thử lại với một đối tượng."}; }
