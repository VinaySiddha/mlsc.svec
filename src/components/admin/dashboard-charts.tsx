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
  green: "#00FF66",
  yellow: "#FFE600",
  red: "#FF0055",
  purple: "#8884d8",
  teal: "#00E5FF",
  orange: "#FF9900",
};

const PIE_COLORS = [
  "#00FF66", // Elite
  "#4285F4", // High Potential
  "#FFE600", // Needs Work / Average
  "#E4E4E7", // Pending
];

const SUITABILITY_COLORS: Record<string, string> = {
  strong: "#00FF66",
  medium: "#FFE600",
  weak: "#FF0055",
  undecided: "#E4E4E7",
};

export function DashboardCharts({ applications }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-80 flex items-center justify-center bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000000]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#4285F4]" />
          <span className="text-xs font-black uppercase tracking-wider text-black font-mono">
            Loading Analytics Engine...
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
      subject: "Team Culture Fit",
      Score: reviewedCount > 0 ? parseFloat((totalRatings.teamFit / reviewedCount).toFixed(2)) : 0,
      fullMark: 10,
    },
    {
      subject: "Overall Impact",
      Score: reviewedCount > 0 ? parseFloat((totalRatings.overall / reviewedCount).toFixed(2)) : 0,
      fullMark: 10,
    },
  ];

  // 3. Candidate Tier Breakdown
  let eliteCount = 0;
  let highPotentialCount = 0;
  let needsWorkCount = 0;
  let pendingCount = 0;

  applications.forEach((app) => {
    const overall = app.ratings?.overall || 0;
    if (overall >= 8.5) {
      eliteCount += 1;
    } else if (overall >= 6.5) {
      highPotentialCount += 1;
    } else if (overall > 0) {
      needsWorkCount += 1;
    } else {
      pendingCount += 1;
    }
  });

  const tierChartData = [
    { name: "Tier 1: Elite (8.5 - 10)", value: eliteCount },
    { name: "Tier 2: High Potential (6.5 - 8.4)", value: highPotentialCount },
    { name: "Tier 3: Average (1 - 6.4)", value: needsWorkCount },
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
    color: SUITABILITY_COLORS[key] || "#E4E4E7",
  })).filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* ── Average CGPA by Technical Domain ── */}
      <Card className="bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000000]">
        <CardHeader className="pb-4 border-b-2 border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#4285F4] text-white border-2 border-black rounded-xl shadow-[1px_1px_0px_0px_#000000]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-black uppercase tracking-wider">
                Academic Standard
              </CardTitle>
              <CardDescription className="text-xs text-zinc-600 font-medium">
                Average CGPA score of applicants by domain
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-72 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={cgpaChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#000" }}
              />
              <YAxis
                domain={[0, 10]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#000" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #000000",
                  borderRadius: "10px",
                  color: "#000",
                  fontSize: "12px",
                  fontWeight: "bold",
                  boxShadow: "3px 3px 0px 0px #000000"
                }}
                cursor={{ fill: "rgba(66, 133, 244, 0.1)" }}
              />
              <Bar
                dataKey="Average CGPA"
                fill="#4285F4"
                stroke="#000000"
                strokeWidth={2}
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Average Interview Evaluation Ratings ── */}
      <Card className="bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000000]">
        <CardHeader className="pb-4 border-b-2 border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FFE600] text-black border-2 border-black rounded-xl shadow-[1px_1px_0px_0px_#000000]">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-black uppercase tracking-wider">
                Reviewer Evaluation averages
              </CardTitle>
              <CardDescription className="text-xs text-zinc-600 font-medium">
                Average scores out of 10 ({reviewedCount} reviewed applications)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center pt-2">
          {reviewedCount > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData}>
                <PolarGrid stroke="#000000" strokeWidth={1} strokeOpacity={0.2} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#000" }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9 }} stroke="#A1A1AA" />
                <Radar
                  name="Average Score"
                  dataKey="Score"
                  stroke="#000000"
                  strokeWidth={2}
                  fill="#FFE600"
                  fillOpacity={0.7}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "2px solid #000000",
                    borderRadius: "10px",
                    color: "#000",
                    fontSize: "12px",
                    boxShadow: "3px 3px 0px 0px #000000"
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center space-y-2 py-12">
              <Activity className="h-8 w-8 text-zinc-400 mx-auto animate-pulse" />
              <p className="text-xs font-black text-black uppercase tracking-wider font-mono">
                No Interview Ratings Recorded Yet
              </p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed font-medium">
                When interviewers evaluate candidates, this competency radar will display domain-level strengths.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Talent Tier Distribution Pie Chart ── */}
      <Card className="bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000000]">
        <CardHeader className="pb-4 border-b-2 border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00FF66] text-black border-2 border-black rounded-xl shadow-[1px_1px_0px_0px_#000000]">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-black uppercase tracking-wider">
                Candidate Talent Tiers
              </CardTitle>
              <CardDescription className="text-xs text-zinc-600 font-medium">
                Evaluating strengths based on reviewer scoring tiers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-72 flex flex-col justify-between pt-2">
          <div className="flex-1 min-h-0 relative">
            {tierChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={tierChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#000000"
                    strokeWidth={2}
                  >
                    {tierChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "2px solid #000000",
                      borderRadius: "10px",
                      color: "#000",
                      fontSize: "12px",
                      boxShadow: "3px 3px 0px 0px #000000"
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400 font-bold">
                No application data available.
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 border-t-2 border-black/10 pt-3 mt-2">
            {tierChartData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-black"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-tight">
                  {entry.name.split(" (")[0]}: <span className="text-black font-black">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── AI Screening Suitability Donut Chart ── */}
      <Card className="bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000000]">
        <CardHeader className="pb-4 border-b-2 border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00E5FF] text-black border-2 border-black rounded-xl shadow-[1px_1px_0px_0px_#000000]">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-black uppercase tracking-wider">
                AI Screening Classification
              </CardTitle>
              <CardDescription className="text-xs text-zinc-600 font-medium">
                Resume parsed matching indicators by Gemini engine
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-72 flex flex-col justify-between pt-2">
          <div className="flex-1 min-h-0 relative">
            {suitabilityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={suitabilityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#000000"
                    strokeWidth={2}
                  >
                    {suitabilityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "2px solid #000000",
                      borderRadius: "10px",
                      color: "#000",
                      fontSize: "12px",
                      boxShadow: "3px 3px 0px 0px #000000"
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400 font-bold">
                No evaluation metrics found.
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 border-t-2 border-black/10 pt-3 mt-2">
            {suitabilityChartData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-black"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-tight">
                  {entry.name.split(": ")[1]}: <span className="text-black font-black">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
