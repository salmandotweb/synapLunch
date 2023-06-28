import { FC, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { GetSessionParams, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { BiFoodMenu } from "react-icons/bi";
import { useOnClickOutside } from "usehooks-ts";
import { z } from "zod";

import { api } from "~/utils/api";
import { cn } from "~/utils/cn";
import { useZodForm } from "~/utils/zod-form";
import { columns } from "~/components/Data Table/columns";
import { FoodSummaryTable } from "~/components/Food Summary/FoodSummaryTable";
import { toast } from "~/hooks/use-toast";
import Layout from "~/layout";
import { Button } from "~/ui/button";
import { Calendar } from "~/ui/calendar";
import { Checkbox } from "~/ui/checkbox";
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

export const foodFormSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  noOfMembers: z.string({
    required_error: "Number of members is required",
  }),
  breadsAmount: z.string({
    required_error: "Breads Amount is required",
  }),
  curriesAmount: z.string({
    required_error: "Curries Amount is required",
  }),
  totalAmount: z.string({
    required_error: "Total Ammount is required",
  }),
  membersBroughtFood: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one item.",
    }),
});

type FoodFormValues = z.infer<typeof foodFormSchema>;

const foodSummary: FC = () => {
  const ref = useRef(null);
  const [foodOpenModal, setFoodOpenModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const { data: company } = api.company.getCompany.useQuery();
  const { data: members } = api.member.getTeamMembers.useQuery({
    companyId: company?.id ?? "",
  });
  const { data: foodSummaries, isFetching: fetchingFoodSummaries } =
    api.foodSummary.getAllFoodSummary.useQuery({
      companyId: company?.id ?? "",
    });

  const handleClickOutside = () => {
    showCalendar && setShowCalendar(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  const form = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    mode: "onChange",
    defaultValues: {
      membersBroughtFood: [],
    },
  });

  const methods = useZodForm({
    schema: foodFormSchema,
  });

  const utils = api.useContext();

  const createFoodSummary = api.foodSummary.createFoodSummary.useMutation({
    onSettled: async () => {
      await utils.foodSummary.invalidate();
      methods.reset();
    },

    onSuccess: () => {
      toast({
        title: "Food Summary created.",
      });

      setFoodOpenModal(false);
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

  function onSubmit(data: FoodFormValues) {
    const membersDidNotBringFood = members?.filter(
      (member) => !data.membersBroughtFood.includes(member.id),
    );

    createFoodSummary.mutate({
      companyId: company?.id ?? "",
      membersDidNotBringFood:
        membersDidNotBringFood?.map((member) => member.id) ?? [],
      ...data,
    });
  }

  return (
    <Layout emoji="🎐" description="Team">
      <div className="relative flex h-full w-full flex-col items-center justify-center p-8">
        <section className="prose prose-a:no-underline mb-12 mt-16 flex w-full flex-col justify-between gap-10 md:mt-0 lg:mt-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="mb-3 text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-200">
              Food Summary
            </h1>
            <Button
              onClick={() => setFoodOpenModal(true)}
              variant="outline"
              size="sm"
            >
              <BiFoodMenu />
              Add Summary
            </Button>
          </div>

          <FoodSummaryTable
            data={
              foodSummaries?.map((foodSummary) => {
                return {
                  id: foodSummary.id,
                  date: format(new Date(foodSummary.date), "PPP"),
                  members: foodSummary.numberOfPeople,
                  breads: foodSummary.totalBreads,
                  curries: foodSummary.totalCurries,
                  totalAmount: foodSummary.totalAmount,
                };
              }) ||
              ([
                {
                  id: "No data",
                  date: "No data",
                  members: "No data",
                  breads: "No data",
                  curries: "No data",
                  totalAmount: "No data",
                },
              ] as any)
            }
            columns={columns}
            fetchingFoodSummaries={fetchingFoodSummaries}
          />
        </section>
        <Dialog
          open={foodOpenModal}
          onOpenChange={(open) => {
            setFoodOpenModal(open);
          }}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Food Summary</DialogTitle>
              <DialogDescription>
                Add food summary for the team.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="relative flex w-full flex-col items-start">
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "ml-0 w-[240px] pl-3 text-left font-normal",
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
                  <div className="grid grid-cols-2 place-items-stretch gap-4">
                    <FormField
                      control={form.control}
                      name="noOfMembers"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="No of Members" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="breadsAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Total Breads" {...field} />
                          </FormControl>
                          {/* <FormDescription>
                            {company?.breadPrice !== 0 &&
                              `Each bread costs Rs. ${company?.breadPrice}`}
                          </FormDescription> */}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="curriesAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Total Curries" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Total Amount" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="membersBroughtFood"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">
                            Team Members
                          </FormLabel>
                          <FormDescription>
                            Select the team members who brought food.
                          </FormDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          {members?.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="membersBroughtFood"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-center space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                item.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {item.name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <div className="flex w-full justify-end">
                    <Button
                      type="submit"
                      disabled={createFoodSummary.isLoading}
                      variant="outline"
                      size="sm"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default foodSummary;

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
