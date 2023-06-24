"use client";

import { signIn } from "next-auth/react";

import { Button } from "~/ui/button";
import { Icons } from "./icons";

export function UserAuthForm({ providers }: any) {
  return (
    <>
      {Object.values(providers).map((provider: any) => (
        <Button
          variant="outline"
          key={provider.name}
          className="flex items-center justify-center rounded-lg border py-2.5 duration-150 hover:bg-gray-50 active:bg-gray-100"
          onClick={() => {
            signIn(provider.id, {
              callbackUrl: "/",
            }).catch(console.error);
          }}
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Google
        </Button>
      ))}
    </>
  );
}
