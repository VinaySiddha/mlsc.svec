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
    <Card className="w-full bg-[#080808]/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.95)] text-white p-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-black tracking-tight text-white uppercase italic flex items-center gap-2">
          <Terminal className="h-5 w-5 text-indigo-500" />
          Apply to <span className="text-[#4285F4]">Contribute</span>
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400 font-medium">
          Interested in helping build MLSC platforms? Fill out the details below. This will send an email and notify the admin immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form of={form} id="contributor-form-formisch" onSubmit={handleSubmit}>
          <FieldGroup className="space-y-4">
            
            {/* Name */}
            <FormischField of={form} path={["name"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="contrib-name">Full Name</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="block-start">
                      <InputGroupText>
                        <User className="h-3.5 w-3.5 text-white/30" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      {...field.props}
                      id="contrib-name"
                      value={field.input ?? ""}
                      placeholder="Alex Mercer"
                      autoComplete="name"
                      aria-invalid={field.errors !== null}
                    />
                  </InputGroup>
                  {field.errors && (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
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
                    <FieldLabel htmlFor="contrib-email">Email Address</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="block-start">
                        <InputGroupText>
                          <Mail className="h-3.5 w-3.5 text-white/30" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        {...field.props}
                        id="contrib-email"
                        type="email"
                        value={field.input ?? ""}
                        placeholder="alex@example.com"
                        autoComplete="email"
                        aria-invalid={field.errors !== null}
                      />
                    </InputGroup>
                    {field.errors && (
                      <FieldError
                        errors={field.errors.map((message) => ({ message }))}
                      />
                    )}
                  </Field>
                )}
              </FormischField>

              {/* GitHub */}
              <FormischField of={form} path={["github"]}>
                {(field) => (
                  <Field data-invalid={field.errors !== null}>
                    <FieldLabel htmlFor="contrib-github">GitHub Username</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="block-start">
                        <InputGroupText>
                          <Github className="h-3.5 w-3.5 text-white/30" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        {...field.props}
                        id="contrib-github"
                        value={field.input ?? ""}
                        placeholder="alexmercer"
                        autoComplete="off"
                        aria-invalid={field.errors !== null}
                      />
                    </InputGroup>
                    {field.errors && (
                      <FieldError
                        errors={field.errors.map((message) => ({ message }))}
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
                  <FieldLabel htmlFor="contrib-dept">Department of Interest</FieldLabel>
                  <select
                    {...field.props}
                    id="contrib-dept"
                    value={field.input ?? "Frontend Development"}
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-[#0A0A0A] px-4 py-2 text-xs text-white focus:bg-black focus-visible:outline-none focus-visible:border-[#4285F4]/60 focus-visible:ring-1 focus-visible:ring-[#4285F4]/60 transition-all duration-200"
                  >
                    <option value="Frontend Development" className="bg-black text-white">Frontend Development (Next.js / Tailwind)</option>
                    <option value="Backend Development" className="bg-black text-white">Backend & APIs (Firebase / Cloudflare Workers)</option>
                    <option value="UI UX Design" className="bg-black text-white">UI/UX Design (Figma & Visual Assets)</option>
                    <option value="Technical Operations" className="bg-black text-white">Technical Operations & System Admin</option>
                  </select>
                  {field.errors && (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
                    />
                  )}
                </Field>
              )}
            </FormischField>

            {/* Skills */}
            <FormischField of={form} path={["skills"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="contrib-skills">Relevant Skills</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="block-start">
                      <InputGroupText>
                        <Sparkles className="h-3.5 w-3.5 text-white/30" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      {...field.props}
                      id="contrib-skills"
                      value={field.input ?? ""}
                      placeholder="React, Next.js, TailwindCSS, TypeScript"
                      autoComplete="off"
                      aria-invalid={field.errors !== null}
                    />
                  </InputGroup>
                  {field.errors && (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
                    />
                  )}
                </Field>
              )}
            </FormischField>

            {/* Message */}
            <FormischField of={form} path={["message"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="contrib-msg">Why do you want to contribute?</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field.props}
                      id="contrib-msg"
                      value={field.input ?? ""}
                      placeholder="Explain what motivates you to contribute, any ideas you have, or previous projects you've worked on."
                      rows={4}
                      className="min-h-20 resize-none text-xs"
                      aria-invalid={field.errors !== null}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums text-[10px]">
                        {(field.input ?? "").length}/500 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {field.errors && (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
                    />
                  )}
                </Field>
              )}
            </FormischField>

            <Button
              type="submit"
              form="contributor-form-formisch"
              disabled={submitting}
              className="w-full rounded-xl bg-white text-black font-black hover:bg-white/95 h-11 text-xs tracking-wider uppercase transition-transform active:scale-[0.98] mt-2 select-none"
            >
              {submitting ? "Submitting Application..." : "Submit Contribution Interest"}
            </Button>

          </FieldGroup>
        </Form>
      </CardContent>
    </Card>
  )
}
