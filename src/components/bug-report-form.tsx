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

        {/* Image/Screenshot Upload */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/70 block">Screenshot / Image (Optional)</label>
          
          {imageUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-white/5 bg-[#0D0D0D] p-2 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black border border-white/5 flex items-center justify-center shrink-0">
                  <img src={imageUrl} alt="Uploaded bug screenshot" className="object-cover w-full h-full" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/75 font-semibold truncate">Screenshot uploaded</p>
                  <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Uploaded successfully
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleImageDelete}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/50 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all mr-2"
                title="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : isUploading ? (
            <div className="rounded-xl border border-white/5 bg-[#0D0D0D] p-4 flex flex-col items-center justify-center gap-2 text-center">
              <Loader2 className="h-5 w-5 text-[#4285F4] animate-spin" />
              <p className="text-xs text-white/70 font-semibold">Uploading screenshot... {uploadProgress}%</p>
              <div className="w-full max-w-[200px] h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#4285F4] transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl border border-dashed border-white/10 hover:border-white/20 bg-[#0D0D0D] hover:bg-[#111]/50 p-4 transition-all duration-300">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white/40">
                  <Upload className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-white/75 font-semibold">Click to upload screenshot</p>
                  <p className="text-[10px] text-white/30 mt-0.5">PNG, JPG or WEBP (Max 5MB)</p>
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
    <Card className="w-full bg-[#0A0A0A] border border-white/5 backdrop-blur-xl rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.95)] text-white p-2">
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
