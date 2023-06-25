import { useEffect, useRef, type ReactElement } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { KBarProvider } from "kbar";
import { Toaster } from "react-hot-toast";

import Palette from "~/components/CMD";
import MobileNavBar from "~/components/MobileNav";
import NavBar from "~/components/Nav";
import { actions } from "../lib/actions";

export default function Layout({
  children,
  description,
  emoji,
  image,
}: {
  children: ReactElement;
  description: string;
  emoji: string;
  image?: string;
}) {
  const currentRoute = useRouter().pathname;

  return (
    <div>
      <Head>
        <link rel="icon" href={`https://fmj.asrvd.me/${emoji}`}></link>
        <title>
          {currentRoute === "/" ? "Sal." : `Sal. // ${currentRoute.slice(1)}`}
        </title>
        <meta name="description" content={description} />
        <meta name="theme-color" content="#27272a" />
        <meta property="og:site_name" content="Sal." />
        <meta
          property="og:title"
          content={`Sal.${
            currentRoute.slice(1).length > 1
              ? ` // ${currentRoute.slice(1)}`
              : ``
          }`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={description} />
        <meta
          property="twitter:title"
          content={`Sal.${
            currentRoute.slice(1).length > 1
              ? ` // ${currentRoute.slice(1)}`
              : ``
          }`}
        />
        <meta property="twitter:description" content={description} />
        <meta
          property="og:image"
          content="https://user-images.githubusercontent.com/68690233/211317069-9fdd4a02-78c9-4215-a397-748025e968de.png"
        />
        <meta
          property="twitter:image"
          content="https://user-images.githubusercontent.com/68690233/211317069-9fdd4a02-78c9-4215-a397-748025e968de.png"
        />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:site" content="@salmandotweb" />
        <script
          async
          defer
          data-website-id="82db8ab0-57c7-4ce0-bc6d-b18f8d63e2a3"
          src="https://salmandotweb.me/umami.js"
        ></script>
      </Head>
      <KBarProvider actions={actions}>
        <main className="font-clash max-h-auto overflow-x-hidde relative flex min-h-screen flex-col items-center bg-neutral-950 selection:bg-neutral-200/30">
          <Palette />
          <div className="flex h-full w-full md:w-2/3 lg:w-[70%]">
            <div className="fixed left-0 z-50 hidden h-full w-[6%] md:block lg:block">
              <NavBar path={currentRoute} />
            </div>
            <div className="fixed top-0 z-50 block w-full px-8 pt-4 md:hidden lg:hidden">
              <MobileNavBar path={currentRoute} />
            </div>
            {children}
          </div>
        </main>
      </KBarProvider>

      <Toaster
        toastOptions={{
          style: {
            background: "#27272a",
            color: "#e4e4e7",
          },
        }}
      />
    </div>
  );
}
