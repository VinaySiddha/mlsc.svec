'use client';

import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { logClientError } from "@/lib/error-logger";
import { useAuth } from "@/lib/auth-context";
import { bulkProcessList } from "@/app/actions/application-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";

import { IosLoader } from "@/components/ui/ios-loader";

interface RecommendedDashboardProps {
  initialApplications: any[];
}

export function RecommendedDashboard({ initialApplications }: RecommendedDashboardProps) {
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
      
      <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="font-bold text-white/60">Candidate</TableHead>
              <TableHead className="font-bold text-white/60">Domain</TableHead>
              <TableHead className="font-bold text-white/60">Score</TableHead>
              <TableHead className="font-bold text-white/60">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id} className="border-white/10 hover:bg-white/5 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">{app.name}</span>
                    <span className="text-xs text-white/40 font-mono">{app.rollNo}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-[#4285F4]/30 text-[#4285F4] bg-[#4285F4]/10">
                    {app.technicalDomain}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                    <Star className="size-3.5 fill-yellow-500" />
                    {app.ratings?.overall?.toFixed(1) || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-white/60 hover:text-white">
                    <Link href={`/admin/application/${app.id}`}>
                      Review <ExternalLink className="ml-1 size-3" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
