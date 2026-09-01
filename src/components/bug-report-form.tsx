"use client"

import * as React from "react"
import { Form, Field as FormischField, reset, useForm, setInput } from "@formisch/react"
import type { SubmitHandler } from "@formisch/react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { submitBugReportAction } from "@/app/actions/log-actions"
import * as v from "valibot"
import { Mail, Image as ImageIcon, Upload, Trash2, X, Loader2 } from "lucide-react"
import { storage } from "@/lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"

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
  const [imageUrl, setImageUrl] = React.useState("")
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.danger("Invalid file type", { description: "Please upload an image file (PNG, JPG, WEBP, etc.)" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.danger("File too large", { description: "Image size must be less than 5MB." });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const fileId = Math.random().toString(36).substring(2, 10);
    const storageRef = ref(storage, `bug-reports/${fileId}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        setIsUploading(false);
        toast.danger("Upload failed", { description: error.message });
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(downloadUrl);
          setIsUploading(false);
          toast.success("Image uploaded!");
        } catch (err: any) {
          console.error("Failed to get download URL:", err);
          setIsUploading(false);
          toast.danger("Upload failed", { description: "Could not retrieve file URL." });
        }
      }
    );
  };

  const handleImageDelete = async () => {
    if (!imageUrl) return;
    try {
      const fileRef = ref(storage, imageUrl);
      await deleteObject(fileRef);
      setImageUrl("");
      toast.success("Image removed");
    } catch (err: any) {
      console.error("Delete failed:", err);
      setImageUrl("");
    }
  };

  const handleSubmit: SubmitHandler<typeof FormSchema> = async (output) => {
    setIsSubmitting(true);
    try {
      const result = await submitBugReportAction(
        output.title,
        output.description,
        user?.uid,
        user?.displayName || "Anonymous",
        output.email,
        output.severity,
        output.category,
        imageUrl
      );

      if (result.success) {
        toast.success("Bug Report Submitted Successfully", {
          description: "Thank you! A confirmation email has been sent to you.",
        });
        reset(form);
        setImageUrl("");
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
    } finally {
      setIsSubmitting(false);
    }
  }

  const formBody = (
    <Form of={form} id="form-bug-report" onSubmit={handleSubmit} className="w-full">
      <FieldGroup className="gap-3.5 space-y-0">
        {/* Email */}
        {user ? (
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Email Address</label>
            <div className="text-xs text-white/80 bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 select-none flex items-center justify-between gap-2">
              <span className="truncate font-medium">{user.email}</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified
              </span>
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
              <Field data-invalid={field.errors !== null} className="gap-1">
                <FieldLabel htmlFor="form-bug-email" className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                  Email Address
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="block-start">
                    <InputGroupText>
                      <Mail className="h-3.5 w-3.5 text-white/40" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    {...field.props}
                    id="form-bug-email"
                    type="email"
                    value={field.input ?? ""}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="h-10 text-xs"
                    aria-invalid={field.errors !== null}
                  />
                </InputGroup>
                <FieldDescription className="text-[10px] text-white/40 mt-0.5">We'll send status updates to this email address.</FieldDescription>
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
            <Field data-invalid={field.errors !== null} className="gap-1">
              <FieldLabel htmlFor="form-bug-title" className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                Bug Title
              </FieldLabel>
              <Input
                {...field.props}
                id="form-bug-title"
                value={field.input ?? ""}
                placeholder="e.g. Navigation menu closes unexpectedly"
                autoComplete="off"
                className="h-10 text-xs"
                aria-invalid={field.errors !== null}
              />
              {field.errors && (
                <FieldError errors={field.errors.map((message) => ({ message }))} />
              )}
            </Field>
          )}
        </FormischField>

        {/* Severity & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Severity */}
          <FormischField of={form} path={["severity"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null} className="gap-1">
                <FieldLabel htmlFor="form-bug-severity" className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                  Severity Level
                </FieldLabel>
                <select
                  {...field.props}
                  id="form-bug-severity"
                  value={field.input ?? "medium"}
                  className="flex h-10 w-full rounded-xl border border-white/10 bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:bg-black focus-visible:outline-none focus-visible:border-[#4285F4]/60 focus-visible:ring-1 focus-visible:ring-[#4285F4]/60 transition-all duration-200"
                >
                  <option value="low" className="bg-black text-white">Low (Visual / Minor styling)</option>
                  <option value="medium" className="bg-black text-white">Medium (Functional glitch)</option>
                  <option value="high" className="bg-black text-white">High (Broken feature)</option>
                  <option value="critical" className="bg-black text-white">Critical (Crash / Security)</option>
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
              <Field data-invalid={field.errors !== null} className="gap-1">
                <FieldLabel htmlFor="form-bug-category" className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                  Category
                </FieldLabel>
                <select
                  {...field.props}
                  id="form-bug-category"
                  value={field.input ?? "other"}
                  className="flex h-10 w-full rounded-xl border border-white/10 bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:bg-black focus-visible:outline-none focus-visible:border-[#4285F4]/60 focus-visible:ring-1 focus-visible:ring-[#4285F4]/60 transition-all duration-200"
                >
                  <option value="frontend" className="bg-black text-white">Frontend UI (Web/App)</option>
                  <option value="backend" className="bg-black text-white">Backend & APIs</option>
                  <option value="ui-ux" className="bg-black text-white">UI/UX & Animations</option>
                  <option value="database" className="bg-black text-white">Database & Sync</option>
                  <option value="auth" className="bg-black text-white">Authentication & Roles</option>
                  <option value="other" className="bg-black text-white">General / Other</option>
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
            <Field data-invalid={field.errors !== null} className="gap-1">
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="form-bug-desc" className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                  Description
                </FieldLabel>
                <span className="text-[10px] tabular-nums text-white/40">
                  {(field.input ?? "").length}/300
                </span>
              </div>
              <InputGroup>
                <InputGroupTextarea
                  {...field.props}
                  id="form-bug-desc"
                  value={field.input ?? ""}
                  placeholder="Steps to reproduce, expected behavior, and what occurred..."
                  rows={3}
                  className="min-h-[72px] max-h-[140px] resize-y text-xs py-2"
                  aria-invalid={field.errors !== null}
                />
              </InputGroup>
              {field.errors && (
                <FieldError errors={field.errors.map((message) => ({ message }))} />
              )}
            </Field>
          )}
        </FormischField>

        {/* Image/Screenshot Upload */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/60 block">Screenshot (Optional)</label>
          
          {imageUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0D0D0D] p-2 flex items-center justify-between group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black border border-white/10 flex items-center justify-center shrink-0">
                  <img src={imageUrl} alt="Uploaded bug screenshot" className="object-cover w-full h-full" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/90 font-medium truncate">Screenshot attached</p>
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Uploaded ready
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleImageDelete}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/15 text-white/50 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all shrink-0"
                title="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : isUploading ? (
            <div className="rounded-xl border border-white/10 bg-[#0D0D0D] p-3 flex flex-col items-center justify-center gap-1.5 text-center">
              <Loader2 className="h-4 w-4 text-[#4285F4] animate-spin" />
              <p className="text-xs text-white/80 font-medium">Uploading image... {uploadProgress}%</p>
              <div className="w-full max-w-[180px] h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#4285F4] transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl border border-dashed border-white/15 hover:border-white/30 bg-[#0D0D0D]/80 hover:bg-[#111] p-3 transition-all duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center justify-center gap-2.5 text-center py-1">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 shrink-0">
                  <Upload className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-white/80 font-medium">Click or drop screenshot</p>
                  <p className="text-[10px] text-white/40">PNG, JPG, WEBP (Max 5MB)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </FieldGroup>
    </Form>
  )

  if (isDialog) {
    return (
      <div className="space-y-4 w-full">
        {formBody}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset(form)}
            disabled={isSubmitting || isUploading}
            className="rounded-xl h-9 text-xs px-4 border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="form-bug-report"
            disabled={isSubmitting || isUploading}
            className="rounded-xl h-9 bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-xs uppercase tracking-wider px-5 shadow-lg shadow-[#4285F4]/20 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Ticket"
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-xl mx-auto bg-[#0A0A0A] border border-white/10 backdrop-blur-xl rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.95)] text-white p-2 sm:p-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-black uppercase tracking-tight italic text-white/95">Report Bug</CardTitle>
        <CardDescription className="text-xs text-zinc-400 font-medium">
          Help us improve our community platforms by reporting issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        {formBody}
      </CardContent>
      <CardFooter className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset(form)}
          disabled={isSubmitting || isUploading}
          className="rounded-xl h-9 text-xs px-4 border-white/10 text-white/70 hover:text-white hover:bg-white/5"
        >
          Reset
        </Button>
        <Button
          type="submit"
          form="form-bug-report"
          disabled={isSubmitting || isUploading}
          className="rounded-xl h-9 bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-wider px-5 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
