export const AUTH_SESSION_ERROR_CODES = new Set([1101, 1104, 1105]);

const SESSION_ERROR_MESSAGES: Record<number, string> = {
  1101: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  1104: "Yêu cầu đã hết hạn. Vui lòng thử lại.",
  1105: "Tài khoản đã đăng nhập ở thiết bị khác. Vui lòng đăng nhập lại.",
};

const AUTH_ERROR_MESSAGES: Record<number, string> = {
  1201: "Địa chỉ IP đang thực hiện quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau.",
  1204: "Email là thông tin bắt buộc khi đăng ký.",
  1205: "Định dạng email không chính xác.",
  1206: "Tên miền email không được phép. Hiện chỉ hỗ trợ Gmail (@gmail.com).",
  1207: "Không thể đăng ký bằng địa chỉ email tạm thời.",
  1208: "Email này đã được dùng để đăng ký quá nhiều lần. Vui lòng thử lại sau.",
  1209: "Đăng ký Supabase thất bại.",
  1020: "Email này đã được đăng ký.",
};

export class ApiBusinessError extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "ApiBusinessError";
    this.code = code;
  }
}

export function mapSessionErrorMessage(
  code: number,
  serverMessage?: string
): string {
  return SESSION_ERROR_MESSAGES[code] ?? serverMessage ?? "Phiên đăng nhập không hợp lệ.";
}

export function mapAuthErrorMessage(code: number, serverMessage?: string): string {
  const mapped = AUTH_ERROR_MESSAGES[code];
  if (!mapped) {
    return serverMessage || `Đăng ký thất bại (mã ${code}).`;
  }

  if (code === 1209 && serverMessage) {
    const detail = serverMessage.replace(/^Đăng ký Supabase thất bại[ —-]+/i, "").trim();
    if (/email rate limit exceeded/i.test(detail)) {
      return "Supabase đang giới hạn gửi email xác nhận. Vui lòng thử lại sau vài phút.";
    }
    if (detail && detail !== serverMessage) {
      return `${mapped} ${detail}`;
    }
  }

  if (code === 1206 && serverMessage?.includes("Chỉ chấp nhận")) {
    return serverMessage;
  }

  return mapped;
}

export function toApiUserMessage(err: unknown): string {
  if (err instanceof ApiBusinessError) {
    if (AUTH_SESSION_ERROR_CODES.has(err.code)) {
      return mapSessionErrorMessage(err.code, err.message);
    }
    return mapAuthErrorMessage(err.code, err.message);
  }
  if (err instanceof Error && err.message) {
    if (/Workspace context is required/i.test(err.message)) {
      return "Workspace chưa được thiết lập. Vui lòng đăng xuất và đăng nhập lại.";
    }
    if (/Organization context is missing/i.test(err.message)) {
      return "Thiếu thông tin tổ chức. Vui lòng đăng nhập lại.";
    }
    return err.message;
  }
  return "Không thể tải dữ liệu";
}

export function toAuthUserMessage(err: unknown): string {
  if (err instanceof ApiBusinessError) {
    return mapAuthErrorMessage(err.code, err.message);
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Đăng ký thất bại";
}