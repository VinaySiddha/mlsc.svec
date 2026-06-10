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
  Sector
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


interface AnalyticsData {
  totalApplications: number;
  attendedCount: number;
  hiredCount: number;
  rejectedCount: number;
  techDomainData: { name: string; count: number }[];
  nonTechDomainData: { name: string; count: number }[];
  statusData: { name: string; count: number }[];
  branchData: { name: string; count: number }[];
  yearData: { name: string; count: number }[];
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

export function AdminDashboardAnalytics({ data }: { data: AnalyticsData }) {
  const [nonTechIndex, setNonTechIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  if (!data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
          <div className="h-96 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  // Pre-calculate conversion rates and statistics
  const conversionRate = data.totalApplications > 0 
    ? ((data.attendedCount / data.totalApplications) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-8">
      {/* 4 Stat Cards precisely mirroring TailAdmin screenshot layout */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Applicants */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="h-11 w-11 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center">
              <Users className="h-5.5 w-5.5 text-[#4285F4]" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" />
              11.01%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Total Applicants</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {data.totalApplications.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Card 2: Interviews Done */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="h-11 w-11 rounded-full bg-[#34A853]/10 border border-[#34A853]/30 flex items-center justify-center">
              <UserCheck className="h-5.5 w-5.5 text-[#34A853]" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" />
              8.34%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Interviews Done</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {data.attendedCount.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Card 3: New Members */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="h-11 w-11 rounded-full bg-[#FBBC05]/10 border border-[#FBBC05]/30 flex items-center justify-center">
              <CheckCircle className="h-5.5 w-5.5 text-[#FBBC05]" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
              <TrendingDown className="h-3 w-3" />
              2.50%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Hired Members</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {data.hiredCount.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Card 4: Selectivity */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="h-11 w-11 rounded-full bg-[#EA4335]/10 border border-[#EA4335]/30 flex items-center justify-center">
              <UserX className="h-5.5 w-5.5 text-[#EA4335]" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" />
              14.2%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Conversion Rate</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {conversionRate}%
            </h4>
          </div>
        </div>
      </div>

      {/* Middle Row: Portfolio Performance Area Chart & Dividend Bar Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Large Chart: Portfolio Performance (Line/Area) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Registration Flow</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold mt-1">Here is your registration stats of each month</p>
            </div>
            <div className="flex items-center bg-slate-50 dark:bg-zinc-950 rounded-xl p-1 border border-slate-100 dark:border-zinc-900">
              {(['monthly', 'quarterly', 'annually'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors",
                    activeTab === tab 
                      ? "bg-white dark:bg-zinc-900 text-[#4285F4] shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4285F4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4285F4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-zinc-800" />
                <XAxis 
                  dataKey="month" 
                  stroke="currentColor" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  className="text-slate-400 dark:text-zinc-500 font-bold" 
                />
                <YAxis 
                  stroke="currentColor" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  className="text-slate-400 dark:text-zinc-500 font-bold" 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#0f172a'
                  }}
                  itemStyle={{ color: '#4285F4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke="#4285F4" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRegistrations)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Card: Applicants by Year (Bar Chart mirroring Dividend) */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Applicants by Year</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold mt-0.5">Year distribution of students</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full">
              <MoreVertical className="h-4.5 w-4.5" />
            </Button>
          </div>

          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={data.yearData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-zinc-800" />
                <XAxis 
                  dataKey="name" 
                  stroke="currentColor" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  className="text-slate-400 dark:text-zinc-500 font-bold"
                />
                <YAxis 
                  stroke="currentColor" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  className="text-slate-400 dark:text-zinc-500 font-bold"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#0f172a'
                  }}
                  itemStyle={{ color: '#4285F4' }}
                />
                <Bar dataKey="count" fill="#4285F4" radius={[6, 6, 0, 0]} barSize={24} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Technical Domain Bar Chart & Non-Technical Domain Pie Chart */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Technical Domains Bar Chart (3/5 width) */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Technical Domain Distribution</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold mt-0.5">Applicants per tech domain</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-[#4285F4]/10 flex items-center justify-center">
              <Layers className="h-4.5 w-4.5 text-[#4285F4]" />
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={data.techDomainData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="currentColor" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  width={110}
                  className="text-slate-600 dark:text-zinc-400 font-bold"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#0f172a'
                  }}
                  itemStyle={{ color: '#4285F4' }}
                />
                <Bar dataKey="count" fill="#4285F4" radius={[0, 8, 8, 0]} barSize={20} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Non-Technical Domains Pie Chart (2/5 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Non-Tech Domains</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold mt-0.5">Distribution of club role interests</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-[#34A853]/10 flex items-center justify-center">
              <PieChartIcon className="h-4.5 w-4.5 text-[#34A853]" />
            </div>
          </div>

          <div className="h-72 w-full flex-1 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  activeIndex={nonTechIndex}
                  activeShape={renderActiveShape}
                  data={data.nonTechDomainData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  dataKey="count"
                  onMouseEnter={(_, index) => setNonTechIndex(index)}
                >
                  {data.nonTechDomainData.map((_, index) => (
                    <Cell key={`cell-nontech-${index}`} fill={COLORS[index % COLORS.length]} className="stroke-white dark:stroke-zinc-900" strokeWidth={2} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
