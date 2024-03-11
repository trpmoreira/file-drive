import { useState } from "react";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, MoreVertical, StarIcon, Trash2, Undo } from "lucide-react";
import { Protect } from "@clerk/nextjs";
import { getMe } from "../../../../convex/users";

export function FileAactions({
  file,
  isFavorite,
}: {
  file: Doc<"files">;
  isFavorite: boolean;
}) {
  const [open, setOpen] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const recover = useMutation(api.files.restoreFile);
  const me = useQuery(api.users.getMe);

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark this file for deletion. After you mark it,
              if you need it back you will have to contact your organization
              Admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-700"
              onClick={async () => {
                try {
                  await deleteFile({ fileId: file._id });

                  toast({
                    variant: "destructive",
                    title: "File Marked for deletion",
                    description:
                      "Your file has been marked for deletion, and it will be deleted soon, it this was a mistake contact your organizadion Admin.",
                  });
                } catch (error) {
                  toast({
                    variant: "default",
                    title: "Something went wrong",
                    description:
                      "Your file could not be deleted. Please try again.",
                  });
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex gap-2 items-center cursor-pointer"
            onClick={() => {
              window.open(getFileUrl(file.fileId), "_blank");
            }}
          >
            <div className="flex gap-1 items-center">
              <Download className="w-4 h-4 " />
              <span>Download</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex gap-2 items-center cursor-pointer"
            onClick={() => {
              toggleFavorite({ fileId: file._id });
            }}
          >
            {isFavorite ? (
              <div className="flex gap-1 items-center">
                <StarIcon className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-600">Unfavorite</span>
              </div>
            ) : (
              <div className="flex gap-1 items-center">
                <StarIcon className="w-4 h-4" />
                <span>Favorite</span>
              </div>
            )}
          </DropdownMenuItem>
          <Protect
            condition={(check) => {
              return (
                check({
                  role: "org:admin",
                }) || file.userId === me?._id
              );
            }}
          >
            <DropdownMenuSeparator />
            {!file.shouldDelete ? (
              <DropdownMenuItem
                className="flex gap-1 text-red-500 items-center cursor-pointer"
                onClick={() => setOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="flex gap-1 text-green-500 items-center cursor-pointer"
                onClick={async () => {
                  try {
                    await recover({ fileId: file._id });

                    toast({
                      variant: "success",
                      title: "File Recovered",
                      description: "Your file has been recovered.",
                    });
                  } catch (error) {
                    toast({
                      variant: "default",
                      title: "Something went wrong",
                      description:
                        "Your file could not be deleted. Please try again.",
                    });
                  }
                }}
              >
                <Undo className="w-4 h-4" />
                Recover
              </DropdownMenuItem>
            )}
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function getFileUrl(file: Id<"_storage">) {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${file}`;
}
