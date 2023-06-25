import { FC, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { RiAddFill } from "react-icons/ri";
import { z } from "zod";

import { api } from "~/utils/api";
import { useZodForm } from "~/utils/zod-form";
import { toast } from "~/hooks/use-toast";
import { Button } from "~/ui/button";
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
  id: z.string().optional(),
  companyId: z.string().optional(),
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

const AddTeamMember: FC = ({}) => {
  const { data: companyId } = api.company.getCompanyId.useQuery();

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

      methods.reset();
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  useEffect(() => {
    if (companyId) {
      form.reset({
        companyId: companyId,
      });
    }
  }, [companyId]);

  function onSubmit(data: MemeberFormValues) {
    createMember.mutate(data);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <RiAddFill />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>Add a new member to your team.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMember;
