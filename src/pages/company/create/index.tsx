import { FC } from "react";

import SetupCompany from "~/components/SetupCompany";

interface indexProps {}

const CreateCompany: FC<indexProps> = ({}) => {
  return (
    <div className="grid min-h-screen grid-cols-2 place-items-center justify-items-center">
      <div className=""></div>
      <div className="flex w-full max-w-[70%] flex-col space-y-4 rounded-md bg-white p-10 dark:bg-slate-800 dark:text-white">
        <h1 className="mb-3 text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-200">
          Setup your company
        </h1>

        <SetupCompany />
      </div>
    </div>
  );
};

export default CreateCompany;
