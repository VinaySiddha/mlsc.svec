
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
import { useCallback, useState, useEffect } from 'react';
import { getAnalyticsData } from '@/app/actions';
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

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-32 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 glass-card p-6">
           <Skeleton className="h-[350px] w-full" />
        </Card>
        <Card className="lg:col-span-3 glass-card p-6">
           <Skeleton className="h-[350px] w-full" />
        </Card>
      </div>
    </div>
  )
}

export function AdminDashboardAnalytics({ panelDomain }: { panelDomain?: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const result = await getAnalyticsData(panelDomain);
        if ('error' in result) {
          setError(result.error ?? "Failed to fetch analytics data.");
          setData(null);
        } else {
          setData(result as AnalyticsData);
        }
      } catch (e) {
        setError("An unexpected error occurred.");
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [panelDomain]);


  const [statusIndex, setStatusIndex] = useState(0);
  const [branchIndex, setBranchIndex] = useState(0);
  const [yearIndex, setYearIndex] = useState(0);
  const [nonTechIndex, setNonTechIndex] = useState(0);

  const onPieEnter = useCallback((setter: React.Dispatch<React.SetStateAction<number>>, _: any, index: number) => {
    setter(index);
  }, []);

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error || !data) {
    return (
      <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                <AlertCircle className="h-5 w-5" />
                Analytics Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">
              {error || "Could not load analytics data."}
            </p>
          </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalApplications}</div>
            <p className="text-xs text-muted-foreground">Total applications received</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews Attended</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.attendedCount}</div>
            <p className="text-xs text-muted-foreground">Candidates who attended interviews</p>
          </CardContent>
        </Card>
         <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalApplications > 0 ? ((data.attendedCount / data.totalApplications) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">From application to interview</p>
          </CardContent>
        </Card>
         <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates Hired</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.hiredCount}</div>
            <p className="text-xs text-muted-foreground">Total candidates hired</p>
          </CardContent>
        </Card>
         <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates Rejected</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Total candidates rejected</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Domain Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
         <Card className="lg:col-span-4 glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              <span>Applications by Technical Domain</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <RechartsBarChart data={data.techDomainData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={150} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--card-foreground))'
                  }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <span>Non-Technical Domain Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
                <RechartsPieChart>
                    <Pie
                        activeIndex={nonTechIndex}
                        activeShape={renderActiveShape}
                        data={data.nonTechDomainData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        fill="hsl(var(--chart-2))"
                        dataKey="count"
                        onMouseEnter={(_: any, index: number) => setNonTechIndex(index)}
                    >
                        {data.nonTechDomainData.map((entry, index) => (
                        <Cell key={`cell-nontech-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Legend
                        iconType="circle"
                        formatter={(value) => <span className="text-foreground/80">{value}</span>}
                    />
                </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Demographic Pie Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Application Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                 <Pie
                    activeIndex={statusIndex}
                    activeShape={renderActiveShape}
                    data={data.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="hsl(var(--chart-3))"
                    dataKey="count"
                    onMouseEnter={(_: any, index: number) => setStatusIndex(index)}
                 >
                    {data.statusData.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                 </Pie>
                 <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--card-foreground))'
                  }}
                 />
                 <Legend
                    iconType="circle"
                    formatter={(value) => <span className="text-foreground/80">{value}</span>}
                 />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              <span>By Department</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                 <Pie
                    activeIndex={branchIndex}
                    activeShape={renderActiveShape}
                    data={data.branchData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="hsl(var(--chart-4))"
                    dataKey="count"
                    onMouseEnter={(_: any, index: number) => setBranchIndex(index)}
                 >
                    {data.branchData.map((entry, index) => (
                      <Cell key={`cell-branch-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                 </Pie>
                 <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--card-foreground))'
                  }}
                 />
                 <Legend
                    iconType="circle"
                    formatter={(value) => <span className="text-foreground/80">{value}</span>}
                 />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>By Year</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                 <Pie
                    activeIndex={yearIndex}
                    activeShape={renderActiveShape}
                    data={data.yearData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="hsl(var(--chart-5))"
                    dataKey="count"
                    onMouseEnter={(_: any, index: number) => setYearIndex(index)}
                 >
                    {data.yearData.map((entry, index) => (
                      <Cell key={`cell-year-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                 </Pie>
                 <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--card-foreground))'
                  }}
                 />
                 <Legend
                    iconType="circle"
                    formatter={(value) => <span className="text-foreground/80">{value}</span>}
                 />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
