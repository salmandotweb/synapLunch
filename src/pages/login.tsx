import { Metadata } from "next";

import { UserAuthForm } from "~/components/user-auth-form";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export default function AuthenticationPage() {
  return (
    <>
      <div className="container relative hidden h-[100vh] flex-col items-center justify-center bg-zinc-900 selection:bg-zinc-200/30 md:grid lg:max-w-none lg:px-0">
        <UserAuthForm />
      </div>
    </>
  );
}
