
import { getTeamCategories } from "@/app/actions";
import { TeamCategoriesTable } from "@/components/team-categories-table";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TeamCategoriesPage() {
    const headersList = headers();
    const userRole = headersList.get('X-User-Role');

    if (userRole !== 'admin') {
        redirect('/admin');
    }

    const { categories, error } = await getTeamCategories();

    if (error) {
        return <div>Error loading categories: {error}</div>
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <MLSCLogo className="h-10 w-10 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Team Categories
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button asChild>
                            <Link href="/admin/team/categories/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Category
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/admin/team">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Team
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="container mx-auto space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Team Categories</CardTitle>
                            <CardDescription>
                                Manage the categories used to group team members. The order number determines the display order on the public team page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TeamCategoriesTable categories={categories} />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
