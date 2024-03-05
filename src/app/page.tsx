"use client";

import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "File name must be at least 2 characters.",
    })
    .max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, "Required"),
});

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      file: undefined,
    },
  });

  const fileRef = form.register("file");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    if (!orgId) return;

    const postUrl = await generateUploadUrl();

    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.file[0]!.type },
      body: values.file[0],
    });

    const { storageId } = await result.json();

    await createFile({
      name: values.name,
      fileId: storageId,
      orgId,
    });

    form.reset();
    setOpen(false);
  }

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  const createFile = useMutation(api.files.createFile);

  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold">Your Files</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Upload File</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription>
                Chose and upload a file to your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File name</FormLabel>
                        <FormControl>
                          <Input placeholder="file name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="file"
                    render={() => (
                      <FormItem>
                        <FormLabel>Your file</FormLabel>
                        <FormControl>
                          <Input type="file" {...fileRef} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Submit</Button>
                </form>
              </Form>
              <div className="grid grid-cols-4 items-center gap-4"></div>
            </div>
            <DialogFooter></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {files?.map((file) => {
        return <div key={file._id}>{file.name}</div>;
      })}
    </main>
  );
}
