import { GetServerSidePropsContext, Metadata } from "next";
import { getSession } from "next-auth/react";

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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
