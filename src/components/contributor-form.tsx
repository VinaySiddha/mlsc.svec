"use client"

import * as React from "react"
import { Form, Field as FormischField, reset, useForm } from "@formisch/react"
import type { SubmitHandler } from "@formisch/react"
import { toast } from "@/hooks/use-toast"
import { submitContributorApplicationAction } from "@/app/actions/contributor-actions"
import * as v from "valibot"

import { Button } from "@/components/ui/button"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, User, Github, Sparkles, Terminal } from "lucide-react"

const ContributorFormSchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(2, "Name must be at least 2 characters."),
    v.maxLength(50, "Name must be at most 50 characters.")
  ),
  email: v.pipe(
    v.string(),
    v.email("Please enter a valid email address.")
  ),
  github: v.pipe(
    v.string(),
    v.maxLength(39, "GitHub username must be at most 39 characters.")
  ),
  department: v.pipe(
    v.string(),
    v.minLength(1, "Please select a department.")
  ),
  skills: v.pipe(
    v.string(),
    v.minLength(3, "Please enter your relevant skills."),
    v.maxLength(100, "Skills list must be at most 100 characters.")
  ),
  message: v.pipe(
    v.string(),
    v.minLength(15, "Please explain why you want to contribute in at least 15 characters."),
    v.maxLength(500, "Message must be at most 500 characters.")
  ),
})

