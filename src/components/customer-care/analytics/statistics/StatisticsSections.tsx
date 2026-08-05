"use client";

import type { ApexOptions } from "apexcharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Headphones,
  Megaphone,
  MessageCircle,
  MessageSquareText,
  MessagesSquare,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  RefreshCcw,
  Save,
  ShoppingBag,
  Star,
  Tags,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  activityOverviewLabels,
  adsStatisticRows,
  callCenterStatisticRows,
  pageStatisticRows,
  conversationHoursSeries,
  activityOverviewSeries,
  feedbackStatisticRows,
  userStatisticRows,
  tagStatisticRows,
} from "@/components/customer-care/analytics/statistics/data";
import type { StatisticRangePreset } from "@/components/customer-care/analytics/statistics/types";
import {
  baseCartesianOptions,
  DataTable,
  DateFilterBar,
  EmptyStatisticsState,
  ladiChartColors,
  MetricTile,
  SectionTabs,
  StatisticPageHeader,
  StatisticsCard,
  StatisticsChart,
} from "@/components/customer-care/analytics/statistics/StatisticsPrimitives";

const formatNumber = (value: number) => value.toLocaleString("vi-VN");
const formatMoney = (value: number) => `${Math.round(value / 1_000_000)} triệu`;

export function OverviewStatistic() {
  const [rangePreset, setRangePreset] = useState<StatisticRangePreset>("30d");
  const lineOptions = baseCartesianOptions(activityOverviewLabels, {
    colors: ["#84cc16", "#ec4899", "#06b6d4"],
    stroke: { curve: "straight", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.18, opacityTo: 0.02 } },
    yaxis: { title: { text: "Tương tác", style: { color: "#94a3b8", fontSize: "11px" } } },
  });

  const hourlyOptions = baseCartesianOptions(
    ["0h - 6h", "6h - 12h", "12h - 18h", "18h - 0h"],
    {
      colors: ["#84cc16"],
      chart: { sparkline: { enabled: false } },
      legend: { show: false },
      stroke: { curve: "smooth", width: 2.5 },
      xaxis: { labels: { style: { colors: "#94a3b8", fontSize: "11px" } } },
    }
  );

  return (
    <div>
      <StatisticPageHeader title="Tổng quan" range={rangePreset} onRangeChange={setRangePreset} />
      <StatisticsCard title="Tổng quan về hoạt động" description="Thống kê tổng quan">
        <StatisticsChart
          options={lineOptions}
          series={[
            { name: "Tổng tương tác", data: activityOverviewSeries.interactions },
            { name: "Khách hàng mới", data: activityOverviewSeries.customers },
            { name: "Số đơn chốt", data: activityOverviewSeries.orders },
          ]}
          type="area"
          height={330}
        />
      </StatisticsCard>

      <div className="mt-4 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <StatisticsCard
          title="Tổng quan về trang"
          description="Một số thông tin về trang của bạn"
          action={<ChevronRight className="h-5 w-5 text-slate-400" />}
        >
          <div className="space-y-3">
            <OverviewChannelRow icon={<MessageCircle />} label="Tin nhắn tới trang" value={6420} color="lime" />
            <OverviewChannelRow icon={<MessageSquareText />} label="Bình luận tới trang" value={2204} color="cyan" />
          </div>
        </StatisticsCard>

        <StatisticsCard
          title="Tương tác"
          description="Một số thông tin về tương tác giữa khách hàng và nhân viên"
          action={<button className="text-xs font-semibold text-lime-600 dark:text-lime-400">Xem thống kê tương tác</button>}
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <CompactKpi label="Tổng tương tác" value="8.624" color="lime" />
            <CompactKpi label="Tin nhắn" value="6.420" color="cyan" />
            <CompactKpi label="Bình luận" value="2.204" color="amber" />
            <CompactKpi label="HT tin nhắn mới" value="1.842" color="emerald" />
          </div>
        </StatisticsCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <StatisticsCard title="Đánh giá" description="Đánh giá của khách hàng về nhân viên" action={<ChevronRight className="h-5 w-5 text-slate-400" />}>
          <RingSummary value="4.7" label="Trung bình đánh giá chung" suffix={<Star className="h-6 w-6 fill-amber-400 text-amber-400" />} />
          <div className="mt-4 space-y-2">
            <LegendLine color="#84cc16" label="Tốt (5 sao)" value="82%" />
            <LegendLine color="#f59e0b" label="Trung bình (3 - 4 sao)" value="13%" />
            <LegendLine color="#eab308" label="Cần cải thiện (1 - 2 sao)" value="5%" />
          </div>
        </StatisticsCard>
        <StatisticsCard title="Tổng đài" description="Tổng số lượng cuộc gọi trên tổng đài" action={<ChevronRight className="h-5 w-5 text-slate-400" />}>
          <RingSummary value="624" label="Tổng cuộc gọi" />
          <div className="mt-4 space-y-2">
            <LegendLine color="#84cc16" label="Cuộc gọi đến" value="412" />
            <LegendLine color="#06b6d4" label="Cuộc gọi đi" value="212" />
          </div>
        </StatisticsCard>
        <StatisticsCard title="Số hội thoại theo thời gian trong ngày" description="Lượng hội thoại theo thời gian trong ngày">
          <StatisticsChart options={hourlyOptions} series={[{ name: "Hội thoại", data: [9, 84, 132, 213] }]} type="area" height={260} />
        </StatisticsCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <StatisticsCard title="Top thẻ hội thoại" description="Các thẻ đang được gắn nhiều nhất" action={<ChevronRight className="h-5 w-5 text-slate-400" />}>
          <div className="space-y-1">
            {tagStatisticRows.slice(0, 10).map((tag) => (
              <div key={tag.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-lime-500/[0.06]">
                <Tags className="h-4 w-4" style={{ color: tag.color }} />
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{tag.name}</span>
                <span className="text-xs font-semibold text-slate-500">{tag.conversations}</span>
              </div>
            ))}
          </div>
        </StatisticsCard>
        <StatisticsCard
          title="Nhân viên"
          description="Top nhân viên có lượt tương tác nhiều nhất với khách hàng"
          action={<button className="text-xs font-semibold text-lime-600 dark:text-lime-400">Xem thống kê nhân viên</button>}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {userStatisticRows.slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/[0.08]">
                <div className="relative">
                  <img src={user.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-lime-500 text-[10px] font-bold text-slate-950">{index + 1}</span>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-slate-800 dark:text-white">{user.name}</div>
                  <div className="mt-1 text-[11px] text-slate-400">{formatNumber(user.interactions)} tương tác</div>
                </div>
              </div>
            ))}
          </div>
        </StatisticsCard>
      </div>
    </div>
  );
}

