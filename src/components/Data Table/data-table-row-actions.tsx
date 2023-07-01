"use client";

import { useState } from "react";
import Image from "next/image";
import { format, set } from "date-fns";
import { Eye, MoreHorizontal, Trash, View } from "lucide-react";
import { z } from "zod";

import { api } from "~/utils/api";
import { toast } from "~/hooks/use-toast";
import { Badge } from "~/ui/badge";
import { Button } from "~/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/ui/dropdown-menu";
import { Skeleton } from "~/ui/skeleton";

interface DataTableRowActionsProps<TData> {
  row: {
    original: {
      id: string;
    };
  };
}

export const taskSchema = z.object({
  id: z.string(),
});

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const utils = api.useContext();
  const [viewFoodSummary, setViewFoodSummary] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState("");

  const { data: foodSummary, isLoading: fetchingFoodSummary } =
    api.foodSummary.getFoodSummaryById.useQuery({
      id: selectedRowId,
    });

  const { data: recieptUrl, isLoading: fetchingReceiptUrl } =
    api.s3.getObjectUrl.useQuery({
      key: foodSummary?.reciept ?? "",
    });

  const deleteFoodSummary = api.foodSummary.deleteFoodSummary.useMutation({
    onSettled: async () => {
      await utils.member.invalidate();
    },

    onSuccess: () => {
      toast({
        title: "Food Summary Deleted.",
      });

      utils.foodSummary.invalidate();
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => {
              setViewFoodSummary(true);
              setSelectedRowId(row.original?.id ?? "");
            }}
          >
            <Eye className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => deleteFoodSummary.mutate({ id: row.original?.id })}
          >
            <Trash className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {viewFoodSummary && (
        <Dialog
          open={viewFoodSummary}
          onOpenChange={() => {
            setViewFoodSummary(false);
          }}
        >
          <DialogContent className="sm:max-w-[600px]">
            {fetchingFoodSummary ? (
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ) : (
              <DialogHeader className="space-y-10">
                <DialogTitle>
                  Food Summary{" "}
                  {foodSummary?.date &&
                    format(new Date(foodSummary?.date), "PPP")}
                </DialogTitle>
                <DialogDescription className="space-y-5">
                  {foodSummary?.reciept && recieptUrl && (
                    <Image
                      src={recieptUrl}
                      alt="reciept"
                      height={300}
                      width={600}
                    />
                  )}
                  <div className="grid w-full grid-cols-3">
                    <div className="flex gap-1">
                      Breads Amount:
                      <Badge variant="outline">
                        {foodSummary?.totalBreadsAmount}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      Curries Amount:
                      <Badge variant="outline">
                        {foodSummary?.totalCurriesAmount}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      Total Amount:
                      <Badge variant="outline">
                        {foodSummary?.totalAmount}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {foodSummary?.membersBroughtFood.length !== 0 && (
                      <div className="flex flex-wrap gap-4">
                        Members Who Brought Food:{" "}
                        {foodSummary?.membersBroughtFood?.map((member) => {
                          return (
                            <Badge variant="outline">{member?.name}</Badge>
                          );
                        })}
                      </div>
                    )}
                    {foodSummary?.membersDidntBringFood.length !== 0 && (
                      <div className="flex flex-wrap gap-4">
                        Members Who Didn't Bring Food:{" "}
                        {foodSummary?.membersDidntBringFood?.map((member) => {
                          return (
                            <Badge variant="outline">{member?.name}</Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {foodSummary?.extraMembers !== 0 && (
                    <>
                      <div className="flex gap-1">
                        Extra Members:
                        <Badge variant="outline">
                          {foodSummary?.extraMembers}
                        </Badge>
                      </div>
                      <div>
                        Extra Members related to:{" "}
                        {foodSummary?.extraMembersRelatedTo?.map((member) => {
                          return (
                            <Badge variant="outline">{member?.name}</Badge>
                          );
                        })}
                      </div>
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
