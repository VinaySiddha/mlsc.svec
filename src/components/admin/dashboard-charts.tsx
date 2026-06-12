"use client";

import React, { useState, useEffect } from "react";
import {
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Award, GraduationCap, Brain, Activity } from "lucide-react";

interface RatingFields {
  communication: number;
  technical: number;
  problemSolving: number;
  teamFit: number;
  overall: number;
}

interface SuitabilityFields {
  technical: string;
  nonTechnical: string;
}

interface Application {
  id: string;
  cgpa?: string | number;
  technicalDomain: string;
  ratings?: RatingFields;
  suitability?: SuitabilityFields;
  status?: string;
}

interface DashboardChartsProps {
  applications: any[];
}

const DOMAIN_LABELS: Record<string, string> = {
  gen_ai: "Generative AI",
  ds_ml: "Data Science & ML",
  azure: "Azure Cloud",
  web_app: "Web & App Dev",
};

const CHART_COLORS = {
  blue: "#4285F4",
  green: "#34A853",
  yellow: "#FBBC05",
  red: "#EA4335",
  purple: "#8884d8",
  teal: "#008080",
  orange: "#FF8C00",
};

const PIE_COLORS = [
  CHART_COLORS.green,  // Elite
  CHART_COLORS.blue,   // High Potential
  CHART_COLORS.yellow, // Needs Work / Average
  "#94A3B8",           // Pending (Slate-400)
];

const SUITABILITY_COLORS: Record<string, string> = {
  strong: CHART_COLORS.green,
  medium: CHART_COLORS.yellow,
  weak: CHART_COLORS.red,
  undecided: "#94A3B8",
};

