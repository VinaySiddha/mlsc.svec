
import { getTeamCategoryById } from "@/app/actions";
import { TeamCategoryForm } from "@/components/team-category-form";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditTeamCategoryPage({ params }: { params: { id: string } }) {
    const headersList = headers();
    const userRole = headersList.get('X-User-Role');

    if (userRole !== 'admin') {
        redirect('/admin');
    }

    const { category, error } = await getTeamCategoryById(params.id);

    if (error || !category) {
        notFound();
    }

    return (
         <div className="flex flex-col min-h-screen">
            <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <MLSCLogo className="h-10 w-10 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Edit Category
                        </h1>
                    </div>
                     <Button asChild variant="glass">
                        <Link href="/admin/team/categories">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="container mx-auto">
                     <Card className="max-w-xl mx-auto glass-card">
                        <CardHeader>
                            <CardTitle>Edit Category Details</CardTitle>
                            <CardDescription>
                                Update the details for the category below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TeamCategoryForm category={category as any} />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
