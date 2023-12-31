import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useKBar } from "kbar";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { BiFoodMenu } from "react-icons/bi";
import {
  FiCommand,
  FiHome,
  FiLogIn,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";
import { RiTeamLine } from "react-icons/ri";

const NavbarItems = [
  {
    name: "Home",
    slug: "/",
    icon: FiHome,
  },
  {
    name: "Food Summary",
    slug: "/food-summary",
    icon: BiFoodMenu,
  },
  {
    name: "Team",
    slug: "/team",
    icon: RiTeamLine,
  },
  {
    name: "Settings",
    slug: "/settings/profile",
    nestedSlug: "/settings/company",
    icon: FiSettings,
  },
];

export default function NavBar({ path }: { path: string }) {
  const router = useRouter();
  const session = useSession();
  const isLoggedIn = !!session.data;
  const { theme, setTheme } = useTheme();
  const { query } = useKBar();
  const [mounted, setMounted] = useState(false);
  const [tooltipVisibility, setTooltipVisibility] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-full min-h-full w-full flex-col items-center justify-start pt-6">
      <div className="flex flex-col gap-4">
        {NavbarItems.map((item, index) => {
          return (
            <div key={item.slug}>
              {path === item.slug || path === item.nestedSlug ? (
                <button
                  key={index}
                  className="relative flex w-full items-center justify-center whitespace-nowrap rounded bg-zinc-800 shadow duration-300 ease-in-out hover:scale-110 hover:bg-zinc-800 hover:shadow-xl focus:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-700 dark:focus:bg-zinc-700"
                  onMouseLeave={() => {
                    const temp = [...tooltipVisibility];
                    temp[index] = false;
                    setTooltipVisibility(temp);
                  }}
                  onMouseEnter={() => {
                    const temp = [...tooltipVisibility];
                    temp[index] = true;
                    setTooltipVisibility(temp);
                  }}
                  onClick={() => router.push(item.slug)}
                >
                  <div className="p-2">
                    <item.icon size="1rem" className="text-zinc-100" />
                  </div>
                  {tooltipVisibility[index] && (
                    <span className="absolute left-10 min-w-full rounded bg-zinc-800 p-[0.62rem] text-[0.75rem] leading-none text-zinc-200 shadow-xl dark:bg-zinc-700">
                      {item.name}
                    </span>
                  )}
                </button>
              ) : (
                <button
                  key={index}
                  className="relative flex w-full items-center justify-center whitespace-nowrap rounded bg-zinc-700 shadow duration-300 ease-in-out hover:scale-110 hover:bg-zinc-800 hover:shadow-xl focus:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:focus:bg-zinc-700"
                  onMouseLeave={() => {
                    const temp = [...tooltipVisibility];
                    temp[index] = false;
                    setTooltipVisibility(temp);
                  }}
                  onMouseEnter={() => {
                    const temp = [...tooltipVisibility];
                    temp[index] = true;
                    setTooltipVisibility(temp);
                  }}
                  onClick={() => router.push(item.slug)}
                >
                  <div className="p-2">
                    <item.icon size="1rem" className="text-zinc-100" />
                  </div>
                  {tooltipVisibility[index] && (
                    <span className="absolute left-10 rounded bg-zinc-800 p-[0.62rem] text-[0.75rem] leading-none text-zinc-200 shadow-xl dark:bg-zinc-700">
                      {item.name}
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}
        <div className="flex flex-col gap-4">
          <button
            className="flex w-full items-center justify-center rounded bg-zinc-700 shadow duration-300 ease-in-out hover:scale-110 hover:bg-zinc-800 hover:shadow-xl dark:bg-zinc-800 dark:hover:bg-zinc-700"
            onClick={query.toggle}
          >
            <div className="p-2">
              <FiCommand size="1rem" className="text-zinc-100" />
            </div>
          </button>
          {isLoggedIn ? (
            <button
              className="flex w-full items-center justify-center rounded bg-zinc-700 shadow duration-300 ease-in-out hover:scale-110 hover:bg-zinc-800 hover:shadow-xl dark:bg-zinc-800 dark:hover:bg-zinc-700"
              onClick={() => {
                signOut();

                router.push("/auth/signin");
              }}
              onMouseLeave={() => {
                const temp = [...tooltipVisibility];
                temp[NavbarItems.length + 1] = false;
                setTooltipVisibility(temp);
              }}
              onMouseEnter={() => {
                const temp = [...tooltipVisibility];
                temp[NavbarItems.length + 1] = true;
                setTooltipVisibility(temp);
              }}
            >
              <div className="p-2">
                <FiLogOut size="1rem" className="text-zinc-100" />
              </div>
              {tooltipVisibility[NavbarItems.length + 1] && (
                <span className="absolute left-10 whitespace-nowrap rounded bg-zinc-800 p-[0.62rem] text-[0.75rem] leading-none text-zinc-200 shadow-xl dark:bg-zinc-700">
                  Sign Out
                </span>
              )}
            </button>
          ) : (
            <button
              className="flex w-full items-center justify-center rounded bg-zinc-700 shadow duration-300 ease-in-out hover:scale-110 hover:bg-zinc-800 hover:shadow-xl dark:bg-zinc-800 dark:hover:bg-zinc-700"
              onClick={() => {
                signIn();
              }}
              onMouseLeave={() => {
                const temp = [...tooltipVisibility];
                temp[NavbarItems.length + 1] = false;
                setTooltipVisibility(temp);
              }}
              onMouseEnter={() => {
                const temp = [...tooltipVisibility];
                temp[NavbarItems.length + 1] = true;
                setTooltipVisibility(temp);
              }}
            >
              <div className="p-2">
                <FiLogIn size="1rem" className="text-zinc-100" />
              </div>
              {tooltipVisibility[NavbarItems.length + 1] && (
                <span className="absolute left-10 whitespace-nowrap rounded bg-zinc-800 p-[0.62rem] text-[0.75rem] leading-none text-zinc-200 shadow-xl dark:bg-zinc-700">
                  Sign In
                </span>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 h-full border-r-2 border-zinc-500 dark:border-zinc-800"></div>
    </div>
  );
}
