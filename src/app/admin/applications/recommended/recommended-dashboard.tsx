'use client';

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { logClientError } from "@/lib/error-logger";
import { useAuth } from "@/lib/auth-context";
import { bulkProcessList } from "@/app/actions/application-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Award, Bot, ExternalLink, Sparkles, Star, UserCheck } from "lucide-react";

import { IosLoader } from "@/components/ui/ios-loader";

interface RecommendedDashboardProps {
  initialApplications: any[];
  userRole?: string | null;
}

export function RecommendedDashboard({ initialApplications, userRole }: RecommendedDashboardProps) {
  const isSuperAdmin = userRole === 'super_admin';
  const [applications, setApplications] = useState(initialApplications);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleBulkHire = async () => {
    if (applications.length === 0) return;
    setIsProcessing(true);
    try {
      const ids = applications.map(app => app.id);
      const res = await bulkProcessList(ids, 'Hired');
      
      if (res?.error) throw new Error(res.error);
      
      toast({
        title: "Bulk Hire Successful",
        description: `Successfully hired ${ids.length} candidates.`,
      });
      setApplications([]); // Clear list
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Bulk Action Failed",
        description: err.message,
      });
      await logClientError("Bulk Hire Failed", err, "RecommendedDashboard", user?.email || "unknown");
    } finally {
      setIsProcessing(false);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="py-24 text-center space-y-4">
        <Star className="size-12 mx-auto text-yellow-500/20" />
        <h3 className="text-xl font-bold text-white/50">No Recommended Candidates Pending</h3>
        <p className="text-sm text-white/30">All recommended candidates have been processed or none have been flagged yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {userRole !== 'view_only' && (
        <div className="flex justify-end mb-4">
          <Button onClick={handleBulkHire} disabled={isProcessing} className="bg-[#34A853] hover:bg-[#34A853]/90 text-white font-bold flex items-center gap-2">
            {isProcessing ? (
              <>
                <IosLoader size="xs" color="text-white" />
                <span>Processing...</span>
              </>
            ) : (
              `Hire All ${applications.length} Candidates`
            )}
          </Button>
        </div>
      )}
      
      <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="font-bold text-white/60">Candidate</TableHead>
              <TableHead className="font-bold text-white/60">Domain</TableHead>
              {isSuperAdmin && (
                <TableHead className="font-bold text-purple-400">AI Screening</TableHead>
              )}
              <TableHead className="font-bold text-white/60">Manual Interview</TableHead>
              <TableHead className="font-bold text-white/60 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => {
              const aiScore = app.aiRatings?.overall ?? (app.manualRatings ? (app.aiRatings?.overall ?? 0) : (app.ratings?.overall ?? 0));
              const isAiSelected = app.isAiRecommended !== undefined 
                ? app.isAiRecommended 
                : (app.aiRatings ? (app.aiRatings.overall >= 3.5) : (aiScore >= 3.5 && !app.manualRatings));

              const humanScore = app.manualRatings?.overall ?? ((app.ratings && app.aiRatings && app.ratings.overall !== app.aiRatings.overall) ? app.ratings.overall : (app.interviewAttended && app.status !== 'Received' ? (app.ratings?.overall ?? 0) : 0));
              const hasHumanScore = humanScore > 0;
              const isManualSelected = app.isManualSelected ?? app.isRecommended ?? false;

              return (
                <TableRow key={app.id} className="border-white/10 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                        {isManualSelected && (
                          <span title="Manual Selected">
                            <Award className="size-3.5 text-yellow-500" />
                          </span>
                        )}
                        {isSuperAdmin && isAiSelected && (
                          <span title="AI Selected">
                            <Sparkles className="size-3 text-purple-400" />
                          </span>
                        )}
                        <span>{app.name}</span>
                      </div>
                      <span className="text-xs text-white/40 font-mono">{app.rollNo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#4285F4]/30 text-[#4285F4] bg-[#4285F4]/10">
                      {app.technicalDomain}
                    </Badge>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4285F4]">
                          <Bot className="size-3" />
                          {aiScore > 0 ? `${aiScore.toFixed(1)} / 5` : 'N/A'}
                        </span>
                        {isAiSelected && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-purple-400">
                            AI Selected
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#34A853]">
                        <UserCheck className="size-3" />
                        {hasHumanScore ? `${humanScore.toFixed(1)} / 5` : 'Pending'}
                      </span>
                      {isManualSelected && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-yellow-500">
                          ★ Selected
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-white/60 hover:text-white">
                      <Link href={`/admin/application/${app.id}`}>
                        Review <ExternalLink className="ml-1 size-3" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
