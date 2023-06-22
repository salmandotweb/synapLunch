import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useKBar } from "kbar";
import { useTheme } from "next-themes";
import { FiCommand, FiHome, FiMoon, FiSun } from "react-icons/fi";

const NavbarItems = [
  {
    name: "Home",
    slug: "/",
    icon: FiHome,
  },
];

export default function MobileNavBar({ path }: { path: string }) {
  const { query } = useKBar();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex h-full min-h-full min-w-full items-center justify-center gap-4 overflow-x-scroll rounded-lg bg-zinc-500/50 py-1 shadow-xl dark:bg-zinc-800/50">
      <div className="flex justify-evenly gap-4 pl-24">
        {NavbarItems.map((item, index) => {
          return (
            <button
              key={index}
              className="flex h-12 w-full items-center justify-center"
            >
              {path === item.slug ? (
                <item.icon
                  size="2rem"
                  className="cursor-pointer rounded bg-zinc-800 py-2 text-zinc-100 shadow duration-300 ease-in-out hover:scale-110 hover:bg-zinc-800 hover:shadow-xl dark:bg-zinc-700 dark:hover:bg-zinc-700"
                  onClick={() => router.push(item.slug)}
                />
              ) : (
                <item.icon
                  size="2rem"
                  className="cursor-pointer rounded bg-zinc-700 py-2 text-zinc-100 shadow duration-300 ease-in-out hover:scale-110 hover:bg-zinc-800 hover:shadow-xl dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  onClick={() => router.push(item.slug)}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex gap-4 pr-4">
        {mounted && (
          <button
            className="flex w-full items-center justify-center rounded bg-zinc-700 shadow duration-300 ease-in-out hover:scale-110 hover:bg-zinc-800 hover:shadow-xl dark:bg-zinc-800 dark:hover:bg-zinc-700"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <div className="p-2 text-zinc-100">
              {theme === "dark" ? <FiSun /> : <FiMoon />}
            </div>
          </button>
        )}
        <button
          className="flex w-full items-center justify-center rounded bg-zinc-700 shadow duration-300 ease-in-out hover:scale-110 hover:bg-zinc-800 hover:shadow-xl dark:bg-zinc-800 dark:hover:bg-zinc-700"
          //   onClick={() => router.push(item.slug)}
          onClick={query.toggle}
        >
          <div className="p-2">
            <FiCommand size="1rem" className="text-zinc-100" />
          </div>
        </button>
      </div>
    </div>
  );
}
