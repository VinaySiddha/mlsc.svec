"use client"

import * as React from "react"
import { Form, Field as FormischField, reset, useForm } from "@formisch/react"
import type { SubmitHandler } from "@formisch/react"
import { toast } from "@/hooks/use-toast"
import { submitContactForm } from "@/app/actions/contact-actions"
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
import { Mail, MessageSquare, Tag, User } from "lucide-react"

const ContactFormSchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(2, "Name must be at least 2 characters."),
    v.maxLength(50, "Name must be at most 50 characters.")
  ),
  email: v.pipe(
    v.string(),
    v.email("Please enter a valid email address.")
  ),
  subject: v.pipe(
    v.string(),
    v.minLength(3, "Subject must be at least 3 characters."),
    v.maxLength(64, "Subject must be at most 64 characters.")
  ),
  message: v.pipe(
    v.string(),
    v.minLength(10, "Message must be at least 10 characters."),
    v.maxLength(500, "Message must be at most 500 characters.")
  ),
})

export function ContactForm() {
  const form = useForm({
    schema: ContactFormSchema,
    initialInput: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit: SubmitHandler<typeof ContactFormSchema> = async (output) => {
    setSubmitting(true)
    try {
      const result = await submitContactForm(output);

      if (result.success) {
        toast.success("Message Sent Successfully", {
          description: "Thank you for reaching out! We'll get back to you soon.",
        });
        reset(form);
      } else {
        toast.danger("Failed to send message", {
          description: result.error || "Please try again later.",
        });
      }
    } catch (err: any) {
      const { logClientError } = await import("@/lib/error-logger");
      await logClientError(
        `Failed to submit contact form: ${output.subject}`,
        err,
        "ContactForm",
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
    <div className="w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_#4285F4] p-6 md:p-8 font-sans">
      <div className="pb-6 border-b-2 border-black mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4285F4] text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-3">
          [ 01 // DIRECT MESSAGE ]
        </div>
        <h3 className="text-2xl font-display font-black tracking-tight text-black uppercase italic flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#4285F4] stroke-[2.5]" />
          DROP US A <span className="text-[#4285F4]">MESSAGE.</span>
        </h3>
        <p className="text-xs text-zinc-700 font-medium mt-1">
          Have a query, suggestion, or collaboration idea? Fill out the form and our team will get in touch with you.
        </p>
      </div>
      <div>
        <Form of={form} id="contact-form-formisch" onSubmit={handleSubmit}>
          <FieldGroup className="space-y-4">
            <FormischField of={form} path={["name"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="contact-name" className="text-xs font-black uppercase tracking-wider text-black">Full Name</FieldLabel>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-zinc-500" />
                    </div>
                    <Input
                      {...field.props}
                      id="contact-name"
                      value={field.input ?? ""}
                      aria-invalid={field.errors !== null}
                      placeholder="Enter your name"
                      className="bg-white border-2 border-black text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[4px_4px_0px_0px_#4285F4] text-xs h-11 pl-10 transition-all rounded-none"
                      autoComplete="name"
                    />
                  </div>
                  {field.errors && (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
                    />
                  )}
                </Field>
              )}
            </FormischField>

            <FormischField of={form} path={["email"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="contact-email" className="text-xs font-black uppercase tracking-wider text-black">Email Address</FieldLabel>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-zinc-500" />
                    </div>
                    <Input
                      {...field.props}
                      id="contact-email"
                      type="email"
                      value={field.input ?? ""}
                      aria-invalid={field.errors !== null}
                      placeholder="your.email@example.com"
                      className="bg-white border-2 border-black text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[4px_4px_0px_0px_#4285F4] text-xs h-11 pl-10 transition-all rounded-none"
                      autoComplete="email"
                    />
                  </div>
                  {field.errors && (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
                    />
                  )}
                </Field>
              )}
            </FormischField>

            <FormischField of={form} path={["subject"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="contact-subject" className="text-xs font-black uppercase tracking-wider text-black">Subject</FieldLabel>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Tag className="h-4 w-4 text-zinc-500" />
                    </div>
                    <Input
                      {...field.props}
                      id="contact-subject"
                      value={field.input ?? ""}
                      aria-invalid={field.errors !== null}
                      placeholder="What is this regarding?"
                      className="bg-white border-2 border-black text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[4px_4px_0px_0px_#4285F4] text-xs h-11 pl-10 transition-all rounded-none"
                      autoComplete="off"
                    />
                  </div>
                  {field.errors && (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
                    />
                  )}
                </Field>
              )}
            </FormischField>

            <FormischField of={form} path={["message"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="contact-message" className="text-xs font-black uppercase tracking-wider text-black">Message</FieldLabel>
                  <div className="relative mt-1">
                    <textarea
                      {...field.props}
                      id="contact-message"
                      value={field.input ?? ""}
                      placeholder="Type your message here..."
                      rows={5}
                      className="w-full min-h-28 resize-none bg-white border-2 border-black text-black placeholder-zinc-400 focus:border-[#4285F4] focus:shadow-[4px_4px_0px_0px_#4285F4] text-xs p-3 transition-all rounded-none outline-none"
                      aria-invalid={field.errors !== null}
                    />
                    <div className="text-right pr-2 pb-1">
                      <span className="tabular-nums text-[10px] text-zinc-600 font-bold">
                        {(field.input ?? "").length}/500 characters
                      </span>
                    </div>
                  </div>
                  {field.errors && (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
                    />
                  )}
                </Field>
              )}
            </FormischField>
          </FieldGroup>

          <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={() => reset(form)}
              className="px-4 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-600 hover:text-black border-2 border-transparent hover:border-black transition-all cursor-pointer"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? "SENDING..." : "SEND MESSAGE [↗]"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}
