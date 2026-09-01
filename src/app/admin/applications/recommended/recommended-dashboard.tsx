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
      <div className="py-24 text-center border-4 border-dashed border-zinc-300 bg-zinc-50 space-y-4">
        <Star className="size-12 mx-auto text-yellow-500 fill-yellow-400" />
        <h3 className="text-xl font-black text-black uppercase font-display">No Recommended Candidates Pending</h3>
        <p className="text-xs font-bold text-zinc-600 max-w-sm mx-auto">All recommended candidates have been processed or none have been flagged yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-black">
      <div className="flex justify-end mb-4">
        <Button onClick={handleBulkHire} disabled={isProcessing} className="bg-[#00FF66] hover:bg-[#00dd55] text-black font-black uppercase tracking-wider text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center gap-2 cursor-pointer rounded-none h-11 px-6">
          {isProcessing ? (
            <>
              <IosLoader size="xs" color="text-black" />
              <span>Processing...</span>
            </>
          ) : (
            `Hire All ${applications.length} Candidates`
          )}
        </Button>
      </div>
      
      <div className="border-2 border-black bg-white overflow-x-auto shadow-[4px_4px_0px_0px_#000000]">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black bg-[#FFE600] hover:bg-[#FFE600]">
              <TableHead className="font-black text-black uppercase text-xs">Candidate</TableHead>
              <TableHead className="font-black text-black uppercase text-xs">Domain</TableHead>
              <TableHead className="font-black text-black uppercase text-xs">Score</TableHead>
              <TableHead className="font-black text-black uppercase text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y-2 divide-black">
            {applications.map((app) => (
              <TableRow key={app.id} className="hover:bg-zinc-50 transition-colors">
                <TableCell className="py-3.5">
                  <div className="flex flex-col">
                    <span className="font-black text-black text-sm">{app.name}</span>
                    <span className="text-xs text-zinc-600 font-mono font-bold">{app.rollNo}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <Badge variant="outline" className="border-2 border-black text-black bg-[#4285F4]/20 font-black text-[10px] uppercase rounded-none">
                    {app.technicalDomain}
                  </Badge>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-1 text-black font-black text-sm">
                    <Star className="size-4 fill-yellow-400 stroke-black stroke-[1.5]" />
                    {app.ratings?.overall?.toFixed(1) || "N/A"}
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-black uppercase text-black border border-black bg-white hover:bg-zinc-100 shadow-[1px_1px_0px_0px_#000000] cursor-pointer rounded-none">
                    <Link href={`/admin/application/${app.id}`}>
                      Review <ExternalLink className="ml-1 size-3 stroke-[2.5]" />
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
