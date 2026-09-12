Nhiệm vụ: Audit và cải tiến toàn bộ Dropdown / Select trên website

Hãy truy vết toàn bộ source code của dự án và tìm tất cả các thành phần có hành vi xổ xuống / lựa chọn, bao gồm nhưng không giới hạn:

select, <select>, <option>
Dropdown
Select
Combobox
Listbox
Popover có danh sách lựa chọn
Menu / DropdownMenu
Filter dropdown
Status selector
User/team selector
Date/time selector nếu có popup lựa chọn
Các component custom có open, isOpen, showMenu, options, onSelect, onValueChange
Các component từ thư viện như Radix UI, shadcn/ui, Ant Design, MUI, Headless UI, React Select hoặc thư viện tương tự

Mục tiêu: chuẩn hóa và redesign toàn bộ dropdown/select của website để giao diện hiện đại, đồng nhất, đẹp mắt và dễ sử dụng hơn, đặc biệt phù hợp với giao diện dark theme hiện tại.

1. Trước tiên hãy audit toàn bộ project

Tìm kiếm toàn bộ codebase và lập danh sách:

File nào đang chứa dropdown/select.
Component nào dùng chung.
Component nào đang tự implement riêng.
Component nào dùng native <select>.
Component nào dùng thư viện bên ngoài.
Dropdown nào đang bị duplicate UI hoặc duplicate logic.

Không chỉ tìm theo tên Dropdown. Hãy tìm theo cả JSX/TSX, event handlers, state, class name và dependency liên quan.

Sau khi audit, ưu tiên gom về một bộ component dùng chung thay vì sửa CSS rời rạc từng trang.

2. Tạo hoặc cải tiến component Select/Dropdown dùng chung

Nếu project chưa có component chuẩn, hãy tạo một reusable component, ví dụ:

Select
SelectTrigger
SelectContent
SelectItem
SelectGroup
SelectLabel
SelectSeparator

Component cần hỗ trợ:

Placeholder.
Selected value.
Disabled state.
Hover.
Active.
Focus.
Keyboard navigation.
ESC để đóng.
Click outside để đóng.
Scroll khi danh sách dài.
Checkmark cho item đang được chọn.
Search nếu danh sách option lớn.
Clear value nếu nghiệp vụ hiện tại hỗ trợ.
Loading / empty state nếu dữ liệu lấy từ API.

Không làm thay đổi business logic hiện tại.

3. Redesign UI

Áp dụng style đồng nhất với dashboard dark theme hiện tại.

Trigger của dropdown:

Height khoảng 40–42px.
Border radius 8–10px.
Border tinh tế, không quá sáng.
Background tối hơn page một chút.
Padding ngang hợp lý.
Typography rõ ràng.
Icon chevron căn giữa theo chiều dọc.
Hover làm border/background sáng nhẹ.
Focus dùng focus ring rõ nhưng không quá gắt.
Khi dropdown đang mở, trigger cần có visual state rõ ràng.

Dropdown panel:

Không sử dụng kiểu menu mặc định của browser nếu có thể thay bằng custom Select mà không phá accessibility.
Background đồng nhất dark theme.
Border mỏng.
Radius khoảng 8–12px.
Shadow mềm để tách khỏi nền.
Padding 4–6px.
Khoảng cách giữa menu và trigger khoảng 4–6px.
Width tối thiểu bằng trigger.
Không để menu bị lệch, tràn màn hình hoặc bị container che.
Có xử lý viewport collision.
Dùng portal nếu cần để tránh overflow: hidden hoặc z-index.

Dropdown item:

Chiều cao khoảng 36–40px.
Padding ngang 10–12px.
Radius 6–8px.
Hover background nhẹ.
Selected state rõ ràng nhưng không quá chói.
Selected item có check icon nếu phù hợp.
Disabled item giảm opacity và không hover.
Text dài phải xử lý truncate hoặc wrap hợp lý.
4. Đồng bộ design token

Không hard-code style khác nhau tại từng trang.

