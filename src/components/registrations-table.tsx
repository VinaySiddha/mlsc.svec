
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "./ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { exportRegistrationsToCsv } from "@/app/actions";

interface RegistrationsTableProps {
    registrations: any[];
    eventId: string;
}

export function RegistrationsTable({ registrations, eventId }: RegistrationsTableProps) {
    const [isExporting, setIsExporting] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await exportRegistrationsToCsv(eventId);
            if (result.error) {
                throw new Error(result.error);
            }
            if (result.csvData) {
                const blob = new Blob([result.csvData], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `event_registrations_${eventId}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast({ title: 'Export Successful', description: 'Registrations have been downloaded as a CSV file.' });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: errorMessage,
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button onClick={handleExport} disabled={isExporting || registrations.length === 0}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            Export as CSV
        </Button>
    );
}
