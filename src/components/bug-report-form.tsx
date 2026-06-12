"use client"

import * as React from "react"
import { Form, Field as FormischField, reset, useForm, setInput } from "@formisch/react"
import type { SubmitHandler } from "@formisch/react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { submitBugReportAction } from "@/app/actions/log-actions"
import * as v from "valibot"
import { Mail } from "lucide-react"

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
    v.maxLength(40, "Bug title must be at most 40 characters.")
  ),
  description: v.pipe(
    v.string(),
    v.minLength(15, "Description must be at least 15 characters."),
    v.maxLength(300, "Description must be at most 300 characters.")
  ),
  email: v.pipe(
    v.string(),
    v.email("Please enter a valid email address.")
  ),
  severity: v.pipe(
    v.string(),
    v.minLength(1)
  ),
  category: v.pipe(
    v.string(),
    v.minLength(1)
  ),
})

export function BugReportForm({ isDialog = false, onSuccess }: { isDialog?: boolean; onSuccess?: () => void }) {
  const { user } = useAuth()
  const form = useForm({
    schema: FormSchema,
    initialInput: {
      title: "",
      description: "",
      email: user?.email || "",
      severity: "medium",
      category: "other",
    },
  })

  // Prefill email when user state becomes available
  React.useEffect(() => {
    if (user?.email) {
      setInput(form, { path: ["email"], input: user.email });
    }
  }, [user, form]);

  const handleSubmit: SubmitHandler<typeof FormSchema> = async (output) => {
    try {
      const result = await submitBugReportAction(
        output.title,
        output.description,
        user?.uid,
        user?.displayName || "Anonymous",
        output.email,
        output.severity,
        output.category
      );

      if (result.success) {
        toast.success("Bug Report Submitted Successfully", {
          description: "Thank you! A confirmation email has been sent to you.",
        });
        reset(form);
        if (onSuccess) onSuccess();
      } else {
        toast.danger("Failed to submit bug report", {
          description: result.error || "Please try again later.",
        });
      }
    } catch (err: any) {
      const { logClientError } = await import("@/lib/error-logger");
      await logClientError(
        `Failed to submit bug report: ${output.title}`,
        err,
        "BugReportForm",
        user?.email || output.email || "unknown"
      );
      toast.danger("An unexpected error occurred", {
        description: err.message || "Please try again later.",
      });
    }
  }

  const formBody = (
    <Form of={form} id="form-formisch-demo" onSubmit={handleSubmit}>
      <FieldGroup className="space-y-4">
        {/* Email */}
        {user ? (
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-white/40">Email Address</label>
            <div className="text-xs text-white/60 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 select-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Logged in as: <strong className="text-white font-bold">{user.email}</strong>
            </div>
            <FormischField of={form} path={["email"]}>
              {(field) => (
                <input {...field.props} type="hidden" value={field.input ?? ""} />
              )}
            </FormischField>
          </div>
        ) : (
          <FormischField of={form} path={["email"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="form-bug-email">Email Address</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="block-start">
                    <InputGroupText>
                      <Mail className="h-3.5 w-3.5 text-white/30" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    {...field.props}
                    id="form-bug-email"
                    type="email"
                    value={field.input ?? ""}
                    placeholder="alex@example.com"
                    autoComplete="email"
                    aria-invalid={field.errors !== null}
                  />
                </InputGroup>
                <FieldDescription>We will send update emails to this address.</FieldDescription>
                {field.errors && (
                  <FieldError errors={field.errors.map((message) => ({ message }))} />
                )}
              </Field>
            )}
          </FormischField>
        )}

        {/* Bug Title */}
        <FormischField of={form} path={["title"]}>
          {(field) => (
            <Field data-invalid={field.errors !== null}>
              <FieldLabel htmlFor="form-bug-title">Bug Title</FieldLabel>
              <Input
                {...field.props}
                id="form-bug-title"
                value={field.input ?? ""}
                placeholder="Login button not working on mobile"
                autoComplete="off"
                aria-invalid={field.errors !== null}
              />
              {field.errors && (
                <FieldError errors={field.errors.map((message) => ({ message }))} />
              )}
            </Field>
          )}
        </FormischField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Severity */}
          <FormischField of={form} path={["severity"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="form-bug-severity">Severity Level</FieldLabel>
                <select
                  {...field.props}
                  id="form-bug-severity"
                  value={field.input ?? "medium"}
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-[#0A0A0A] px-4 py-2 text-xs text-white focus:bg-black focus-visible:outline-none focus-visible:border-[#4285F4]/60 focus-visible:ring-1 focus-visible:ring-[#4285F4]/60 transition-all duration-200"
                >
                  <option value="low" className="bg-black text-white">Low (Visual glitch / styling)</option>
                  <option value="medium" className="bg-black text-white">Medium (Functional bug / minor error)</option>
                  <option value="high" className="bg-black text-white">High (Broken page / feature failing)</option>
                  <option value="critical" className="bg-black text-white">Critical (Security breach / crash)</option>
                </select>
                {field.errors && (
                  <FieldError errors={field.errors.map((message) => ({ message }))} />
                )}
              </Field>
            )}
          </FormischField>

          {/* Category */}
          <FormischField of={form} path={["category"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="form-bug-category">Category</FieldLabel>
                <select
                  {...field.props}
                  id="form-bug-category"
                  value={field.input ?? "other"}
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-[#0A0A0A] px-4 py-2 text-xs text-white focus:bg-black focus-visible:outline-none focus-visible:border-[#4285F4]/60 focus-visible:ring-1 focus-visible:ring-[#4285F4]/60 transition-all duration-200"
                >
                  <option value="frontend" className="bg-black text-white">Frontend UI (Next.js/Tailwind)</option>
                  <option value="backend" className="bg-black text-white">Backend & Cloud (Workers/APIs)</option>
                  <option value="ui-ux" className="bg-black text-white">UI/UX Design / Animations</option>
                  <option value="database" className="bg-black text-white">Database & Firestore Storage</option>
                  <option value="auth" className="bg-black text-white">Authentication & Roles</option>
                  <option value="other" className="bg-black text-white">Other Issues</option>
                </select>
                {field.errors && (
                  <FieldError errors={field.errors.map((message) => ({ message }))} />
                )}
              </Field>
            )}
          </FormischField>
        </div>

        {/* Description */}
        <FormischField of={form} path={["description"]}>
          {(field) => (
            <Field data-invalid={field.errors !== null}>
              <FieldLabel htmlFor="form-bug-desc">Description</FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  {...field.props}
                  id="form-bug-desc"
                  value={field.input ?? ""}
                  placeholder="Include steps to reproduce, expected behavior, and what actually happened."
                  rows={4}
                  className="min-h-20 resize-none text-xs"
                  aria-invalid={field.errors !== null}
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="tabular-nums text-[10px]">
                    {(field.input ?? "").length}/300 characters
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {field.errors && (
                <FieldError errors={field.errors.map((message) => ({ message }))} />
              )}
            </Field>
          )}
        </FormischField>
      </FieldGroup>
    </Form>
  )

  if (isDialog) {
    return (
      <div className="space-y-4">
        {formBody}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
          <Button type="button" variant="outline" onClick={() => reset(form)} className="rounded-xl h-9 text-xs">
            Reset
          </Button>
          <Button type="submit" form="form-formisch-demo" className="rounded-xl h-9 bg-[#4285F4] hover:bg-[#4285F4]/95 text-white font-bold text-xs uppercase tracking-wider">
            Submit Ticket
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full bg-[#080808]/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.95)] text-white p-2">
      <CardHeader>
        <CardTitle className="text-xl font-black uppercase tracking-tight italic text-white/95">Report Bug</CardTitle>
        <CardDescription className="text-xs text-zinc-400 font-medium">
          Help us improve our community platforms by reporting issues.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formBody}
      </CardContent>
      <CardFooter className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
        <Button type="button" variant="outline" onClick={() => reset(form)} className="rounded-xl h-9 text-xs">
          Reset
        </Button>
        <Button type="submit" form="form-formisch-demo" className="rounded-xl h-9 bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-wider">
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}