export function PageStatistic() {
  const [rangePreset, setRangePreset] = useState<StatisticRangePreset>("30d");
  const [tableMode, setTableMode] = useState("daily");
  const options = baseCartesianOptions(pageStatisticRows.slice().reverse().map((row) => row.date.slice(0, 5)), {
    colors: ["#84cc16", "#06b6d4"],
    stroke: { curve: "smooth", width: 2.5 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.18, opacityTo: 0.01 } },
  });
  const rows = pageStatisticRows.map((row) => ({
    date: <span className="font-medium text-slate-800 dark:text-slate-200">{row.date}</span>,
    messages: formatNumber(row.messages),
    comments: formatNumber(row.comments),
    interactions: formatNumber(row.interactions),
    customers: formatNumber(row.customers),
    conversations: formatNumber(row.conversations),
    rate: <span className="font-semibold text-lime-600 dark:text-lime-400">{row.responseRate}%</span>,
    orders: row.orders,
  }));

  return (
    <div>
      <StatisticPageHeader title="Trang" range={rangePreset} onRangeChange={setRangePreset} />
      <DateFilterBar />
      <StatisticsCard title="Tổng quan về trang" description="Tổng số lượng tin nhắn và bình luận theo thời gian">
        <StatisticsChart
          options={options}
          series={[
            { name: "Tin nhắn", data: pageStatisticRows.slice().reverse().map((row) => row.messages) },
            { name: "Bình luận", data: pageStatisticRows.slice().reverse().map((row) => row.comments) },
          ]}
          type="area"
          height={320}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <PlatformSummary label="Facebook" value="5.648" change={12} tone="lime" />
          <PlatformSummary label="Instagram" value="1.486" change={6} tone="cyan" />
          <PlatformSummary label="TikTok" value="942" change={18} tone="rose" />
          <PlatformSummary label="Website" value="548" change={4} tone="emerald" />
        </div>
      </StatisticsCard>
      <div className="mt-4">
        <StatisticsCard
          title="Thống kê chi tiết"
          description="Dữ liệu hoạt động của trang theo từng ngày"
          action={<SectionTabs value={tableMode} onChange={setTableMode} items={[{ value: "daily", label: "Theo ngày" }, { value: "total", label: "Tổng hợp" }]} />}
        >
          <DataTable
            columns={[
              { key: "date", label: "Thời gian" },
              { key: "messages", label: "Tin nhắn", align: "right" },
              { key: "comments", label: "Bình luận", align: "right" },
              { key: "interactions", label: "Tổng tương tác", align: "right" },
              { key: "customers", label: "Khách hàng", align: "right" },
              { key: "conversations", label: "Hội thoại", align: "right" },
              { key: "rate", label: "Tỷ lệ phản hồi", align: "right" },
              { key: "orders", label: "Đơn chốt", align: "right" },
            ]}
            rows={rows}
            footer={<TableFooter />}
          />
        </StatisticsCard>
      </div>
    </div>
  );
}

