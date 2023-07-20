import { FC } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";

import { api } from "~/utils/api";
import { toast } from "~/hooks/use-toast";
import Layout from "~/layout";
import { Button } from "~/ui/button";
import { Skeleton } from "~/ui/skeleton";

interface indexProps {}

const index: FC<indexProps> = ({}) => {
  const router = useRouter();
  const { id } = router.query;

  const { data: member } = api.member.getTeamMember.useQuery({
    id: (id as string) ?? "",
  });

  const utils = api.useContext();

  const deactivateMember = api.member.deactivateMember.useMutation({
    onSettled: async () => {
      await utils.member.invalidate();
    },

    onSuccess: () => {
      toast({
        title: "Member deactivated.",
      });
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  const activateMember = api.member.activateMember.useMutation({
    onSettled: async () => {
      await utils.member.invalidate();
    },

    onSuccess: () => {
      toast({
        title: "Member activated.",
      });
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <Layout emoji="🎐" description="Team">
      <div className="relative flex h-full w-full flex-col items-center justify-center p-8">
        <section className="prose prose-a:no-underline mb-12 mt-16 flex w-full flex-col justify-between gap-10 md:mt-0 lg:mt-0">
          <div className="flex w-full flex-col items-start gap-4 border-b-2 pb-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col items-start gap-4">
              <h1 className="flex items-baseline gap-3 text-3xl font-semibold leading-none text-zinc-900 dark:text-zinc-200">
                {member?.name ?? <Skeleton className="h-7 w-[250px]" />}{" "}
                <p className="text-sm">{member?.designation}</p>
              </h1>
              <p className="text-sm">
                Balance: <span className="text-lg">{member?.balance}</span>
              </p>
            </div>
            {member?.role === "Member" && member.active && (
              <Button
                onClick={() => {
                  deactivateMember.mutate({
                    id: member.id,
                  });
                }}
                disabled={deactivateMember.isLoading}
                variant="destructive"
                size="sm"
              >
                Deactivate Member
              </Button>
            )}

            {member?.role === "Member" && !member.active && (
              <Button
                onClick={() => {
                  activateMember.mutate({
                    id: member.id,
                  });
                }}
                disabled={activateMember.isLoading}
                variant="destructive"
                size="sm"
              >
                Activate Member
              </Button>
            )}
          </div>
          <div className="flex items-start gap-10">
            <div className="flex max-h-[600px] w-fit flex-col items-start gap-5 overflow-y-auto">
              <h1 className="mb-3 text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-200">
                Cash Deposits
              </h1>
              {member?.deposits?.map((deposit) => {
                return (
                  <div className="bg flex items-center gap-10 border-l-2 bg-slate-800 p-3">
                    <h1 className="text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-200">
                      {deposit.amount}
                    </h1>
                    <p>{format(new Date(deposit.date), "PPP")}</p>
                  </div>
                );
              }) ?? "No data"}
            </div>
            <div className="flex max-h-[600px] w-fit flex-col items-start gap-5 overflow-y-auto">
              <h1 className="mb-3 text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-200">
                Didn't Bring Food
              </h1>
              {member?.foodSummariesDidntBring?.map((summary) => {
                return (
                  <div className="bg flex min-w-[200px] items-center gap-10 border-l-2 bg-slate-800 p-3">
                    <p>{format(new Date(summary.date), "PPP")}</p>
                  </div>
                );
              }) ?? "No data"}
            </div>
            <div className="flex max-h-[600px] w-fit flex-col items-start gap-5 overflow-y-auto">
              <h1 className="mb-3 text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-200">
                Extra Members Brought
              </h1>
              {member?.extraMembers?.map((member) => {
                return (
                  <div className="bg flex min-w-[200px] items-center gap-10 border-l-2 bg-slate-800 p-3">
                    <h1 className="text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-200">
                      {member.noOfPeople}
                    </h1>
                    <p>{format(new Date(member.createdAt), "PPP")}</p>
                  </div>
                );
              }) ?? "No data"}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default index;
