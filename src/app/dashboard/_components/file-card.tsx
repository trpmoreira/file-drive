import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRelative } from "date-fns";

import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { FileText, ImageIcon, Table } from "lucide-react";
import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileAactions, getFileUrl } from "./actions-file";

const FileCard = ({
  file,
}: {
  file: Doc<"files"> & { isFavorited: boolean };
}) => {
  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileText />,
    csv: <Table />,
  } as Record<Doc<"files">["type"], ReactNode>;

  const isMarkedForDeletion = file.shouldDelete ? true : false;

  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 text-base font-normal">
          <div className="flex justify-center ">{typeIcons[file.type]}</div>
          {file.name}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileAactions file={file} isFavorite={file.isFavorited} />
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
