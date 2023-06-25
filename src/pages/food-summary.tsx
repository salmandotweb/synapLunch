import { FC, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/utils/api";
import { cn } from "~/utils/cn";
import { useZodForm } from "~/utils/zod-form";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/table";

export const foodFormSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  noOfMembers: z.string({
    required_error: "Number of members is required",
  }),
  breads: z.string({
    required_error: "Breads is required",
  }),
  curries: z.string({
    required_error: "Curries is required",
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

const foodSummary: FC = ({}) => {
  const [foodOpenModal, setFoodOpenModal] = useState(false);

  const { data: companyId } = api.company.getCompanyId.useQuery();
  const { data: members } = api.member.getTeamMembers.useQuery({
    companyId: companyId ?? "",
  });
  const { data: foodSummaries } = api.foodSummary.getAllFoodSummary.useQuery({
    companyId: companyId ?? "",
  });

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

      methods.reset();

      setFoodOpenModal(false);
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  function onSubmit(data: FoodFormValues) {
    createFoodSummary.mutate({
      companyId: companyId ?? "",
      ...data,
    });
  }

  console.log(foodSummaries);

  return (
    <Layout emoji="🎐" description="Team">
      <div className="relative flex h-full w-full flex-col items-center justify-center p-8">
        <section className="prose prose-a:no-underline mb-12 mt-16 flex w-full flex-col justify-between gap-10 md:mt-0 lg:mt-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="mb-3 text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-200">
              Food Summary
            </h1>
            <Button onClick={() => setFoodOpenModal(true)}>Add Summary</Button>
          </div>

          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Number of members</TableHead>
                <TableHead>Breads</TableHead>
                <TableHead>Curries</TableHead>
                <TableHead className="text-right">Total Ammount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {foodSummaries?.map((foodSummary) => {
                return (
                  <TableRow>
                    <TableCell className="w-[150px] font-medium">
                      {format(new Date(foodSummary.date), "PPP")}
                    </TableCell>
                    <TableCell>{foodSummary.numberOfPeople}</TableCell>
                    <TableCell>{foodSummary.totalBreads}</TableCell>
                    <TableCell>{foodSummary.totalCurries}</TableCell>
                    <TableCell className="text-right">
                      {foodSummary.totalAmount}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
        <Dialog
          open={foodOpenModal}
          onOpenChange={(open) => {
            setFoodOpenModal(open);
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
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
                      <FormItem className="flex flex-row items-start justify-between">
                        <div className="flex flex-col">
                          <Input
                            placeholder="Date"
                            value={
                              field.value ? format(field.value, "PPP") : ""
                            }
                          />
                          <FormMessage />
                        </div>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
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
                      name="breads"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Total Breads" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="curries"
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

                  <Button type="submit">Submit</Button>
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
