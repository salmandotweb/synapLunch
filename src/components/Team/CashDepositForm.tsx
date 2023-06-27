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

type CashDepositFormProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpenChange: (open: boolean) => void;
  selectedMember?: Member;
};

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

type CashDepositFormValues = z.infer<typeof cashDepositFormSchema>;

const CashDeposit = ({
  open,
  setOpen,
  onOpenChange,
  selectedMember,
}: CashDepositFormProps) => {
  const ref = useRef(null);

  const [showCalendar, setShowCalendar] = useState(false);

  const cashDepositForm = useForm<CashDepositFormValues>({
    resolver: zodResolver(cashDepositFormSchema),
    mode: "onChange",
  });

  const cashDepositMethods = useZodForm({
    schema: cashDepositFormSchema,
  });

  const utils = api.useContext();

  const createCashDeposit = api.member.addCashDeposit.useMutation({
    onSettled: async () => {
      await utils.member.invalidate();
      cashDepositMethods.reset();
    },

    onSuccess: () => {
      toast({
        title: "Cash Deposit created.",
      });

      setOpen(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                    setOpen(false);
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
  );
};

export default CashDeposit;
