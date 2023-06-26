import { FC } from "react";

import { Skeleton } from "~/ui/skeleton";

const SkeletonCard: FC = ({}) => {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-[100px] w-[100px] rounded-full" />
        <Skeleton className="h-[20px] w-[250px]" />
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-[15px] w-[350px]" />
        <Skeleton className="h-[15px] w-[350px]" />
        <Skeleton className="h-[15px] w-[350px]" />
      </div>
    </div>
  );
};

export default SkeletonCard;
