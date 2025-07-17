'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getApplicationById } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from './ui/badge';

const formSchema = z.object({
  referenceId: z.string().min(1, 'Please enter your reference ID.'),
});

type FormValues = z.infer<typeof formSchema>;

interface ApplicationStatus {
  status: string;
  name: string;
  submittedAt: string;
}

const getStatusVariant = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'accepted':
      return 'default';
    case 'rejected':
      return 'destructive';
    case 'under review':
    case 'interviewing':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function StatusCheckForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { referenceId: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);
    setApplicationStatus(null);
    try {
      const application = await getApplicationById(values.referenceId.trim());
      if (application) {
        setApplicationStatus({
          status: application.status,
          name: application.name,
          submittedAt: application.submittedAt,
        });
      } else {
        setError('No application found with that reference ID. Please double-check and try again.');
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="referenceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference ID</FormLabel>
                <FormControl>
                  <Input placeholder="MLSC-XXXXXX-XXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Check Status'}
          </Button>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {applicationStatus && (
        <Alert className="mt-6">
          <AlertTitle className="flex justify-between items-center">
            <span>Status for {applicationStatus.name}</span>
            <Badge variant={getStatusVariant(applicationStatus.status)}>{applicationStatus.status}</Badge>
          </AlertTitle>
          <AlertDescription>
            Your application is currently: <strong>{applicationStatus.status}</strong>.
            <p className="text-xs text-muted-foreground mt-2">
              Submitted on {new Date(applicationStatus.submittedAt).toLocaleDateString()}
            </p>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