export function ContributorForm() {
  const form = useForm({
    schema: ContributorFormSchema,
    initialInput: {
      name: "",
      email: "",
      github: "",
      department: "Frontend Development",
      skills: "",
      message: "",
    },
  })

  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit: SubmitHandler<typeof ContributorFormSchema> = async (output) => {
    setSubmitting(true)
    try {
      const result = await submitContributorApplicationAction(
        output.name,
        output.email,
        output.github,
        output.department,
        output.skills,
        output.message
      );

      if (result.success) {
        toast.success("Application Submitted Successfully", {
          description: "Thank you! An email notification has been sent to the administrator, and we will review your request.",
        });
        reset(form);
      } else {
        toast.danger("Failed to submit request", {
          description: result.error || "Please try again later.",
        });
      }
    } catch (err: any) {
      const { logClientError } = await import("@/lib/error-logger");
      await logClientError(
        `Failed to submit contributor application for ${output.name}`,
        err,
        "ContributorForm",
        output.email
      );
      toast.danger("An unexpected error occurred", {
        description: err.message || "Please try again later.",
      });
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_#FFE600] text-black p-6 md:p-8 font-sans">
      <div className="pb-6 border-b-2 border-black mb-6">
        <div className="inline-block px-3 py-1 bg-[#FFE600] text-black text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-3">
          [ DEVELOPER REGISTRATION ]
        </div>
        <h2 className="text-2xl font-display font-black tracking-tight text-black uppercase italic flex items-center gap-2">
          <Terminal className="h-6 w-6 text-black stroke-[2.5]" />
          APPLY TO <span className="text-[#4285F4]">CONTRIBUTE</span>
        </h2>
        <p className="text-xs text-zinc-700 font-medium mt-1">
          Interested in helping build MLSC platforms? Fill out the details below. This will notify the engineering lead immediately.
        </p>
      </div>

      <Form of={form} id="contributor-form-formisch" onSubmit={handleSubmit}>
        <FieldGroup className="space-y-5">
          
          {/* Name */}
          <FormischField of={form} path={["name"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="contrib-name" className="text-xs font-black uppercase tracking-wider text-black">
                  Full Name
                </FieldLabel>
                <div className="relative mt-1">
                  <Input
                    {...field.props}
                    id="contrib-name"
                    value={field.input ?? ""}
                    placeholder="Alex Mercer"
                    autoComplete="name"
                    aria-invalid={field.errors !== null}
                    className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black placeholder-zinc-400 focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] transition-all"
                  />
                </div>
                {field.errors && (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                    className="text-red-600 text-[11px] mt-1 font-mono font-bold"
                  />
                )}
              </Field>
            )}
          </FormischField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <FormischField of={form} path={["email"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="contrib-email" className="text-xs font-black uppercase tracking-wider text-black">
                    Email Address
                  </FieldLabel>
                  <div className="relative mt-1">
                    <Input
                      {...field.props}
                      id="contrib-email"
                      type="email"
                      value={field.input ?? ""}
                      placeholder="alex@example.com"
                      autoComplete="email"
                      aria-invalid={field.errors !== null}
                      className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] transition-all"
                    />
                  </div>
                  {field.errors && (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
                      className="text-red-600 text-[11px] mt-1 font-mono font-bold"
                    />
                  )}
                </Field>
              )}
            </FormischField>

            {/* GitHub */}
            <FormischField of={form} path={["github"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="contrib-github" className="text-xs font-black uppercase tracking-wider text-black">
                    GitHub Username
                  </FieldLabel>
                  <div className="relative mt-1">
                    <Input
                      {...field.props}
                      id="contrib-github"
                      value={field.input ?? ""}
                      placeholder="alexmercer"
                      autoComplete="off"
                      aria-invalid={field.errors !== null}
                      className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] transition-all"
                    />
                  </div>
                  {field.errors && (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
                      className="text-red-600 text-[11px] mt-1 font-mono font-bold"
                    />
                  )}
                </Field>
              )}
            </FormischField>
          </div>

          {/* Department Dropdown */}
          <FormischField of={form} path={["department"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="contrib-dept" className="text-xs font-black uppercase tracking-wider text-black">
                  Department of Interest
                </FieldLabel>
                <select
                  {...field.props}
                  id="contrib-dept"
                  value={field.input ?? "Frontend Development"}
                  className="mt-1 flex h-11 w-full border-2 border-black bg-white px-4 py-2 text-xs text-black focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] transition-all cursor-pointer"
                >
                  <option value="Frontend Development" className="bg-white text-black">Frontend Development (Next.js / Tailwind)</option>
                  <option value="Backend Development" className="bg-white text-black">Backend & APIs (Firebase / Cloudflare Workers)</option>
                  <option value="UI UX Design" className="bg-white text-black">UI/UX Design (Figma & Visual Assets)</option>
                  <option value="Technical Operations" className="bg-white text-black">Technical Operations & System Admin</option>
                </select>
                {field.errors && (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                    className="text-red-600 text-[11px] mt-1 font-mono font-bold"
                  />
                )}
              </Field>
            )}
          </FormischField>

          {/* Skills */}
          <FormischField of={form} path={["skills"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="contrib-skills" className="text-xs font-black uppercase tracking-wider text-black">
                  Relevant Skills
                </FieldLabel>
                <div className="relative mt-1">
                  <Input
                    {...field.props}
                    id="contrib-skills"
                    value={field.input ?? ""}
                    placeholder="React, Next.js, TailwindCSS, TypeScript"
                    autoComplete="off"
                    aria-invalid={field.errors !== null}
                    className="bg-white border-2 border-black rounded-none h-11 px-4 text-xs text-black placeholder-zinc-400 focus:border-[#00FF66] focus:shadow-[3px_3px_0px_0px_#00FF66] transition-all"
                  />
                </div>
                {field.errors && (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                    className="text-red-600 text-[11px] mt-1 font-mono font-bold"
                  />
                )}
              </Field>
            )}
          </FormischField>

          {/* Message */}
          <FormischField of={form} path={["message"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="contrib-msg" className="text-xs font-black uppercase tracking-wider text-black">
                  Why do you want to contribute?
                </FieldLabel>
                <div className="mt-1">
                  <textarea
                    {...field.props}
                    id="contrib-msg"
                    value={field.input ?? ""}
                    placeholder="Explain what motivates you to contribute, any ideas you have, or previous projects you've worked on."
                    rows={4}
                    className="w-full bg-white border-2 border-black p-4 text-xs text-black placeholder-zinc-400 focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] transition-all resize-none font-mono"
                    aria-invalid={field.errors !== null}
                  />
                  <div className="text-right text-[10px] font-mono font-bold text-zinc-600 mt-1">
                    {(field.input ?? "").length}/500 characters
                  </div>
                </div>
                {field.errors && (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                    className="text-red-600 text-[11px] mt-1 font-mono font-bold"
                  />
                )}
              </Field>
            )}
          </FormischField>

          <button
            type="submit"
            form="contributor-form-formisch"
            disabled={submitting}
            className="w-full h-12 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50 select-none mt-2 cursor-pointer"
          >
            {submitting ? "SUBMITTING APPLICATION..." : "SUBMIT CONTRIBUTION INTEREST [↗]"}
          </button>

        </FieldGroup>
      </Form>
    </div>
  )
}
