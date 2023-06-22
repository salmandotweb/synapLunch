/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react/display-name */

import React from "react";
import {
  ActionId,
  ActionImpl,
  // useRegisterActions,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarResults,
  KBarSearch,
  useMatches,
} from "kbar";

export default function Palette() {
  return (
    <KBarPortal>
      <KBarPositioner className="font-clash z-50 select-none overflow-hidden bg-zinc-800/30 backdrop-blur">
        <KBarAnimator className="min-w-500 kbar w-[90%] overflow-hidden rounded-lg bg-zinc-100 text-lg text-white shadow-xl dark:bg-zinc-900 md:w-2/3 lg:w-[44%]">
          <KBarSearch className="w-full rounded-lg bg-gray-100 p-3 text-sm text-gray-900 outline-none dark:bg-zinc-900 dark:text-zinc-200" />
          <RenderResults />
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  );
}

function RenderResults() {
  const { results, rootActionId } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div
            className="h-full w-full cursor-pointer p-3 text-xs uppercase text-gray-700 dark:text-zinc-500"
            key={item}
          >
            {item}
          </div>
        ) : (
          <ResultItem
            key={item.id}
            action={item}
            active={active}
            currentRootActionId={rootActionId!}
          />
        )
      }
    />
  );
}

const ResultItem = React.forwardRef(
  (
    {
      action,
      active,
      currentRootActionId,
    }: {
      action: ActionImpl;
      active: boolean;
      currentRootActionId: ActionId;
    },
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const ancestors = React.useMemo(() => {
      if (!currentRootActionId) return action.ancestors;
      const index = action.ancestors.findIndex(
        (ancestor) => ancestor.id === currentRootActionId,
      );
      return action.ancestors.slice(index + 1);
    }, [action.ancestors, currentRootActionId]);

    return (
      <div
        ref={ref}
        className={`align-center flex cursor-pointer justify-between px-3 py-2 transition-all ${
          active
            ? "bg-zinc-100 duration-200 hover:bg-zinc-200 dark:bg-zinc-800 hover:dark:bg-zinc-800"
            : "transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-sm text-gray-900 dark:text-zinc-200">
            <div className="flex gap-2">
              {ancestors.length > 0 &&
                ancestors.map((ancestor) => (
                  <div key={ancestor.id} className="text-zinc-500">
                    <span className="mr-2">{ancestor.name}</span>
                    <span>&rsaquo;</span>
                  </div>
                ))}
              {action.icon}
              <span>{action.name}</span>
            </div>
            {action.subtitle && (
              <span className="text-xs text-zinc-400">{action.subtitle}</span>
            )}
          </div>
        </div>
        {action.shortcut?.length ? (
          <div className="flex items-center justify-center">
            {action.shortcut.map((sc) => (
              <kbd
                key={sc}
                className="ml-2 h-fit rounded bg-zinc-300 px-2 py-1 text-sm text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
              >
                {sc}
              </kbd>
            ))}
          </div>
        ) : null}
      </div>
    );
  },
);
