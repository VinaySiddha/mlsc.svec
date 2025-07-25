
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "./ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteTeamCategory } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";


interface TeamCategoriesTableProps {
    categories: any[];
}

export function TeamCategoriesTable({ categories }: TeamCategoriesTableProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async (categoryId: string) => {
        setIsDeleting(true);
        try {
            const result = await deleteTeamCategory(categoryId);
            if (result.error) {
                throw new Error(result.error);
            }
            toast({
                title: "Category Deleted",
                description: "The category has been successfully deleted.",
            });
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: errorMessage,
            });
        } finally {
            setIsDeleting(false);
        }
    }

    const getTypeVariant = (type: string) => {
        switch (type) {
            case 'Core Team': return 'default';
            case 'Technical Team': return 'secondary';
            case 'Non-Technical Team': return 'outline';
            default: return 'secondary';
        }
    }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sub-Domain Name</TableHead>
            <TableHead>Main Category</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length > 0 ? (
            categories.map((category: any) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                        {category.subDomain}
                  </TableCell>
                  <TableCell>
                      <Badge variant={getTypeVariant(category.name)}>{category.name || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>{category.order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                         <Button asChild variant="outline" size="icon">
                           <Link href={`/admin/team/categories/edit/${category.id}`}>
                               <Pencil className="h-4 w-4" />
                               <span className="sr-only">Edit Category</span>
                           </Link>
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    <span className="sr-only">Delete Category</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the category.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(category.id)} disabled={isDeleting}>
                                    {isDeleting ? "Deleting..." : "Continue"}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )
            )
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                No categories found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
