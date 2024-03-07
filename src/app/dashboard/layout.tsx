import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilesIcon, Star } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

/* export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};
 */

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="container mx-auto pt-12">
      <div className="flex gap-8">
        <div className="w-40 flex-col gap-4 flex">
          <Link href="/dashboard/files">
            <Button variant={"link"}>
              <FilesIcon /> All Files
            </Button>
          </Link>
          <Link href="/dashboard/favorites">
            <Button variant={"link"}>
              <Star /> Favorites
            </Button>
          </Link>
        </div>
        <div className="w-full">{children}</div>
      </div>
    </main>
  );
}