export function DashboardCharts({ applications }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#4285F4]" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Initializing Analytics Engine...
          </span>
        </div>
      </div>
    );
  }

  // 1. Calculate Average CGPA by Domain
  const cgpaByDomainMap: Record<string, { total: number; count: number }> = {};
  Object.keys(DOMAIN_LABELS).forEach((key) => {
    cgpaByDomainMap[key] = { total: 0, count: 0 };
  });

  applications.forEach((app) => {
    if (app.cgpa) {
      const gpa = parseFloat(app.cgpa.toString());
      if (!isNaN(gpa) && gpa > 0 && gpa <= 10) {
        const domain = app.technicalDomain || "web_app";
        if (cgpaByDomainMap[domain]) {
          cgpaByDomainMap[domain].total += gpa;
          cgpaByDomainMap[domain].count += 1;
        } else {
          cgpaByDomainMap[domain] = { total: gpa, count: 1 };
        }
      }
    }
  });

  const cgpaChartData = Object.entries(cgpaByDomainMap).map(([domain, data]) => ({
    name: DOMAIN_LABELS[domain] || domain,
    "Average CGPA": data.count > 0 ? parseFloat((data.total / data.count).toFixed(2)) : 0,
    count: data.count,
  }));

  // 2. Calculate Average Candidate Performance Ratings (among evaluated/reviewed candidates)
  let reviewedCount = 0;
  const totalRatings: RatingFields = {
    communication: 0,
    technical: 0,
    problemSolving: 0,
    teamFit: 0,
    overall: 0,
  };

  applications.forEach((app) => {
    if (app.ratings && app.ratings.overall > 0) {
      reviewedCount += 1;
      totalRatings.communication += app.ratings.communication || 0;
      totalRatings.technical += app.ratings.technical || 0;
      totalRatings.problemSolving += app.ratings.problemSolving || 0;
      totalRatings.teamFit += app.ratings.teamFit || 0;
      totalRatings.overall += app.ratings.overall || 0;
    }
  });

  const radarChartData = [
    {
      subject: "Communication",
      Score: reviewedCount > 0 ? parseFloat((totalRatings.communication / reviewedCount).toFixed(2)) : 0,
      fullMark: 10,
    },
    {
      subject: "Technical Skill",
      Score: reviewedCount > 0 ? parseFloat((totalRatings.technical / reviewedCount).toFixed(2)) : 0,
      fullMark: 10,
    },
    {
      subject: "Problem Solving",
      Score: reviewedCount > 0 ? parseFloat((totalRatings.problemSolving / reviewedCount).toFixed(2)) : 0,
      fullMark: 10,
    },
    {
      subject: "Team Fit",
      Score: reviewedCount > 0 ? parseFloat((totalRatings.teamFit / reviewedCount).toFixed(2)) : 0,
      fullMark: 10,
    },
    {
      subject: "Overall Performance",
      Score: reviewedCount > 0 ? parseFloat((totalRatings.overall / reviewedCount).toFixed(2)) : 0,
      fullMark: 10,
    },
  ];

  // 3. Talent Tier Distribution
  let eliteCount = 0;
  let highPotentialCount = 0;
  let averageCount = 0;
  let pendingCount = 0;

  applications.forEach((app) => {
    const overall = app.ratings?.overall || 0;
    if (overall >= 8) {
      eliteCount += 1;
    } else if (overall >= 6) {
      highPotentialCount += 1;
    } else if (overall > 0) {
      averageCount += 1;
    } else {
      pendingCount += 1;
    }
  });

  const tierChartData = [
    { name: "Elite (Score 8-10)", value: eliteCount },
    { name: "High Potential (Score 6-7.9)", value: highPotentialCount },
    { name: "Reviewed - Needs Work (Score 1-5.9)", value: averageCount },
    { name: "Evaluation Pending", value: pendingCount },
  ].filter((d) => d.value > 0);

  // 4. AI Suitability Split
  const suitabilityMap: Record<string, number> = {
    strong: 0,
    medium: 0,
    weak: 0,
    undecided: 0,
  };

  applications.forEach((app) => {
    const techSuitability = app.suitability?.technical?.toLowerCase() || "undecided";
    if (techSuitability in suitabilityMap) {
      suitabilityMap[techSuitability] += 1;
    } else {
      suitabilityMap.undecided += 1;
    }
  });

  const suitabilityLabels: Record<string, string> = {
    strong: "AI Match: Strong Recommendation",
    medium: "AI Match: Medium Recommendation",
    weak: "AI Match: Weak/Not Recommended",
    undecided: "AI Match: Evaluation Pending",
  };

  const suitabilityChartData = Object.entries(suitabilityMap).map(([key, val]) => ({
    name: suitabilityLabels[key] || key,
    value: val,
    color: SUITABILITY_COLORS[key] || "#94A3B8",
  })).filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* ── Average CGPA by Technical Domain ── */}
      <Card className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-xl">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider">
                Academic Standard
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 dark:text-zinc-500">
                Average CGPA score of applicants by domain
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={cgpaChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-zinc-800" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fontWeight: 600, fill: "currentColor" }}
                className="text-slate-400 dark:text-zinc-500"
              />
              <YAxis
                domain={[0, 10]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fontWeight: 600, fill: "currentColor" }}
                className="text-slate-400 dark:text-zinc-500"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                cursor={{ fill: "rgba(66, 133, 244, 0.05)" }}
              />
              <Bar
                dataKey="Average CGPA"
                fill={CHART_COLORS.blue}
                radius={[8, 8, 0, 0]}
                maxBarSize={45}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Average Interview Evaluation Ratings ── */}
      <Card className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-500 rounded-xl">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider">
                Reviewer Evaluation averages
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 dark:text-zinc-500">
                Average scores out of 10 ({reviewedCount} reviewed applications)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center">
          {reviewedCount > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData}>
                <PolarGrid stroke="#E2E8F0" className="dark:stroke-zinc-800" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor" }}
                  className="text-slate-500 dark:text-zinc-400"
                />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9 }} stroke="#E2E8F0" className="dark:stroke-zinc-800" />
                <Radar
                  name="Average Score"
                  dataKey="Score"
                  stroke={CHART_COLORS.yellow}
                  fill={CHART_COLORS.yellow}
                  fillOpacity={0.25}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center space-y-2 py-12">
              <Activity className="h-8 w-8 text-slate-300 dark:text-zinc-700 mx-auto animate-pulse" />
              <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                No Interview Ratings Yet
              </p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-600 max-w-xs mx-auto leading-relaxed">
                When interviewers evaluate candidates and assign rating stars, this spider/radar graph will map domain-level competency averages.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Talent Tier Distribution Pie Chart ── */}
      <Card className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-green-50 dark:bg-green-950/40 text-green-500 rounded-xl">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider">
                Candidate Talent Tiers
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 dark:text-zinc-500">
                Evaluating candidate strengths based on overall rating splits
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-72 flex flex-col justify-between">
          <div className="flex-1 min-h-0 relative">
            {tierChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={tierChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {tierChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No application data available.
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 border-t border-slate-100 dark:border-zinc-800/80 pt-4 mt-2">
            {tierChartData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-tight">
                  {entry.name.split(" (")[0]}: <span className="text-slate-800 dark:text-slate-200 font-extrabold">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── AI Screening Suitability Donut Chart ── */}
      <Card className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-500 rounded-xl">
              <Brain className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider">
                AI Screening Classification
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 dark:text-zinc-500">
                Resume parsed matching indicators by Gemini engine
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-72 flex flex-col justify-between">
          <div className="flex-1 min-h-0 relative">
            {suitabilityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={suitabilityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {suitabilityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No evaluation metrics found.
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 border-t border-slate-100 dark:border-zinc-800/80 pt-4 mt-2">
            {suitabilityChartData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-tight">
                  {entry.name.split(": ")[1]}: <span className="text-slate-800 dark:text-slate-200 font-extrabold">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
