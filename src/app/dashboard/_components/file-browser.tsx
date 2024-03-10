"use client";

import { useQuery } from "convex/react";
import { useOrganization, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { UploadButton } from "@/app/dashboard/_components/upload-button";
import SearchBar from "@/app/dashboard/_components/search-bar";
import FileCard from "@/app/dashboard/_components/file-card";
import { columns } from "./columns";
import { DataTable } from "./file-table";

export function FileBrowser({
  title,
  favoritesOnly,
  deletedOnly,
}: {
  title: string;
  favoritesOnly?: boolean;
  deletedOnly?: boolean;
}) {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");

  let orgId: string | undefined = undefined;

  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const allFavorites = useQuery(
    api.files.getAllFavorites,
    orgId ? { orgId } : "skip"
  );

  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId, query, favorites: favoritesOnly, deletedOnly } : "skip"
  );
  const isLoading = files === undefined;

  const modifiedFiles =
    files?.map((file) => ({
      ...file,
      isFavorited: (allFavorites ?? []).some(
        (favorite) => favorite.fileId === file._id
      ),
    })) ?? [];

  return (
    <div>
      {isLoading && (
        <div className="flex flex-col items-center mt-24 w-full">
          <Loader2 className="h-32 w-32 animate-spin text-zinc-500" />
          <span className="text-2xl text-zinc-500">Loading your images...</span>
        </div>
      )}

      {!isLoading && !query && files.length === 0 && (
        <div className="flex flex-col gap-8 items-center mt-20">
          <Image
            alt="Image a women putting a giant picture in a giant monitor, like she is uploading a picture to the monitor"
            width={500}
            height={500}
            src="/empty.svg"
          />
          <h3 className="text-2xl  text-center">
            You have no files yet, upload one now!
          </h3>
          <UploadButton />
        </div>
      )}

      {!isLoading && files.length === 0 && query && (
        <div>
          <div>
            <div className="flex justify-between mb-8">
              <h1 className="text-4xl font-bold">Your {title}</h1>
              <SearchBar query={query} setQuery={setQuery} />
              <UploadButton />
            </div>
            <div className="flex flex-col gap-8 items-center mt-20">
              <Image
                alt="Image a women putting a giant picture in a giant monitor, like she is uploading a picture to the monitor"
                width={500}
                height={500}
                src="/empty.svg"
              />
              <h3 className="text-2xl  text-center">
                We didnt find any files with the name ## {query} ##
              </h3>
            </div>
          </div>
        </div>
      )}

      {!isLoading && files.length > 0 && (
        <div>
          <div className="flex justify-between mb-8">
            <h1 className="text-4xl font-bold">Your {title}</h1>
            <SearchBar query={query} setQuery={setQuery} />
            <UploadButton />
          </div>

          <DataTable columns={columns} data={modifiedFiles} />
          <div className="grid grid-cols-4 gap-4">
            {modifiedFiles?.map((file) => {
              return <FileCard key={file._id} file={file} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
