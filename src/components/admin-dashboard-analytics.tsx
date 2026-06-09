
'use client';

import { BarChart, Users, CheckCircle, PieChart as PieChartIcon, Target, Building, Calendar, Briefcase, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Sector,
} from 'recharts';
import { useCallback, useState } from 'react';
import { Skeleton } from './ui/skeleton';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-sm">
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
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-xs">{`Count ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-xs">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export function AdminDashboardAnalytics({ data }: { data: AnalyticsData }) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [branchIndex, setBranchIndex] = useState(0);
  const [yearIndex, setYearIndex] = useState(0);
  const [nonTechIndex, setNonTechIndex] = useState(0);

  const onPieEnter = useCallback((setter: React.Dispatch<React.SetStateAction<number>>, _: any, index: number) => {
    setter(index);
  }, []);

  if (!data) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-12">
      {/* Stat Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="bento-card !p-8 flex flex-col justify-between border-[#4285F4]/20 bg-[#4285F4]/5">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#4285F4] mb-6">Engagement</p>
            <div className="text-6xl font-black tracking-tighter mb-2 text-white">{data.totalApplications}</div>
            <p className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest">Total Applicants</p>
        </div>
        <div className="bento-card !p-8 flex flex-col justify-between border-[#34A853]/20 bg-[#34A853]/5">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#34A853] mb-6">Activity</p>
            <div className="text-6xl font-black tracking-tighter mb-2 text-white">{data.attendedCount}</div>
            <p className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest">Interviews Done</p>
        </div>
        <div className="bento-card !p-8 flex flex-col justify-between border-[#FBBC04]/20 bg-[#FBBC04]/5">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#FBBC04] mb-6">Efficiency</p>
            <div className="text-6xl font-black tracking-tighter mb-2 text-white">
              {data.totalApplications > 0 ? ((data.attendedCount / data.totalApplications) * 100).toFixed(0) : 0}%
            </div>
            <p className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest">Conversion Rate</p>
        </div>
        <div className="bento-card !p-8 flex flex-col justify-between border-[#EA4335]/20 bg-[#EA4335]/5">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#EA4335] mb-6">Growth</p>
            <div className="text-6xl font-black tracking-tighter mb-2 text-[#EA4335]">{data.hiredCount}</div>
            <p className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest">New Members</p>
        </div>
        <div className="bento-card !p-8 flex flex-col justify-between border-white/10">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-white/30 mb-6">Selectivity</p>
            <div className="text-6xl font-black tracking-tighter mb-2 text-white/20">{data.rejectedCount}</div>
            <p className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest">Total Rejections</p>
        </div>
      </div>

      {/* Domain Charts */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="bento-card !p-10 !h-auto">
            <h3 className="text-2xl font-black tracking-tighter mb-10 flex items-center gap-4 uppercase italic">
              <BarChart className="h-6 w-6 text-[#4285F4]" />
              Technical Domains.
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsBarChart data={data.techDomainData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#000',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff'
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" fill="#4285F4" radius={[0, 10, 10, 0]} barSize={32} />
              </RechartsBarChart>
            </ResponsiveContainer>
        </div>
        <div className="bento-card !p-10 !h-auto">
            <h3 className="text-2xl font-black tracking-tighter mb-10 flex items-center gap-4 uppercase italic">
              <PieChartIcon className="h-6 w-6 text-[#34A853]" />
              Non-Tech Distribution.
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsPieChart>
                <Pie
                  activeIndex={nonTechIndex}
                  activeShape={renderActiveShape}
                  data={data.nonTechDomainData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={130}
                  dataKey="count"
                  onMouseEnter={(_: any, index: number) => setNonTechIndex(index)}
                >
                  {data.nonTechDomainData.map((_, index) => (
                    <Cell key={`cell-nontech-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Stat Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/5 p-8 flex flex-col justify-between">
            <div className="h-2 w-12 bg-white/20 rounded" />
            <div className="h-10 w-24 bg-white/20 rounded" />
            <div className="h-2 w-20 bg-white/20 rounded" />
          </div>
        ))}
      </div>
      {/* Charts Skeleton */}
      <div className="grid gap-8 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-[480px] rounded-2xl bg-white/5 border border-white/5 p-10" />
        ))}
      </div>
    </div>
  );
}