export function UserStatistic() {
  const [rangePreset, setRangePreset] = useState<StatisticRangePreset>("30d");
  const [tab, setTab] = useState("performance");
  const rows = userStatisticRows.map((user, index) => ({
    rank: <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-500/15 font-semibold text-lime-700 dark:text-lime-300">{index + 1}</span>,
    employee: (
      <div className="flex items-center gap-2.5">
        <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
        <span className="font-medium text-slate-800 dark:text-slate-200">{user.name}</span>
      </div>
    ),
    interactions: formatNumber(user.interactions),
    messages: formatNumber(user.messages),
    comments: formatNumber(user.comments),
    conversations: formatNumber(user.newConversations),
    rate: <span className="text-lime-600 dark:text-lime-400">{user.responseRate}%</span>,
    response: `${user.avgResponseMinutes} phút`,
    orders: user.orders,
    revenue: formatMoney(user.revenue),
  }));
  return (
    <div>
      <StatisticPageHeader title="Nhân viên" range={rangePreset} onRangeChange={setRangePreset} />
      <DateFilterBar showSearch />
      <div className="grid gap-4 xl:grid-cols-2">
        <StatisticsCard title="Top 5 nhân viên phản hồi nhanh nhất" description="Xếp hạng theo thời gian phản hồi trung bình">
          <div className="space-y-2">
            {userStatisticRows.map((user, index) => <UserRankRow key={user.id} user={user} index={index} metric={`${user.avgResponseMinutes} phút`} />)}
          </div>
        </StatisticsCard>
        <StatisticsCard title="Top nhân viên tương tác nhiều" description="Xếp hạng theo tổng tương tác với khách hàng">
          <div className="space-y-2">
            {userStatisticRows.map((user, index) => <UserRankRow key={user.id} user={user} index={index} metric={formatNumber(user.interactions)} />)}
          </div>
        </StatisticsCard>
      </div>
      <div className="mt-4">
        <StatisticsCard
          title="Thống kê chi tiết"
          description="Theo dõi hiệu suất xử lý hội thoại của từng nhân viên"
          action={<SectionTabs value={tab} onChange={setTab} items={[{ value: "performance", label: "Hiệu suất" }, { value: "revenue", label: "Doanh thu" }]} />}
        >
          <DataTable
            columns={[
              { key: "rank", label: "#" },
              { key: "employee", label: "Nhân viên" },
              { key: "interactions", label: "Tương tác", align: "right" },
              { key: "messages", label: "Tin nhắn", align: "right" },
              { key: "comments", label: "Bình luận", align: "right" },
              { key: "conversations", label: "Hội thoại", align: "right" },
              { key: "rate", label: "Phản hồi", align: "right" },
              { key: "response", label: "TG phản hồi", align: "right" },
              { key: "orders", label: "Đơn", align: "right" },
              { key: "revenue", label: "Doanh thu", align: "right" },
            ]}
            rows={rows}
            footer={<TableFooter />}
          />
        </StatisticsCard>
      </div>
    </div>
  );
}

