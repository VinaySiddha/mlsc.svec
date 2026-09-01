
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
    <div className="font-sans text-black">
      <div className="mb-6 border-b-2 border-black pb-4">
        <h2 className="text-xl font-black uppercase font-display text-black">Set Application Deadline</h2>
        <p className="text-xs text-zinc-600 font-bold mt-1">
          Choose a date and time to automatically close application submissions. You can update this at any time. The time is based on the server's timezone.
        </p>
      </div>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Deadline Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn('w-full sm:w-[240px] pl-3 text-left font-bold text-xs border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000000]', !field.value && 'text-zinc-450')}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-4 border-black shadow-[10px_10px_0px_0px_#000000] bg-white" align="start">
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
                    <FormLabel className="text-xs font-black uppercase tracking-wider text-black">Deadline Hour (24h)</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                          <SelectTrigger className="w-full sm:w-[130px] border-2 border-black bg-white text-xs font-bold shadow-[2px_2px_0px_0px_#000000]">
                            <SelectValue placeholder="Time" />
                          </SelectTrigger>
                       </FormControl>
                       <SelectContent className="border-4 border-black shadow-[8px_8px_0px_0px_#000000] bg-white">
                         {hours.map(hour => (
                            <SelectItem key={hour} value={hour} className="font-bold text-xs">
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
            <Button type="submit" className="bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] px-6 h-11" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set or Update Deadline
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
