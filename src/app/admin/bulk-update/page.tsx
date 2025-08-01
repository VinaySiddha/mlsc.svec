
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { bulkUpdateFromCsv } from '@/app/actions';
import { MLSCLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, UploadCloud, FileCheck2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  csvFile: z
    .any()
    .refine((files) => files?.length === 1, 'CSV file is required.')
    .refine((files) => files?.[0]?.type === 'text/csv', 'File must be a CSV.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function BulkUpdatePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    const file = values.csvFile[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const requiredColumns = ['rollNo'];
        const headers = results.meta.fields || [];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
          toast({
            variant: 'destructive',
            title: 'Invalid CSV Format',
            description: `The CSV file is missing required columns: ${missingColumns.join(', ')}.`,
          });
          setIsSubmitting(false);
          return;
        }

        try {
          const result = await bulkUpdateFromCsv(results.data as { rollNo: string }[]);
          if (result.error) {
            throw new Error(result.error);
          }
          toast({
            title: 'Bulk Update Started',
            description: `${result.updatedCount} applications are being updated. Emails will be sent in the background.`,
          });
          form.reset();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
          toast({
            variant: 'destructive',
            title: 'Bulk Update Failed',
            description: errorMessage,
          });
        } finally {
          setIsSubmitting(false);
        }
      },
      error: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'CSV Parsing Error',
          description: error.message,
        });
        setIsSubmitting(false);
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-20">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-4">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Bulk Status Update
            </h1>
          </Link>
          <Button asChild variant="glass">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto space-y-8">
          <Card className="max-w-2xl mx-auto glass-card">
            <CardHeader>
              <CardTitle>Upload Hired Candidates CSV</CardTitle>
              <CardDescription>
                Upload a CSV file with the roll numbers of hired candidates. All candidates in the file will be marked as &quot;Hired,&quot; and all other pending applicants will be marked as &quot;Rejected.&quot;
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Instructions</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>The CSV file must contain a column named `rollNo`.</li>
                    <li>This action is irreversible and will trigger emails to all updated applicants.</li>
                    <li>Only applicants with a status like &apos;Received&apos;, &apos;Interviewing&apos;, etc., will be updated to &apos;Rejected&apos;.</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="csvFile" className="block text-sm font-medium mb-2">
                    CSV File
                  </label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    {...form.register('csvFile')}
                    className="file:text-foreground"
                  />
                  {form.formState.errors.csvFile && (
                    <p className="text-sm font-medium text-destructive mt-2">
                      {form.formState.errors.csvFile.message as string}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="mr-2 h-4 w-4" />
                      Process File and Update Statuses
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
