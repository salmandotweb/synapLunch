import { FC } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/utils/api";
import { useZodForm } from "~/utils/zod-form";
import { Button } from "~/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/ui/form";
import { Input } from "~/ui/input";

interface indexProps {}

export const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const CreateCompany: FC<indexProps> = ({}) => {
  const session = useSession();

  const { data: companies } = api.company.all.useQuery();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: session?.data?.user?.email as string,
    },
    mode: "onChange",
  });

  const methods = useZodForm({
    schema: profileFormSchema,
  });

  const utils = api.useContext();
  const createPost = api.company.create.useMutation({
    onSettled: async () => {
      await utils.company.invalidate();
      methods.reset();
    },
  });

  function onSubmit(data: ProfileFormValues) {
    createPost.mutate(data);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Company Name" {...field} />
                </FormControl>
                <FormDescription>
                  This is how your profile will be displayed on the platform.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder={session?.data?.user?.email as string}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is how your profile will be displayed on the platform.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Update profile</Button>
        </form>
      </Form>

      {companies?.map((company) => (
        <div key={company.id}>
          <p>{company.name}</p>
          <p>{company.email}</p>
        </div>
      ))}
    </div>
  );
};

export default CreateCompany;
