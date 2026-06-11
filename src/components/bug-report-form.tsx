"use client"

import * as React from "react"
import { Form, Field as FormischField, reset, useForm } from "@formisch/react"
import type { SubmitHandler } from "@formisch/react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { submitBugReportAction } from "@/app/actions/log-actions"
import * as v from "valibot"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"

const FormSchema = v.object({
  title: v.pipe(
    v.string(),
    v.minLength(5, "Bug title must be at least 5 characters."),
    v.maxLength(32, "Bug title must be at most 32 characters.")
  ),
  description: v.pipe(
    v.string(),
    v.minLength(20, "Description must be at least 20 characters."),
    v.maxLength(100, "Description must be at most 100 characters.")
  ),
})

export function BugReportForm({ isDialog = false, onSuccess }: { isDialog?: boolean; onSuccess?: () => void }) {
  const { user } = useAuth()
  const form = useForm({
    schema: FormSchema,
    initialInput: {
      title: "",
      description: "",
    },
  })

  const handleSubmit: SubmitHandler<typeof FormSchema> = async (output) => {
    try {
      const result = await submitBugReportAction(
        output.title,
        output.description,
        user?.uid,
        user?.displayName || "Anonymous",
        user?.email || ""
      );

      if (result.success) {
        toast.success("Bug Report Submitted Successfully", {
          description: "Thank you! Our technical leads will investigate this issue.",
        });
        reset(form);
        if (onSuccess) onSuccess();
      } else {
        toast.danger("Failed to submit bug report", {
          description: result.error || "Please try again later.",
        });
      }
    } catch (err: any) {
      toast.danger("An unexpected error occurred", {
        description: err.message || "Please try again later.",
      });
    }
  }

  const formBody = (
    <Form of={form} id="form-formisch-demo" onSubmit={handleSubmit}>
      <FieldGroup>
        <FormischField of={form} path={["title"]}>
          {(field) => (
            <Field data-invalid={field.errors !== null}>
              <FieldLabel htmlFor="form-formisch-demo-title">
                Bug Title
              </FieldLabel>
              <Input
                {...field.props}
                id="form-formisch-demo-title"
                value={field.input ?? ""}
                aria-invalid={field.errors !== null}
                placeholder="Login button not working on mobile"
                autoComplete="off"
              />
              {field.errors && (
                <FieldError
                  errors={field.errors.map((message) => ({ message }))}
                />
              )}
            </Field>
          )}
        </FormischField>
        <FormischField of={form} path={["description"]}>
          {(field) => (
            <Field data-invalid={field.errors !== null}>
              <FieldLabel htmlFor="form-formisch-demo-description">
                Description
              </FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  {...field.props}
                  id="form-formisch-demo-description"
                  value={field.input ?? ""}
                  placeholder="I'm having an issue with the login button on mobile."
                  rows={6}
                  className="min-h-24 resize-none"
                  aria-invalid={field.errors !== null}
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="tabular-nums">
                    {(field.input ?? "").length}/100 characters
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>
                Include steps to reproduce, expected behavior, and what
                actually happened.
              </FieldDescription>
              {field.errors && (
                <FieldError
                  errors={field.errors.map((message) => ({ message }))}
                />
              )}
            </Field>
          )}
        </FormischField>
      </FieldGroup>
    </Form>
  );

  if (isDialog) {
    return (
      <div className="space-y-4">
        {formBody}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
          <Button type="button" variant="outline" onClick={() => reset(form)} className="rounded-xl h-9 text-xs">
            Reset
          </Button>
          <Button type="submit" form="form-formisch-demo" className="rounded-xl h-9 bg-[#4285F4] hover:bg-[#4285F4]/95 text-white font-bold text-xs">
            Submit Ticket
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Bug Report</CardTitle>
        <CardDescription>
          Help us improve by reporting bugs you encounter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formBody}
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => reset(form)}>
            Reset
          </Button>
          <Button type="submit" form="form-formisch-demo">
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}

