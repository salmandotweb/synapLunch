import { type NextPage } from "next";
import { format } from "date-fns";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { GetSessionParams, getSession, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { Overview } from "~/components/Overview";
import Layout from "~/layout";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";

const Home: NextPage = () => {
  const session = useSession();
  const { data: company } = api.company.getCompany.useQuery();
  const { data: companyBalance } = api.company.getBalance.useQuery({
    companyId: company?.id as string,
  });
  const { data: membersCount } = api.company.getTotalMembers.useQuery({
    companyId: company?.id as string,
  });
  const { data: membersAverage } = api.company.getIncreaseOrDecrease.useQuery({
    companyId: company?.id as string,
  });

  const isLoggedIn = !!session.data;

  return (
    <>
      <Layout emoji="🎐" description="Sal.">
        <div className="relative flex h-full w-full flex-col items-center justify-center p-8">
          <section className="prose prose-a:no-underline mb-12 mt-16 flex w-full flex-col justify-between gap-10 md:mt-0 lg:mt-0">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h1 className="mb-3 text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-200">
                  Welcome to {company?.name ?? "SynapLunch"}
                </h1>
                {isLoggedIn && (
                  <>
                    <Avatar>
                      <AvatarImage src={session.data.user?.image as string} />
                      <AvatarFallback>
                        {session.data.user?.name?.charAt(0) as string}
                      </AvatarFallback>
                    </Avatar>
                  </>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Members
                  </CardTitle>
                  <Users className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{membersCount ?? 0}</div>
                  <p className="text-muted-foreground text-xs">
                    {membersAverage ?? 0} since last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Balance Remaining
                  </CardTitle>
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {companyBalance?.balance ?? 0}
                  </div>

                  <p className="text-muted-foreground text-xs">
                    Last topup:{" "}
                    {companyBalance?.lastTopup
                      ? format(new Date(companyBalance.lastTopup), "dd/MM/yyyy")
                      : "N/A"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Spent per day
                  </CardTitle>
                  <CreditCard className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">700</div>
                  <p className="text-muted-foreground text-xs">
                    +200 since last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Amount per member
                  </CardTitle>
                  <Activity className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(2350 / 7)}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    +200 since last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Overview />
          </section>
        </div>
      </Layout>
    </>
  );
};

export default Home;

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