Tận dụng hoặc tạo design tokens chung cho:

background
foreground
muted foreground
border
accent
hover
selected
focus ring
radius
spacing
shadow
z-index

Nếu project đang dùng Tailwind, ưu tiên utility class và component variants hiện có.

Nếu project đã có CSS variables/theme system thì phải dùng theme system đó, không tạo thêm một hệ màu độc lập.

5. Sửa toàn bộ website

Sau khi component chuẩn đã hoàn thiện, hãy thay thế/refactor tất cả dropdown/select đang tồn tại trên toàn bộ website sang UI mới.

Bao gồm cả:

Dashboard.
Landing Pages.
Forms.
Tags.
Domain.
Leads.
Sales.
Customers.
CSKH.
Automation.
Reports.
Settings.
Header.
User menu.
Team selector.
Filter bar.
Modal/dialog.
Table filters.
Pagination selectors.
Các trang khác được tìm thấy trong source.

Không chỉ sửa trang hiện tại.

6. Bảo toàn nghiệp vụ

Tuyệt đối không làm hỏng:

Giá trị đang selected.
Filtering.
API query params.
Form submission.
React Hook Form / Formik integration.
Validation.
Controlled/uncontrolled state.
URL search params.
Permission.
Loading dữ liệu.
Callback onChange, onSelect, onValueChange.

Chỉ refactor logic nếu cần để tái sử dụng component, nhưng output nghiệp vụ phải giữ nguyên.

7. Accessibility

Dropdown mới phải hỗ trợ tốt:

Tab.
Arrow Up / Down.
Enter.
Space.
Escape.
Focus management.
aria-* phù hợp.
Screen reader.

Không hy sinh accessibility chỉ để đẹp.

8. Responsive

Kiểm tra:

Desktop.
Laptop.
Tablet.
Mobile.

Dropdown không được:

tràn viewport,
bị cắt,
lệch trigger,
che mất nội dung quan trọng,
có width bất hợp lý trên màn hình nhỏ.
9. Chú ý trường hợp giống ảnh hiện tại

Các dropdown filter như:

Tất cả thành viên
Tất cả trạng thái
Mọi mục đích

hiện đang có cảm giác giống native browser select và menu xổ xuống chưa đồng bộ với dashboard.

Hãy redesign chúng thành custom Select hiện đại:

menu tối đồng bộ dashboard,
hover/selected đẹp,
selected item rõ ràng,
không xuất hiện highlight xanh mặc định của browser,
border/radius/shadow đồng nhất với toàn hệ thống.
10. Kiểm tra regression

Sau khi sửa:

Chạy lint.
Chạy typecheck.
Chạy test nếu project có test.
Fix toàn bộ lỗi phát sinh do refactor.
Kiểm tra console không có warning/error mới.

Đồng thời tìm lại toàn bộ codebase lần cuối để đảm bảo không còn dropdown/select cũ bị bỏ sót.

11. Cách thực hiện

Không sửa một cách mù quáng.

Thực hiện theo trình tự:

Audit → xác định component chuẩn → implement → migrate từng nhóm → test → search lại → polish UI.

Trước khi sửa lớn, hãy đọc cấu trúc project, framework, UI library và design system hiện tại để chọn giải pháp phù hợp nhất.

Ưu tiên refactor tối thiểu nhưng hiệu quả tối đa, tránh thay đổi kiến trúc không cần thiết.

Kết quả cuối cùng cần báo cáo

Sau khi hoàn thành hãy cung cấp:

Danh sách các dropdown/select đã tìm thấy.
Component dùng chung đã tạo hoặc chỉnh sửa.
Những file đã thay đổi.
Những dropdown đã migrate.
Các vấn đề UI/UX đã được sửa.
Các phần chưa thể migrate và lý do.
Kết quả lint/typecheck/test.

Không dừng lại sau khi sửa một component hoặc một trang. Hãy truy vết và chuẩn hóa dropdown/select trên toàn bộ project.