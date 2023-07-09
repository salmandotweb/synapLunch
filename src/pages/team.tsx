import { FC, useRef, useState } from "react";
import { Member } from "@prisma/client";
import { format } from "date-fns";
import { GetSessionParams, getSession } from "next-auth/react";
import { AiOutlineEdit, AiOutlineTeam } from "react-icons/ai";
import { BsCashCoin } from "react-icons/bs";

import { api } from "~/utils/api";
import CashDepositForm from "~/components/Team/CashDepositForm";
import MemberForm from "~/components/Team/MemberForm";
import SkeletonCard from "~/components/Team/SkeletonCard";
import TopupForm from "~/components/Team/TopupForm";
import { useOnClickOutside } from "~/hooks/use-clickOutside";
import Layout from "~/layout";
import { Badge } from "~/ui/badge";
import { Button } from "~/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/card";

const CardRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | Date;
}) => {
  return (
    <div className="grid w-full grid-cols-[1.4fr,2fr] gap-4">
      <div>
        <Badge variant="secondary" className="whitespace-nowrap">
          {label}
        </Badge>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {value instanceof Date ? format(value, "PPP") : value}
      </p>
    </div>
  );
};

const team: FC = ({}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { data: companyId } = api.company.getCompanyId.useQuery();
  const { data: members, isFetching: membersFetching } =
    api.member.getTeamMembers.useQuery({
      companyId: companyId ?? "",
    });

  const [memberOpenModal, setMemberOpenModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member>();
  const [cashDepositOpenModal, setCashDepositOpenModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [addCompanyTopUpModal, setAddCompanyTopUpModal] = useState(false);

  const handleClickOutside = () => {
    showCalendar && setShowCalendar(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  return (
    <Layout emoji="🎐" description="Team">
      <div className="relative flex h-full w-full flex-col items-center justify-center p-8">
        <section className="prose prose-a:no-underline mb-12 mt-16 flex w-full flex-col justify-between gap-10 md:mt-0 lg:mt-0">
          <div className="flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
            <h1 className="mb-3 text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-200">
              Team Members
            </h1>

            <div className="flex flex-wrap items-center justify-start gap-2">
              <Button
                onClick={() => {
                  setAddCompanyTopUpModal(true);
                }}
                variant="outline"
                size="sm"
              >
                <AiOutlineTeam />
                Add Company Topup
              </Button>

              <Button
                onClick={() => {
                  setSelectedMember(undefined);
                  setMemberOpenModal(true);
                }}
                variant="outline"
                size="sm"
              >
                <AiOutlineTeam />
                Add Member
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1  place-items-stretch gap-6 lg:grid-cols-3">
            {membersFetching ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              members?.map((member) => (
                <Card className="min-w-[300px]">
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <CardTitle>{member.name}</CardTitle>
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedMember(member);
                          setCashDepositOpenModal(true);
                        }}
                      >
                        <BsCashCoin />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedMember(member);
                          setMemberOpenModal(true);
                        }}
                      >
                        <AiOutlineEdit />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="space-y-6">
                      <CardRow label="Email" value={member.email} />
                      <CardRow
                        label="Designation"
                        value={member.designation ?? "-"}
                      />
                      <CardRow label="Role" value={member.role ?? "-"} />
                      <CardRow
                        label="Last Cash Deposit"
                        value={
                          member?.lastCashDeposit
                            ? format(member.lastCashDeposit, "PPP")
                            : "-"
                        }
                      />
                      <CardRow label="Balance" value={member.balance ?? 0} />
                    </CardDescription>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        <MemberForm
          open={memberOpenModal}
          setOpen={setMemberOpenModal}
          onOpenChange={setMemberOpenModal}
          selectedMember={selectedMember}
        />

        <CashDepositForm
          open={cashDepositOpenModal}
          setOpen={setCashDepositOpenModal}
          onOpenChange={setCashDepositOpenModal}
          selectedMember={selectedMember}
        />

        <TopupForm
          open={addCompanyTopUpModal}
          setOpen={setAddCompanyTopUpModal}
          onOpenChange={setAddCompanyTopUpModal}
        />
      </div>
    </Layout>
  );
};

export default team;

export async function getServerSideProps(
  context: GetSessionParams | undefined,
) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
