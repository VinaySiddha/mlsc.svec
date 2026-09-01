'use client';

import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  UserCheck, 
  UserX, 
  BarChart, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown, 
  MoreVertical,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Sector,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface AnalyticsData {
  totalApplications: number;
  attendedCount: number;
  hiredCount: number;
  rejectedCount: number;
  techDomainData: { name: string; count: number; attended?: number }[];
  nonTechDomainData: { name: string; count: number; attended?: number }[];
  statusData: { name: string; count: number }[];
  branchData: { name: string; count: number }[];
  yearData: { name: string; count: number }[];
  timelineData?: { date: string; desktop: number; mobile: number }[];
}

const COLORS = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8884d8', '#82ca9d', '#ffc658'];

// Interactive active shape for Pie Chart
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 24) * cos;
  const my = cy + (outerRadius + 24) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 16;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={6} textAnchor="middle" fill={fill} className="font-extrabold text-xs tracking-wider uppercase">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 8}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
      <circle cx={ex} cy={ey} r={2.5} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} dy={3} textAnchor={textAnchor} fill="currentColor" className="text-xs font-bold">{`Count: ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} dy={16} textAnchor={textAnchor} fill="currentColor" className="text-[10px] opacity-60">
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

// Mock monthly registration data for the Line/Area Chart to match TailAdmin screenshot style
const mockMonthlyData = [
  { month: "Jun '25", registrations: 12 },
  { month: "Jul '25", registrations: 24 },
  { month: "Aug '25", registrations: 18 },
  { month: "Sep '25", registrations: 45 },
  { month: "Oct '25", registrations: 95 },
  { month: "Nov '25", registrations: 110 },
  { month: "Dec '25", registrations: 65 },
  { month: "Jan '26", registrations: 14 },
  { month: "Feb '26", registrations: 28 },
  { month: "Mar '26", registrations: 78 },
  { month: "Apr '26", registrations: 142 },
];

const fallbackChartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
  { date: "2024-04-21", desktop: 137, mobile: 200 },
  { date: "2024-04-22", desktop: 224, mobile: 170 },
  { date: "2024-04-23", desktop: 138, mobile: 230 },
  { date: "2024-04-24", desktop: 387, mobile: 290 },
  { date: "2024-04-25", desktop: 215, mobile: 250 },
  { date: "2024-04-26", desktop: 75, mobile: 130 },
  { date: "2024-04-27", desktop: 383, mobile: 420 },
  { date: "2024-04-28", desktop: 122, mobile: 180 },
  { date: "2024-04-29", desktop: 315, mobile: 240 },
  { date: "2024-04-30", desktop: 454, mobile: 380 },
  { date: "2024-05-01", desktop: 165, mobile: 220 },
  { date: "2024-05-02", desktop: 293, mobile: 310 },
  { date: "2024-05-03", desktop: 247, mobile: 190 },
  { date: "2024-05-04", desktop: 385, mobile: 420 },
  { date: "2024-05-05", desktop: 481, mobile: 390 },
  { date: "2024-05-06", desktop: 498, mobile: 520 },
  { date: "2024-05-07", desktop: 388, mobile: 300 },
  { date: "2024-05-08", desktop: 149, mobile: 210 },
  { date: "2024-05-09", desktop: 227, mobile: 180 },
  { date: "2024-05-10", desktop: 293, mobile: 330 },
  { date: "2024-05-11", desktop: 335, mobile: 270 },
  { date: "2024-05-12", desktop: 197, mobile: 240 },
  { date: "2024-05-13", desktop: 197, mobile: 160 },
  { date: "2024-05-14", desktop: 448, mobile: 490 },
  { date: "2024-05-15", desktop: 473, mobile: 380 },
  { date: "2024-05-16", desktop: 338, mobile: 400 },
  { date: "2024-05-17", desktop: 499, mobile: 420 },
  { date: "2024-05-18", desktop: 315, mobile: 350 },
  { date: "2024-05-19", desktop: 235, mobile: 180 },
  { date: "2024-05-20", desktop: 177, mobile: 230 },
  { date: "2024-05-21", desktop: 82, mobile: 140 },
  { date: "2024-05-22", desktop: 81, mobile: 120 },
  { date: "2024-05-23", desktop: 252, mobile: 290 },
  { date: "2024-05-24", desktop: 294, mobile: 220 },
  { date: "2024-05-25", desktop: 201, mobile: 250 },
  { date: "2024-05-26", desktop: 213, mobile: 170 },
  { date: "2024-05-27", desktop: 420, mobile: 460 },
  { date: "2024-05-28", desktop: 233, mobile: 190 },
  { date: "2024-05-29", desktop: 78, mobile: 130 },
  { date: "2024-05-30", desktop: 340, mobile: 280 },
  { date: "2024-05-31", desktop: 178, mobile: 230 },
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
  { date: "2024-06-06", desktop: 294, mobile: 250 },
  { date: "2024-06-07", desktop: 323, mobile: 370 },
  { date: "2024-06-08", desktop: 385, mobile: 320 },
  { date: "2024-06-09", desktop: 438, mobile: 480 },
  { date: "2024-06-10", desktop: 155, mobile: 200 },
  { date: "2024-06-11", desktop: 92, mobile: 150 },
  { date: "2024-06-12", desktop: 492, mobile: 420 },
  { date: "2024-06-13", desktop: 81, mobile: 130 },
  { date: "2024-06-14", desktop: 426, mobile: 380 },
  { date: "2024-06-15", desktop: 307, mobile: 350 },
  { date: "2024-06-16", desktop: 371, mobile: 310 },
  { date: "2024-06-17", desktop: 475, mobile: 520 },
  { date: "2024-06-18", desktop: 107, mobile: 170 },
  { date: "2024-06-19", desktop: 341, mobile: 290 },
  { date: "2024-06-20", desktop: 408, mobile: 450 },
  { date: "2024-06-21", desktop: 169, mobile: 210 },
  { date: "2024-06-22", desktop: 317, mobile: 270 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
];

const chartConfig = {
  visitors: {
    label: "Applicants",
  },
  desktop: {
    label: "Technical",
    color: "#4285F4",
  },
  mobile: {
    label: "Non-Technical",
    color: "#34A853",
  },
} satisfies ChartConfig;

const branchChartConfig = {
  count: {
    label: "Applicants",
    color: "#4285F4",
  },
} satisfies ChartConfig;

const yearChartConfig = {
  count: {
    label: "Applicants",
    color: "#34A853",
  },
} satisfies ChartConfig;

const techRadarConfig = {
  applicants: {
    label: "Applicants",
    color: "#4285F4",
  },
  attended: {
    label: "Interviews Done",
    color: "#34A853",
  },
} satisfies ChartConfig;

const nonTechRadarConfig = {
  applicants: {
    label: "Applicants",
    color: "#FBBC05",
  },
  attended: {
    label: "Interviews Done",
    color: "#EA4335",
  },
} satisfies ChartConfig;

export function AdminDashboardAnalytics({ data }: { data: AnalyticsData }) {
  const [nonTechIndex, setNonTechIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  const hasRealData = !!(data?.timelineData && data.timelineData.length > 0);
  const rawChartData = hasRealData ? data.timelineData! : fallbackChartData;

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000] animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000000] animate-pulse" />
          <div className="h-96 border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000000] animate-pulse" />
        </div>
      </div>
    );
  }

  // Pre-calculate conversion rates and statistics
  const conversionRate = data.totalApplications > 0 
    ? ((data.attendedCount / data.totalApplications) * 100).toFixed(1) 
    : '0';

  const branchRadarData = data.branchData?.map(item => ({
    subject: item.name,
    count: item.count
  })) || [];

  const yearRadarData = data.yearData?.map(item => ({
    subject: item.name,
    count: item.count
  })) || [];

  const techDomainRadarData = data.techDomainData?.map(item => ({
    subject: item.name,
    applicants: item.count,
    attended: item.attended || 0
  })) || [];

  const nonTechDomainRadarData = data.nonTechDomainData?.map(item => ({
    subject: item.name,
    applicants: item.count,
    attended: item.attended || 0
  })) || [];

  return (
    <div className="space-y-8 font-sans text-black">
      {/* 4 Stat Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Applicants */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#4285F4]">
          <div className="flex justify-between items-start">
            <div className="h-11 w-11 bg-[#4285F4] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000000]">
              <Users className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-black text-black bg-[#00FF66] border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000000]">
              <TrendingUp className="h-3 w-3 stroke-[3]" />
              11.01%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-black text-zinc-600 uppercase tracking-wider">Total Applicants</p>
            <h4 className="text-2xl font-black text-black tracking-tight mt-1 font-display">
              {data.totalApplications.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Card 2: Interviews Done */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#34A853]">
          <div className="flex justify-between items-start">
            <div className="h-11 w-11 bg-[#00FF66] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000000]">
              <UserCheck className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-black text-black bg-[#00FF66] border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000000]">
              <TrendingUp className="h-3 w-3 stroke-[3]" />
              8.34%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-black text-zinc-600 uppercase tracking-wider">Interviews Done</p>
            <h4 className="text-2xl font-black text-black tracking-tight mt-1 font-display">
              {data.attendedCount.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Card 3: New Members */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#FFE600]">
          <div className="flex justify-between items-start">
            <div className="h-11 w-11 bg-[#FFE600] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000000]">
              <CheckCircle className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-black text-white bg-[#FF0055] border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000000]">
              <TrendingDown className="h-3 w-3 stroke-[3]" />
              2.50%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-black text-zinc-600 uppercase tracking-wider">Hired Members</p>
            <h4 className="text-2xl font-black text-black tracking-tight mt-1 font-display">
              {data.hiredCount.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Card 4: Selectivity */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#FF0055]">
          <div className="flex justify-between items-start">
            <div className="h-11 w-11 bg-[#FF0055] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000000]">
              <UserX className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-black text-black bg-[#00FF66] border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000000]">
              <TrendingUp className="h-3 w-3 stroke-[3]" />
              14.2%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-black text-zinc-600 uppercase tracking-wider">Conversion Rate</p>
            <h4 className="text-2xl font-black text-black tracking-tight mt-1 font-display">
              {conversionRate}%
            </h4>
          </div>
        </div>
      </div>

      {/* Middle Row: Portfolio Performance Area Chart & Branch Radar Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Large Chart: Domain Applications (Line/Area) */}
        <div className="lg:col-span-2">
          <Card className="pt-0 bg-white border-2 border-black rounded-none shadow-[6px_6px_0px_0px_#000000] h-full flex flex-col justify-between">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b-2 border-black py-4 sm:flex-row bg-[#FAFAFA]">
              <div className="grid flex-1 gap-1">
                <CardTitle className="text-base font-black uppercase font-display text-black">Domain Applications</CardTitle>
                <CardDescription className="text-xs text-zinc-600 font-bold">
                  View of domain-wise registrations (Technical vs Non-Technical)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1 flex flex-col justify-center">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[230px] w-full"
              >
                <AreaChart data={rawChartData}>
                  <defs>
                    <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#4285F4"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#4285F4"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                    <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#34A853"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#34A853"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e4e4e7" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    className="text-black font-bold text-[10px]"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }}
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="url(#fillMobile)"
                    stroke="#34A853"
                    stackId="a"
                    strokeWidth={2.5}
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="url(#fillDesktop)"
                    stroke="#4285F4"
                    stackId="a"
                    strokeWidth={2.5}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Branch Radar Chart (1/3 width) */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-2 border-black rounded-none shadow-[6px_6px_0px_0px_#000000] h-full flex flex-col justify-between">
            <CardHeader className="items-center pb-2 border-b-2 border-black bg-[#FAFAFA]">
              <CardTitle className="text-base font-black uppercase font-display text-black">Branch Distribution</CardTitle>
              <CardDescription className="text-xs text-zinc-600 font-bold text-center">
                Applicants by engineering branch
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-0 pt-4 flex-1 flex items-center justify-center">
              <ChartContainer
                config={branchChartConfig}
                className="mx-auto aspect-square w-full max-h-[220px]"
              >
                <RadarChart data={branchRadarData}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "#000000", className: "text-black font-black" }} />
                  <PolarGrid stroke="#e4e4e7" />
                  <Radar
                    dataKey="count"
                    fill="var(--color-count)"
                    fillOpacity={0.6}
                    stroke="#4285F4"
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      fillOpacity: 1,
                      stroke: "#000000",
                      strokeWidth: 1,
                    }}
                  />
                </RadarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-xs border-t-2 border-black pt-4 bg-[#FAFAFA]">
              <div className="flex items-center gap-2 leading-none font-black text-black">
                <TrendingUp className="h-4 w-4 text-[#4285F4] stroke-[2.5]" /> Branch-wise hiring metrics
              </div>
              <div className="flex items-center gap-2 leading-none text-[10px] text-zinc-600 uppercase font-black tracking-widest">
                Active Recruitment Cycle
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Technical Domain Radar Chart, Non-Technical Domain Radar Chart & Year Radar Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Technical Domain Distribution Radar Chart (1/3 width) */}
        <div className="lg:col-span-1 bg-white border-2 border-black rounded-none shadow-[6px_6px_0px_0px_#000000] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-3">
            <div>
              <h3 className="text-base font-black uppercase font-display text-black">Technical Domain</h3>
              <p className="text-[10px] text-zinc-600 font-bold mt-0.5">Applicants and interviews per domain</p>
            </div>
            <div className="h-9 w-9 bg-[#4285F4] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000000]">
              <Layers className="h-4 w-4 stroke-[2.5]" />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[220px]">
            <ChartContainer
              config={techRadarConfig}
              className="mx-auto aspect-square w-full max-h-[230px]"
            >
              <RadarChart
                data={techDomainRadarData}
                margin={{
                  top: -20,
                  bottom: -10,
                  left: 0,
                  right: 0,
                }}
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: "#000000", className: "text-black font-black" }} />
                <PolarGrid stroke="#e4e4e7" />
                <Radar
                  dataKey="applicants"
                  fill="var(--color-applicants)"
                  fillOpacity={0.6}
                  stroke="#4285F4"
                  strokeWidth={2}
                />
                <Radar dataKey="attended" fill="var(--color-attended)" fillOpacity={0.4} stroke="#34A853" strokeWidth={2} />
                <ChartLegend className="mt-4" content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>
          </div>
          
          <CardFooter className="flex-col gap-2 text-xs border-t-2 border-black pt-4 px-0 pb-0 mt-4">
            <div className="flex items-center gap-2 leading-none font-black text-black w-full justify-start">
              <TrendingUp className="h-4 w-4 text-[#4285F4] stroke-[2.5]" /> Engagement level analysis
            </div>
          </CardFooter>
        </div>

        {/* Non-Technical Domain Distribution Radar Chart (1/3 width) */}
        <div className="lg:col-span-1 bg-white border-2 border-black rounded-none shadow-[6px_6px_0px_0px_#000000] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-3">
            <div>
              <h3 className="text-base font-black uppercase font-display text-black">Non-Technical Domain</h3>
              <p className="text-[10px] text-zinc-600 font-bold mt-0.5">Applicants and interviews per domain</p>
            </div>
            <div className="h-9 w-9 bg-[#FFE600] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000000]">
              <Layers className="h-4 w-4 stroke-[2.5]" />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[220px]">
            <ChartContainer
              config={nonTechRadarConfig}
              className="mx-auto aspect-square w-full max-h-[230px]"
            >
              <RadarChart
                data={nonTechDomainRadarData}
                margin={{
                  top: -20,
                  bottom: -10,
                  left: 0,
                  right: 0,
                }}
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: "#000000", className: "text-black font-black" }} />
                <PolarGrid stroke="#e4e4e7" />
                <Radar
                  dataKey="applicants"
                  fill="var(--color-applicants)"
                  fillOpacity={0.6}
                  stroke="#FBBC05"
                  strokeWidth={2}
                />
                <Radar dataKey="attended" fill="var(--color-attended)" fillOpacity={0.4} stroke="#EA4335" strokeWidth={2} />
                <ChartLegend className="mt-4" content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>
          </div>
          
          <CardFooter className="flex-col gap-2 text-xs border-t-2 border-black pt-4 px-0 pb-0 mt-4">
            <div className="flex items-center gap-2 leading-none font-black text-black w-full justify-start">
              <TrendingUp className="h-4 w-4 text-[#FBBC05] stroke-[2.5]" /> Engagement level analysis
            </div>
          </CardFooter>
        </div>

        {/* Year Radar Chart (1/3 width) */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-2 border-black rounded-none shadow-[6px_6px_0px_0px_#000000] h-full flex flex-col justify-between">
            <CardHeader className="items-center pb-2 border-b-2 border-black bg-[#FAFAFA]">
              <CardTitle className="text-base font-black uppercase font-display text-black">Year Distribution</CardTitle>
              <CardDescription className="text-xs text-zinc-600 font-bold text-center">
                Applicants by academic year
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-0 pt-4 flex-1 flex items-center justify-center min-h-[220px]">
              <ChartContainer
                config={yearChartConfig}
                className="mx-auto aspect-square w-full max-h-[230px]"
              >
                <RadarChart data={yearRadarData}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: "#000000", className: "text-black font-black" }} />
                  <PolarGrid stroke="#e4e4e7" />
                  <Radar
                    dataKey="count"
                    fill="var(--color-count)"
                    fillOpacity={0.6}
                    stroke="#34A853"
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      fillOpacity: 1,
                      stroke: "#000000",
                      strokeWidth: 1,
                    }}
                  />
                </RadarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-xs border-t-2 border-black pt-4 bg-[#FAFAFA]">
              <div className="flex items-center gap-2 leading-none font-black text-black w-full justify-start">
                <TrendingUp className="h-4 w-4 text-[#34A853] stroke-[2.5]" /> Year-wise hiring metrics
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
