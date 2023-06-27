import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Member } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/utils/api";
import { cn } from "~/utils/cn";
import { useZodForm } from "~/utils/zod-form";
import { toast } from "~/hooks/use-toast";
import { AlertDialogHeader } from "~/ui/alert-dialog";
import { Button } from "~/ui/button";
import { Calendar } from "~/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  useFormField,
} from "~/ui/form";
import { Input } from "~/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/select";

type TopupFormProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpenChange: (open: boolean) => void;
};

export const topupFormSchema = z.object({
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
  topupBy: z.string().nonempty({
    message: "Topup By is required",
  }),
});

type TopupFormValues = z.infer<typeof topupFormSchema>;

const TopupForm = ({ open, setOpen, onOpenChange }: TopupFormProps) => {
  const ref = useRef(null);

  const { data: companyId } = api.company.getCompanyId.useQuery();
  const { data: members } = api.member.getTeamMembers.useQuery({
    companyId: companyId ?? "",
  });

  const [showCalendar, setShowCalendar] = useState(false);

  const topupForm = useForm<TopupFormValues>({
    resolver: zodResolver(topupFormSchema),
    mode: "onChange",
  });

  const topupMethods = useZodForm({
    schema: topupFormSchema,
  });

  const utils = api.useContext();

  const createTopup = api.company.addTopup.useMutation({
    onSettled: async () => {
      await utils.company.invalidate();
      topupMethods.reset();
    },

    onSuccess: () => {
      toast({
        title: "Topup Added.",
      });

      setOpen(false);
      topupForm.reset({});
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  function onTopupSubmit(data: TopupFormValues) {
    createTopup.mutate({
      ...data,
      companyId: companyId ?? "",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Topup</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...topupForm}>
            <form
              onSubmit={topupForm.handleSubmit(onTopupSubmit)}
              className="space-y-6"
            >
              <FormField
                control={topupForm.control}
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
                            date > new Date() || date < new Date("1900-01-01")
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
                control={topupForm.control}
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

              <FormField
                control={topupForm.control}
                name="topupBy"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-[100%]">
                        <SelectValue placeholder="Topup By" />
                      </SelectTrigger>
                      <SelectContent>
                        {members?.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    topupForm.reset({});
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={createTopup.isLoading}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TopupForm;
