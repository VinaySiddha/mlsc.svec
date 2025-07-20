
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { setDeadline } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const deadlineSchema = z.object({
  date: z.date({
    required_error: 'A date for the deadline is required.',
  }),
  hour: z.string({ required_error: 'Please select an hour.' }),
});

type FormValues = z.infer<typeof deadlineSchema>;

export function DeadlineSetter() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(deadlineSchema),
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const deadlineDate = new Date(values.date);
      deadlineDate.setHours(parseInt(values.hour, 10));
      deadlineDate.setMinutes(0);
      deadlineDate.setSeconds(0);

      const result = await setDeadline(deadlineDate);
      if (result.error) throw new Error(result.error);
      
      toast({
        title: 'Deadline Set!',
        description: `The application deadline has been set to ${format(deadlineDate, "PPP 'at' h a")}.`,
      });

    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
       toast({
        variant: "destructive",
        title: "Failed to set deadline",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Application Deadline</CardTitle>
        <CardDescription>
          Choose a date and time to automatically close application submissions. You can update this at any time. The time is based on the server's timezone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deadline Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('w-full sm:w-[240px] pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < today} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline Hour (24h)</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                          <SelectTrigger className="w-full sm:w-[120px]">
                            <SelectValue placeholder="Time" />
                          </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {hours.map(hour => (
                            <SelectItem key={hour} value={hour}>
                                {hour}:00
                            </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set or Update Deadline
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
