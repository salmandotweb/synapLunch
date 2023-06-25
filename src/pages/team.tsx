import { FC } from "react";

import AddTeamMember from "~/components/Team/AddTeamMember";
import Layout from "~/layout";

const team: FC = ({}) => {
  return (
    <Layout emoji="🎐" description="Team">
      <div className="relative flex h-full w-full flex-col items-center justify-center p-8">
        <section className="prose prose-a:no-underline mb-12 mt-16 flex w-full flex-col justify-between gap-10 md:mt-0 lg:mt-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="mb-3 text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-200">
              Team Members
            </h1>

            <AddTeamMember />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default team;