export function EngagementStatistic() {
  const [rangePreset, setRangePreset] = useState<StatisticRangePreset>("30d");
  const interactionOptions = baseCartesianOptions(["Tin nhắn", "Bình luận", "Đánh giá", "Cuộc gọi"], {
    colors: ["#84cc16"],
    legend: { show: false },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "46%" } },
  });
  const donutOptions: ApexOptions = {
    chart: { type: "donut", fontFamily: "Inter, sans-serif" },
    colors: ["#84cc16", "#06b6d4"],
    labels: ["Tin nhắn", "Bình luận"],
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    legend: { position: "bottom", labels: { colors: "#cbd5e1" } },
    plotOptions: { pie: { donut: { size: "72%", labels: { show: true, total: { show: true, label: "Tổng tương tác", color: "#94a3b8", formatter: () => "8.624" }, value: { color: "#f8fafc" } } } } },
  };
  return (
    <div>
      <StatisticPageHeader title="Tương tác" range={rangePreset} onRangeChange={setRangePreset} />
      <DateFilterBar />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Tổng tương tác" value="8.624" hint="+12,8% so với kỳ trước" icon={<MessagesSquare />} />
        <MetricTile label="Khách hàng mới" value="713" hint="+9,4% so với kỳ trước" color="emerald" icon={<UserRoundPlus />} />
        <MetricTile label="Hội thoại mới" value="1.842" hint="94% được phản hồi" color="cyan" icon={<MessageCircle />} />
        <MetricTile label="Đơn hàng từ chat" value="284" hint="Tỷ lệ chuyển đổi 15,4%" color="amber" icon={<ShoppingBag />} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <StatisticsCard title="Tổng lượt tương tác theo loại" description="So sánh hoạt động theo từng kênh tương tác">
          <StatisticsChart options={interactionOptions} series={[{ name: "Tương tác", data: [6420, 2204, 621, 624] }]} type="bar" height={300} />
        </StatisticsCard>
        <StatisticsCard title="Tỷ lệ phản hồi theo loại" description="Phân bổ giữa tin nhắn và bình luận">
          <StatisticsChart options={donutOptions} series={[6420, 2204]} type="donut" height={300} />
        </StatisticsCard>
      </div>
      <div className="mt-4">
        <StatisticsCard title="Tương tác theo thời gian" description="Chi tiết tương tác trong khoảng thời gian đã chọn">
          <StatisticsChart
            options={baseCartesianOptions(activityOverviewLabels, { colors: ["#84cc16", "#06b6d4"], fill: { type: "gradient", gradient: { opacityFrom: 0.15, opacityTo: 0.01 } } })}
            series={[
              { name: "Tin nhắn", data: activityOverviewSeries.interactions.map((value) => value * 5) },
              { name: "Bình luận", data: activityOverviewSeries.interactions.map((value) => Math.round(value * 1.7)) },
            ]}
            type="area"
            height={300}
          />
        </StatisticsCard>
      </div>
    </div>
  );
}

