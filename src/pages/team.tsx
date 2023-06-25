import { FC, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Member } from "@prisma/client";
import { ButtonIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { AiOutlineEdit } from "react-icons/ai";
import { RiAddFill } from "react-icons/ri";
import { z } from "zod";

import { api } from "~/utils/api";
import { useZodForm } from "~/utils/zod-form";
import { toast } from "~/hooks/use-toast";
import Layout from "~/layout";
import { Button } from "~/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/select";

export const memberFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  designation: z.string().optional(),
  role: z.string().optional(),
});

type MemeberFormValues = z.infer<typeof memberFormSchema>;

const team: FC = ({}) => {
  const { data: companyId } = api.company.getCompanyId.useQuery();
  const { data: members } = api.member.getTeamMembers.useQuery({
    companyId: companyId ?? "",
  });

  const [memberOpenModal, setMemberOpenModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member>();

  const form = useForm<MemeberFormValues>({
    resolver: zodResolver(memberFormSchema),
    mode: "onChange",
  });

  const methods = useZodForm({
    schema: memberFormSchema,
  });

  const utils = api.useContext();

  const createMember = api.member.createMember.useMutation({
    onSettled: async () => {
      await utils.member.invalidate();
      methods.reset();
    },

    onSuccess: () => {
      toast({
        title: "Member created.",
      });

      setMemberOpenModal(false);
      methods.reset();
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  const updateMember = api.member.updateMember.useMutation({
    onSettled: async () => {
      await utils.member.invalidate();
      methods.reset();
    },

    onSuccess: () => {
      toast({
        title: "Member updated.",
      });

      setMemberOpenModal(false);
      methods.reset();
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  function onSubmit(data: MemeberFormValues) {
    if (selectedMember) {
      updateMember.mutate({
        ...data,
        id: selectedMember.id,
      });
      return;
    }

    createMember.mutate({
      ...data,
      companyId: companyId ?? "",
    });
  }

  const deletePost = api.member.deleteMember.useMutation({
    onSettled: async () => {
      await utils.member.invalidate();
    },

    onSuccess: () => {
      toast({
        title: "Member deleted.",
      });

      setMemberOpenModal(false);
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  useEffect(() => {
    if (selectedMember && memberOpenModal) {
      form.reset({
        name: selectedMember.name,
        email: selectedMember.email,
        designation: selectedMember.designation ?? "",
        role: selectedMember.role,
      });
    } else if (selectedMember === undefined && memberOpenModal) {
      form.reset({
        name: "",
        email: "",
        designation: "",
      });
    }
  }, [selectedMember, memberOpenModal]);

  return (
    <Layout emoji="🎐" description="Team">
      <div className="relative flex h-full w-full flex-col items-center justify-center p-8">
        <section className="prose prose-a:no-underline mb-12 mt-16 flex w-full flex-col justify-between gap-10 md:mt-0 lg:mt-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="mb-3 text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-200">
              Team Members
            </h1>

            <Button
              onClick={() => {
                setSelectedMember(undefined);
                setMemberOpenModal(true);
              }}
            >
              <RiAddFill />
              Add Member
            </Button>
          </div>
          <div className="grid grid-cols-3 place-items-center gap-4">
            {members?.map((member) => (
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle>{member.name}</CardTitle>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedMember(member);
                      setMemberOpenModal(true);
                    }}
                  >
                    <AiOutlineEdit />
                  </Button>
                </CardHeader>
                <CardContent>
                  <CardDescription className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h6 className="text-sm font-semibold leading-none text-zinc-900 dark:text-zinc-200">
                        Email
                      </h6>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <h6 className="text-sm font-semibold leading-none text-zinc-900 dark:text-zinc-200">
                        Designation
                      </h6>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {member.designation}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <h6 className="text-sm font-semibold leading-none text-zinc-900 dark:text-zinc-200">
                        Role
                      </h6>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {member.role}
                      </p>
                    </div>
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Dialog
          open={memberOpenModal}
          onOpenChange={(open) => {
            setMemberOpenModal(open);
          }}
        >
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Add Member</DialogTitle>
              <DialogDescription>
                Add a new member to your team.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Full Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Email" {...field} />
                        </FormControl>
                        <FormDescription>
                          We'll send an invite to this email address.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Designation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Member">Member</SelectItem>
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    {selectedMember && (
                      <Button
                        variant="destructive"
                        onClick={() =>
                          deletePost.mutate({ id: selectedMember.id })
                        }
                      >
                        Delete Member
                      </Button>
                    )}

                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default team;
