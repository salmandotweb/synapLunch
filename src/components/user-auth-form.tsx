"use client";

import { signIn } from "next-auth/react";

import { Button } from "~/ui/button";
import { Icons } from "./icons";

export function UserAuthForm() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        signIn().catch((error) => {
          console.error(error);
        });
      }}
    >
      <Icons.google className="mr-2 h-4 w-4" />
      Google
    </Button>
  );
}
