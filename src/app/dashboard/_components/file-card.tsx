import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { format, formatDistance, formatRelative, subDays } from "date-fns";

import { Doc, Id } from "../../../../convex/_generated/dataModel";
import {
  Download,
  FileText,
  ImageIcon,
  MoreHorizontal,
  MoreVertical,
  StarIcon,
  Table,
  Trash2,
  Undo,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function FileCardActions({
  file,
  isFavorite,
  isMarkedForDeletion,
}: {
  file: Doc<"files">;
  isFavorite: boolean;
  isMarkedForDeletion: boolean;
}) {
  const [open, setOpen] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const recover = useMutation(api.files.restoreFile);

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
          <Protect role="org:admin">
            <DropdownMenuSeparator />
            {!isMarkedForDeletion ? (
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

function getFileUrl(file: Id<"_storage">) {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${file}`;
}

const FileCard = ({
  file,
  allFavorites,
}: {
  file: Doc<"files">;
  allFavorites: Doc<"favorites">[];
}) => {
  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileText />,
    csv: <Table />,
  } as Record<Doc<"files">["type"], ReactNode>;

  const isFavorite = allFavorites.some(
    (favorite) => favorite.fileId === file._id
  );

  const isMarkedForDeletion = file.shouldDelete ? true : false;

  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2">
          <div className="flex justify-center">{typeIcons[file.type]}</div>
          {file.name}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardActions
            file={file}
            isFavorite={isFavorite}
            isMarkedForDeletion={isMarkedForDeletion}
          />
        </div>
        {/* <CardDescription>Card Description</CardDescription> */}
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {file.type === "image" && (
          <Image
            alt={file.name}
            width={200}
            height={200}
            src={getFileUrl(file.fileId)}
          />
        )}

        {file.type == "pdf" && <FileText className="w-20 h-20" />}
        {file.type == "csv" && <Table className="w-20 h-20" />}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2 text-xs text-gray-700 w-40">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>{userProfile?.name}</AvatarFallback>
          </Avatar>
          {userProfile?.name}
        </div>
        <div className="text-xs text-gray-700 ">
          Uploaded on {formatRelative(new Date(file._creationTime), new Date())}
        </div>
      </CardFooter>
    </Card>
  );
};

export default FileCard;