export function TagStatistic() {
  const [rangePreset, setRangePreset] = useState<StatisticRangePreset>("30d");
  const [tab, setTab] = useState("tag");
  const rows = tagStatisticRows.map((tag) => ({
    tag: (
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
        <span className="font-medium text-slate-800 dark:text-slate-200">{tag.name}</span>
      </div>
    ),
    conversations: formatNumber(tag.conversations),
    share: `${Math.round((tag.conversations / tagStatisticRows.reduce((sum, item) => sum + item.conversations, 0)) * 100)}%`,
    change: <ChangeValue value={tag.change} />,
  }));
  return (
    <div>
      <StatisticPageHeader title="Thẻ hội thoại" range={rangePreset} onRangeChange={setRangePreset} />
      <DateFilterBar showSearch />
      <StatisticsCard
        title="Thống kê chi tiết thẻ hội thoại"
        description="Thống kê số hội thoại được gắn thẻ trong khoảng thời gian đã chọn"
        action={<SectionTabs value={tab} onChange={setTab} items={[{ value: "tag", label: "Thống kê thẻ" }, { value: "staff", label: "Theo nhân viên" }]} />}
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <DataTable
            columns={[
              { key: "tag", label: "Thẻ hội thoại" },
              { key: "conversations", label: "Hội thoại", align: "right" },
              { key: "share", label: "Tỷ trọng", align: "right" },
              { key: "change", label: "Tăng trưởng", align: "right" },
            ]}
            rows={rows}
          />
          <div className="rounded-xl border border-slate-200 p-4 dark:border-white/[0.08]">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Top thẻ hội thoại</h3>
            <div className="mt-4 space-y-3">
              {tagStatisticRows.slice(0, 6).map((tag) => (
                <div key={tag.id}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">{tag.name}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{tag.conversations}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                    <div className="h-full rounded-full bg-lime-500" style={{ width: `${Math.max(14, (tag.conversations / tagStatisticRows[0].conversations) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StatisticsCard>
    </div>
  );
}

export function CallCenterStatistic() {
  const [rangePreset, setRangePreset] = useState<StatisticRangePreset>("30d");
  const [tab, setTab] = useState("overview");
  const rows = callCenterStatisticRows.map((row) => ({
    date: <span className="font-medium text-slate-800 dark:text-slate-200">{row.date}</span>,
    inbound: row.inbound,
    outbound: row.outbound,
    answered: row.answered,
    missed: <span className="text-rose-500">{row.missed}</span>,
    duration: `${Math.floor(row.avgSeconds / 60)}m ${row.avgSeconds % 60}s`,
    customers: row.uniqueCustomers,
  }));
  return (
    <div>
      <StatisticPageHeader title="Tổng đài" range={rangePreset} onRangeChange={setRangePreset} />
      <DateFilterBar />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Tổng cuộc gọi" value="624" hint="+8,2% so với kỳ trước" icon={<PhoneCall />} />
        <MetricTile label="Cuộc gọi đến" value="412" hint="93% được trả lời" color="emerald" icon={<PhoneIncoming />} />
        <MetricTile label="Cuộc gọi đi" value="212" hint="Thời lượng TB 3m 44s" color="cyan" icon={<PhoneOutgoing />} />
        <MetricTile label="Cuộc gọi nhỡ" value="57" hint="Giảm 6,1%" color="rose" icon={<PhoneMissed />} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <StatisticsCard title="Biểu đồ cuộc gọi theo thời gian" description="Số cuộc gọi đến và đi theo từng ngày">
          <StatisticsChart
            options={baseCartesianOptions(callCenterStatisticRows.slice().reverse().map((row) => row.date.slice(0, 5)), { colors: ["#84cc16", "#06b6d4"], fill: { type: "gradient", gradient: { opacityFrom: 0.18, opacityTo: 0.02 } } })}
            series={[
              { name: "Cuộc gọi đến", data: callCenterStatisticRows.slice().reverse().map((row) => row.inbound) },
              { name: "Cuộc gọi đi", data: callCenterStatisticRows.slice().reverse().map((row) => row.outbound) },
            ]}
            type="area"
            height={290}
          />
        </StatisticsCard>
        <StatisticsCard title="Phân bổ trạng thái" description="Tỷ lệ cuộc gọi được trả lời và bỏ lỡ">
          <StatisticsChart
            options={{ chart: { type: "donut", fontFamily: "Inter, sans-serif" }, colors: ["#84cc16", "#ef4444"], labels: ["Đã trả lời", "Bỏ lỡ"], dataLabels: { enabled: false }, stroke: { width: 0 }, legend: { position: "bottom", labels: { colors: "#cbd5e1" } }, plotOptions: { pie: { donut: { size: "72%", labels: { show: true, total: { show: true, label: "Tổng cuộc gọi", color: "#94a3b8", formatter: () => "624" }, value: { color: "#f8fafc" } } } } } }}
            series={[567, 57]}
            type="donut"
            height={290}
          />
        </StatisticsCard>
      </div>
      <div className="mt-4">
        <StatisticsCard title="Thống kê chi tiết" description="Dữ liệu tổng đài theo ngày" action={<SectionTabs value={tab} onChange={setTab} items={[{ value: "overview", label: "Tổng quan" }, { value: "agents", label: "Nhân viên" }]} />}>
          <DataTable columns={[
            { key: "date", label: "Thời gian" }, { key: "inbound", label: "Gọi đến", align: "right" }, { key: "outbound", label: "Gọi đi", align: "right" }, { key: "answered", label: "Đã trả lời", align: "right" }, { key: "missed", label: "Bỏ lỡ", align: "right" }, { key: "duration", label: "Thời lượng TB", align: "right" }, { key: "customers", label: "Khách hàng", align: "right" },
          ]} rows={rows} footer={<TableFooter />} />
        </StatisticsCard>
      </div>
    </div>
  );
}

export function AdsStatistic() {
  const [rangePreset, setRangePreset] = useState<StatisticRangePreset>("30d");
  const [tab, setTab] = useState("overview");
  const rows = adsStatisticRows.map((row) => ({
    date: <span className="font-medium text-slate-800 dark:text-slate-200">{row.date}</span>,
    campaigns: row.campaigns,
    messages: formatNumber(row.messages),
    conversations: formatNumber(row.conversations),
    customers: formatNumber(row.customers),
    orders: row.orders,
    revenue: formatMoney(row.revenue),
    conversion: <span className="font-semibold text-lime-600 dark:text-lime-400">{row.conversionRate}%</span>,
  }));
  return (
    <div>
      <StatisticPageHeader title="Quảng cáo" range={rangePreset} onRangeChange={setRangePreset} />
      <div className="mb-4 overflow-hidden rounded-xl border border-lime-300/50 bg-gradient-to-r from-lime-500/20 via-emerald-500/10 to-cyan-500/10 px-5 py-4 dark:border-lime-500/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-500 text-slate-950"><Megaphone className="h-5 w-5" /></div>
            <div><div className="text-sm font-semibold text-slate-900 dark:text-white">Tối ưu tin nhắn quảng cáo cùng LadiPage</div><div className="mt-1 text-xs text-slate-500 dark:text-slate-300">Theo dõi hiệu quả chiến dịch, hội thoại và đơn hàng trên cùng một báo cáo.</div></div>
          </div>
          <button className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-lime-400">Mở trung tâm quảng cáo</button>
        </div>
      </div>
      <DateFilterBar />
      <SectionTabs value={tab} onChange={setTab} items={[{ value: "overview", label: "Tổng quan" }, { value: "campaign", label: "Chiến dịch" }, { value: "ads", label: "Quảng cáo" }]} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Tin nhắn quảng cáo" value="1.909" hint="+14,2%" icon={<MessageCircle />} />
        <MetricTile label="Khách hàng mới" value="1.003" hint="+11,8%" color="emerald" icon={<UsersRound />} />
        <MetricTile label="Đơn hàng" value="220" hint="Tỷ lệ chốt 21,9%" color="amber" icon={<ShoppingBag />} />
        <MetricTile label="Doanh thu" value="570 triệu" hint="ROAS 4,7" color="cyan" icon={<CircleDollarSign />} />
      </div>
      <div className="mt-4">
        <StatisticsCard title="Biểu đồ hiệu quả theo thời gian" description="Tin nhắn, khách hàng và đơn hàng được tạo từ quảng cáo">
          <StatisticsChart
            options={baseCartesianOptions(adsStatisticRows.slice().reverse().map((row) => row.date.slice(0, 5)), { colors: ["#84cc16", "#06b6d4", "#f59e0b"], fill: { type: "gradient", gradient: { opacityFrom: 0.2, opacityTo: 0.02 } } })}
            series={[
              { name: "Tin nhắn", data: adsStatisticRows.slice().reverse().map((row) => row.messages) },
              { name: "Khách hàng", data: adsStatisticRows.slice().reverse().map((row) => row.customers) },
              { name: "Đơn hàng", data: adsStatisticRows.slice().reverse().map((row) => row.orders) },
            ]}
            type="area"
            height={320}
          />
        </StatisticsCard>
      </div>
      <div className="mt-4">
        <StatisticsCard title="Thống kê chi tiết" description="Hiệu quả quảng cáo theo ngày">
          <DataTable columns={[
            { key: "date", label: "Thời gian" }, { key: "campaigns", label: "Chiến dịch", align: "right" }, { key: "messages", label: "Tin nhắn", align: "right" }, { key: "conversations", label: "Hội thoại", align: "right" }, { key: "customers", label: "Khách hàng", align: "right" }, { key: "orders", label: "Đơn hàng", align: "right" }, { key: "revenue", label: "Doanh thu", align: "right" }, { key: "conversion", label: "Tỷ lệ chốt", align: "right" },
          ]} rows={rows} footer={<TableFooter />} />
        </StatisticsCard>
      </div>
    </div>
  );
}

export function FeedbackStatistic() {
  const [rangePreset, setRangePreset] = useState<StatisticRangePreset>("30d");
  const rows = feedbackStatisticRows.map((row) => ({
    date: <span className="font-medium text-slate-800 dark:text-slate-200">{row.date}</span>,
    total: row.total,
    positive: <span className="text-lime-600 dark:text-lime-400">{row.positive}</span>,
    neutral: <span className="text-amber-500">{row.neutral}</span>,
    negative: <span className="text-rose-500">{row.negative}</span>,
    average: <span className="inline-flex items-center gap-1 font-semibold"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{row.average}</span>,
  }));
  const totalPositive = feedbackStatisticRows.reduce((sum, row) => sum + row.positive, 0);
  const totalNeutral = feedbackStatisticRows.reduce((sum, row) => sum + row.neutral, 0);
  const totalNegative = feedbackStatisticRows.reduce((sum, row) => sum + row.negative, 0);
  return (
    <div>
      <StatisticPageHeader title="Đánh giá" range={rangePreset} onRangeChange={setRangePreset} />
      <DateFilterBar />
      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <StatisticsCard title="Đánh giá" description="Đánh giá của khách hàng về nhân viên">
          <StatisticsChart
            options={{ chart: { type: "donut", fontFamily: "Inter, sans-serif" }, colors: ["#84cc16", "#f59e0b", "#ef4444"], labels: ["Tốt (5 sao)", "Trung bình (3 - 4 sao)", "Cần cải thiện (1 - 2 sao)"], dataLabels: { enabled: false }, stroke: { width: 0 }, legend: { position: "bottom", labels: { colors: "#cbd5e1" } }, plotOptions: { pie: { donut: { size: "74%", labels: { show: true, total: { show: true, label: "Trung bình", color: "#94a3b8", formatter: () => "4.6 ★" }, value: { color: "#f8fafc" } } } } } }}
            series={[totalPositive, totalNeutral, totalNegative]}
            type="donut"
            height={320}
          />
        </StatisticsCard>
        <StatisticsCard title="Top nhân viên" description="Nhân viên nhận nhiều phản hồi tích cực nhất">
          <div className="grid gap-3 sm:grid-cols-2">
            {userStatisticRows.slice(0, 4).map((user, index) => (
              <div key={user.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-white/[0.08]">
                <img src={user.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user.name}</div><div className="mt-1 flex items-center gap-1 text-xs text-amber-500"><Star className="h-3.5 w-3.5 fill-current" />{(4.9 - index * 0.1).toFixed(1)} · {128 - index * 11} đánh giá</div></div>
              </div>
            ))}
          </div>
        </StatisticsCard>
      </div>
      <div className="mt-4">
        <StatisticsCard title="Thống kê chi tiết đánh giá" description="Tổng hợp đánh giá theo ngày">
          <DataTable columns={[
            { key: "date", label: "Thời gian" }, { key: "total", label: "Tổng đánh giá", align: "right" }, { key: "positive", label: "Tốt", align: "right" }, { key: "neutral", label: "Trung bình", align: "right" }, { key: "negative", label: "Cần cải thiện", align: "right" }, { key: "average", label: "Điểm TB", align: "right" },
          ]} rows={rows} footer={<TableFooter />} />
        </StatisticsCard>
      </div>
    </div>
  );
}

export function ExportStatistic() {
  const [rangePreset, setRangePreset] = useState<StatisticRangePreset>("30d");
  const [exportTab, setExportTab] = useState("messages");
  const exportJobs = [
    { id: "BK-20260804", time: "04/08/2026 13:45", type: "Tin nhắn & hội thoại", records: "18.624", size: "36,8 MB", status: "Hoàn tất" },
    { id: "BK-20260803", time: "03/08/2026 23:00", type: "Tin nhắn", records: "16.982", size: "31,2 MB", status: "Hoàn tất" },
    { id: "BK-20260802", time: "02/08/2026 23:00", type: "Hội thoại", records: "4.108", size: "8,6 MB", status: "Hoàn tất" },
  ];
  return (
    <div>
      <StatisticPageHeader
        title="Sao lưu"
        description="Xuất và lưu trữ dữ liệu tin nhắn, hội thoại của workspace"
        range={rangePreset}
        onRangeChange={setRangePreset}
        actions={<button className="inline-flex h-10 items-center gap-2 rounded-lg bg-lime-500 px-4 text-xs font-semibold text-slate-950"><Save className="h-4 w-4" />Tạo bản sao lưu</button>}
      />
      <DateFilterBar showSearch={false} showPage={false} />
      <StatisticsCard
        title="Tin nhắn trễ / hội thoại"
        description="Theo dõi dữ liệu cần đồng bộ và lịch sử sao lưu"
        action={<SectionTabs value={exportTab} onChange={setExportTab} items={[{ value: "messages", label: "Tin nhắn" }, { value: "conversations", label: "Hội thoại" }, { value: "history", label: "Lịch sử sao lưu" }]} />}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile label="Tin nhắn đã sao lưu" value="18.624" hint="100% dữ liệu hợp lệ" icon={<MessageCircle />} />
          <MetricTile label="Hội thoại đã sao lưu" value="4.108" hint="Không có dữ liệu lỗi" color="emerald" icon={<MessagesSquare />} />
          <MetricTile label="Chờ đồng bộ" value="0" hint="Cập nhật 2 phút trước" color="cyan" icon={<RefreshCcw />} />
        </div>
        <div className="mt-4">
          <DataTable
            columns={[
              { key: "id", label: "Mã sao lưu" }, { key: "time", label: "Thời gian" }, { key: "type", label: "Loại dữ liệu" }, { key: "records", label: "Bản ghi", align: "right" }, { key: "size", label: "Dung lượng", align: "right" }, { key: "status", label: "Trạng thái", align: "right" },
            ]}
            rows={exportJobs.map((exportJob) => ({ ...exportJob, status: <span className="rounded-full bg-lime-500/10 px-2 py-1 text-[11px] font-semibold text-lime-700 dark:text-lime-300">{exportJob.status}</span> }))}
          />
        </div>
      </StatisticsCard>
    </div>
  );
}

function OverviewChannelRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: "lime" | "cyan" }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/[0.08]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color === "lime" ? "bg-lime-500/10 text-lime-500" : "bg-cyan-500/10 text-cyan-500"} [&>svg]:h-5 [&>svg]:w-5`}>{icon}</div>
      <div><div className="text-xs text-slate-500 dark:text-slate-400">{label}</div><div className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">{formatNumber(value)}</div></div>
    </div>
  );
}

function CompactKpi({ label, value, color }: { label: string; value: string; color: "lime" | "cyan" | "amber" | "emerald" }) {
  const colors = { lime: "bg-lime-500", cyan: "bg-cyan-500", amber: "bg-amber-500", emerald: "bg-emerald-500" };
  return <div className="relative overflow-hidden rounded-xl border border-slate-200 p-4 dark:border-white/[0.08]"><div className="text-2xl font-medium text-slate-900 dark:text-white">{value}</div><div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</div><div className={`absolute bottom-0 left-4 right-4 h-0.5 ${colors[color]}`} /></div>;
}

function RingSummary({ value, label, suffix }: { value: string; label: string; suffix?: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full border-[22px] border-slate-100 dark:border-white/[0.04]">
      <div className="text-center"><div className="text-xs text-slate-500 dark:text-slate-400">{label}</div><div className="mt-2 flex items-center justify-center gap-2 text-3xl font-medium text-slate-950 dark:text-white">{value}{suffix}</div><div className="mt-3 inline-flex items-center gap-1 rounded-md bg-lime-500/15 px-2 py-1 text-[11px] font-semibold text-lime-700 dark:text-lime-300"><ArrowUpRight className="h-3 w-3" /> 8%</div></div>
    </div>
  );
}

function LegendLine({ color, label, value }: { color: string; label: string; value: string }) {
  return <div className="flex items-center gap-2 text-xs"><span className="h-3 w-3 rounded" style={{ backgroundColor: color }} /><span className="flex-1 text-slate-600 dark:text-slate-300">{label}</span><span className="font-semibold text-slate-700 dark:text-slate-200">{value}</span></div>;
}

function PlatformSummary({ label, value, change, tone }: { label: string; value: string; change: number; tone: "lime" | "cyan" | "rose" | "emerald" }) {
  const tones = { lime: "from-lime-500 to-lime-300", cyan: "from-cyan-500 to-cyan-300", rose: "from-rose-500 to-rose-300", emerald: "from-emerald-500 to-emerald-300" };
  return <div className="rounded-xl border border-slate-200 p-3 dark:border-white/[0.08]"><div className="flex items-center gap-2"><span className={`h-8 w-8 rounded-lg bg-gradient-to-br ${tones[tone]}`} /><div><div className="text-xs text-slate-500 dark:text-slate-400">{label}</div><div className="font-semibold text-slate-900 dark:text-white">{value}</div></div><span className="ml-auto text-[11px] font-semibold text-lime-600 dark:text-lime-400">+{change}%</span></div></div>;
}

function UserRankRow({ user, index, metric }: { user: (typeof userStatisticRows)[number]; index: number; metric: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/[0.08]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-500/15 text-xs font-semibold text-lime-700 dark:text-lime-300">{index + 1}</span><img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-slate-800 dark:text-white">{user.name}</div><div className="mt-0.5 text-[11px] text-slate-400">Phản hồi {user.responseRate}%</div></div><span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{metric}</span></div>;
}

function ChangeValue({ value }: { value: number }) {
  const positive = value >= 0;
  return <span className={`inline-flex items-center gap-1 font-semibold ${positive ? "text-lime-600 dark:text-lime-400" : "text-rose-500"}`}>{positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{Math.abs(value)}%</span>;
}

function TableFooter() {
  return <div className="flex items-center justify-between text-xs text-slate-400"><span>Hiển thị 1 - 7 trên 30 kết quả</span><div className="flex gap-1"><button className="rounded-md border border-slate-200 px-2 py-1 dark:border-white/10">Trước</button><button className="rounded-md bg-lime-500 px-2 py-1 font-semibold text-slate-950">1</button><button className="rounded-md border border-slate-200 px-2 py-1 dark:border-white/10">2</button><button className="rounded-md border border-slate-200 px-2 py-1 dark:border-white/10">Sau</button></div></div>;
}

// Compatibility exports for the initial prototype names.
export const OverviewStatistics = OverviewStatistic;
export const PageStatistics = PageStatistic;
export const StaffStatistics = UserStatistic;
export const EngagementStatistics = EngagementStatistic;
export const TagStatistics = TagStatistic;
export const CallCenterStatistics = CallCenterStatistic;
export const AdsStatistics = AdsStatistic;
export const RatingStatistics = FeedbackStatistic;
export const BackupStatistics = ExportStatistic;
