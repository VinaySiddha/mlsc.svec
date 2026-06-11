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
          <MessageSquare className="h-5 w-5 text-[#4285F4]" />
          Drop us a <span className="text-[#4285F4]">message.</span>
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400 font-medium">
          Have a query, suggestion, or collaboration idea? Fill out the form and our team will get in touch with you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form of={form} id="contact-form-formisch" onSubmit={handleSubmit}>
          <FieldGroup className="space-y-4">
            <FormischField of={form} path={["name"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="contact-name" className="text-xs font-bold text-zinc-300">Name</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="block-start" className="pl-3 pr-0 py-2">
                      <User className="h-3.5 w-3.5 text-zinc-500" />
                    </InputGroupAddon>
                    <Input
                      {...field.props}
                      id="contact-name"
                      value={field.input ?? ""}
                      aria-invalid={field.errors !== null}
                      placeholder="Your Name"
                      className="bg-transparent border-none text-white placeholder-zinc-650 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10 pl-2"
                      autoComplete="name"
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

            <FormischField of={form} path={["email"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="contact-email" className="text-xs font-bold text-zinc-300">Email</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="block-start" className="pl-3 pr-0 py-2">
                      <Mail className="h-3.5 w-3.5 text-zinc-500" />
                    </InputGroupAddon>
                    <Input
                      {...field.props}
                      id="contact-email"
                      type="email"
                      value={field.input ?? ""}
                      aria-invalid={field.errors !== null}
                      placeholder="your.email@example.com"
                      className="bg-transparent border-none text-white placeholder-zinc-650 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10 pl-2"
                      autoComplete="email"
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

            <FormischField of={form} path={["subject"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="contact-subject" className="text-xs font-bold text-zinc-300">Subject</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="block-start" className="pl-3 pr-0 py-2">
                      <Tag className="h-3.5 w-3.5 text-zinc-500" />
                    </InputGroupAddon>
                    <Input
                      {...field.props}
                      id="contact-subject"
                      value={field.input ?? ""}
                      aria-invalid={field.errors !== null}
                      placeholder="What is this regarding?"
                      className="bg-transparent border-none text-white placeholder-zinc-650 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10 pl-2"
                      autoComplete="off"
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

            <FormischField of={form} path={["message"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="contact-message" className="text-xs font-bold text-zinc-300">Message</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field.props}
                      id="contact-message"
                      value={field.input ?? ""}
                      placeholder="Type your message here..."
                      rows={5}
                      className="min-h-24 resize-none bg-transparent border-none text-white placeholder-zinc-650 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm p-3"
                      aria-invalid={field.errors !== null}
                    />
                    <InputGroupAddon align="block-end" className="pr-3 pb-2">
                      <InputGroupText className="tabular-nums text-[9px] text-zinc-500 font-bold">
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
          </FieldGroup>

          <div className="flex items-center justify-end gap-2 pt-5 mt-4 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => reset(form)}
              className="rounded-xl h-10 px-4 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-xl h-10 px-6 bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}
