"use client";

import { Button } from "@/components/ui/button";
import { SignedOut } from "@clerk/clerk-react";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  useSession,
} from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const { session } = useSession();

  const createFile = useMutation(api.files.createFile);

  return (
    <main className="flex justify-center items-center h-screen">
      <SignedIn>
        <SignOutButton>
          <div>
            <p className="p-2">Olá {session?.user.firstName}</p>
            <Button>Sign Out</Button>
          </div>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>

      <Button
        onClick={() => {
          createFile({ name: "Hello World" });
        }}
      >
        Click Me
      </Button>
    </main>
  );
}
