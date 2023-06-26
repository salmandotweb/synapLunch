import { FC, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Member } from "@prisma/client";
import { ButtonIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { GetSessionParams, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { AiOutlineEdit, AiOutlineTeam } from "react-icons/ai";
import { BsCashCoin } from "react-icons/bs";
import { RiAddFill } from "react-icons/ri";
import { z } from "zod";

import { api } from "~/utils/api";
import { cn } from "~/utils/cn";
import { useZodForm } from "~/utils/zod-form";
import SkeletonCard from "~/components/Team/SkeletonCard";
import { useOnClickOutside } from "~/hooks/use-clickOutside";
import { toast } from "~/hooks/use-toast";
import Layout from "~/layout";
import { Button } from "~/ui/button";
import { Calendar } from "~/ui/calendar";
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

export const cashDepositFormSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  amount: z
    .number()
    .min(1, {
      message: "Amount must be greater than 0.",
    })
    .max(1000000, {
      message: "Amount must be less than 1000000.",
    })
    .positive({
      message: "Amount must be greater than 0.",
    }),
});

type MemeberFormValues = z.infer<typeof memberFormSchema>;

type CashDepositFormValues = z.infer<typeof cashDepositFormSchema>;

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

  const handleClickOutside = () => {
    showCalendar && setShowCalendar(false);
  };

  useOnClickOutside(ref, handleClickOutside);

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
      form.reset({});
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
      form.reset({});
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

  const deleteMember = api.member.deleteMember.useMutation({
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

  const cashDepositForm = useForm<CashDepositFormValues>({
    resolver: zodResolver(cashDepositFormSchema),
    mode: "onChange",
  });

  const cashDepositMethods = useZodForm({
    schema: cashDepositFormSchema,
  });

  const createCashDeposit = api.member.addCashDeposit.useMutation({
    onSettled: async () => {
      await utils.member.invalidate();
      cashDepositMethods.reset();
    },

    onSuccess: () => {
      toast({
        title: "Cash Deposit created.",
      });

      setCashDepositOpenModal(false);
      cashDepositForm.reset({});
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  function onCashDepositSubmit(data: CashDepositFormValues) {
    createCashDeposit.mutate({
      ...data,
      id: selectedMember?.id ?? "",
    });
  }

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
              variant="outline"
              size="sm"
            >
              <AiOutlineTeam />
              Add Member
            </Button>
          </div>

          <div className="grid grid-cols-3 place-items-stretch gap-6">
            {membersFetching ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              members?.map((member) => (
                <Card className="w-full">
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
                    <CardDescription className="space-y-2">
                      <div className="flex flex-col items-start gap-2">
                        <h6 className="text-sm font-semibold leading-none text-zinc-900 dark:text-zinc-200">
                          Email
                        </h6>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {member.email}
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-2">
                        <h6 className="text-sm font-semibold leading-none text-zinc-900 dark:text-zinc-200">
                          Designation
                        </h6>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {member.designation}
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-2">
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
              ))
            )}
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
                          deleteMember.mutate({ id: selectedMember.id })
                        }
                        disabled={deleteMember.isLoading}
                        size="sm"
                      >
                        Delete Member
                      </Button>
                    )}

                    <Button
                      type="submit"
                      disabled={
                        createMember.isLoading || updateMember.isLoading
                      }
                      variant="outline"
                      size="sm"
                    >
                      Save changes
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={cashDepositOpenModal}
          onOpenChange={(open) => {
            setCashDepositOpenModal(open);
          }}
        >
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Deposit Cash for {selectedMember?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Form {...cashDepositForm}>
                <form
                  onSubmit={cashDepositForm.handleSubmit(onCashDepositSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={cashDepositForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="relative flex w-full flex-col items-start">
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "ml-0 w-[100%] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                            onClick={() => {
                              setShowCalendar(!showCalendar);
                            }}
                            type="button"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                        {showCalendar && (
                          <div
                            ref={ref}
                            className="absolute top-[40px] z-50 rounded-lg bg-neutral-950 outline outline-1 outline-neutral-500"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </div>
                        )}

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={cashDepositForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Amount"
                            {...field}
                            onChange={(e) => {
                              // change the value to a number
                              const value = Number(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="reset"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        cashDepositForm.reset({});
                        setCashDepositOpenModal(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={createCashDeposit.isLoading}
                    >
                      Save changes
                    </Button>
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
