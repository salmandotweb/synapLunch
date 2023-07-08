import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  Metadata,
} from "next";
import { getServerSession } from "next-auth";
import { getProviders } from "next-auth/react";

import { UserAuthForm } from "~/components/user-auth-form";
import { authOptions } from "~/server/auth";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

const AuthenticationPage = ({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <>
      <div
        className="
        flex h-screen w-full flex-col items-center justify-center
      "
      >
        <UserAuthForm providers={providers} />
      </div>
    </>
  );
};

export default AuthenticationPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();

  return {
    props: { providers: providers ?? [] },
  };
}
