
import { ApplicationForm } from "@/components/application-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default async function ApplyPage() {
  const isClosed = true;

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-foreground">
      <main className="flex-1 py-12 md:py-20">
        {/* Application Form Section */}
        <section id="apply" className="w-full">
          <div className="container mx-auto px-4 md:px-6">
            <Card className="max-w-3xl mx-auto shadow-lg glass-card text-foreground">
              <CardHeader>
                <CardTitle className="text-3xl">Application Form</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {isClosed
                    ? "Submissions are now closed. Thank you for your interest."
                    : "Complete the form to apply for a role at MLSC."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isClosed ? (
                   <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/60 rounded-lg">
                      <Clock className="h-16 w-16 text-primary mb-4" />
                      <h3 className="text-xl font-semibold">Registrations are closed</h3>
                      <p className="text-muted-foreground mt-2">
                        We are no longer accepting applications. Follow us for future announcements.
                      </p>
                    </div>
                ) : (
                   <ApplicationForm />
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

    </div>
  );
}
