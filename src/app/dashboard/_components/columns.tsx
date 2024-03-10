"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { formatRelative } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { FileAactions } from "./actions-file";

function UserCell({ userId }: { userId: Id<"users"> }) {
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: userId,
  });
  return (
    <div className="flex gap-2 items-center">
      <Avatar className="w-6 h-6">
        <AvatarImage src={userProfile?.image} />
        <AvatarFallback>{userProfile?.name}</AvatarFallback>
      </Avatar>
      <div>{userProfile?.name}</div>
    </div>
  );
}

export const columns: ColumnDef<Doc<"files"> & { isFavorited: boolean }>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "userId",
    header: "User",
    cell: ({ row }) => {
      return <UserCell userId={row.getValue("userId")} />;
    },
  },

  {
    accessorKey: "_creationTime",
    header: "Uploaded At",
    cell: ({ row }) => {
      const formatted = formatRelative(
        new Date(row.getValue("_creationTime")),
        new Date()
      );

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <FileAactions
          file={row.original}
          isFavorite={row.original.isFavorited}
        />
      );
    },
  },
];
