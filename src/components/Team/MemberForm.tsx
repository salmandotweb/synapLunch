import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Member } from "@prisma/client";
import { useForm } from "react-hook-form";
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
} from "~/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
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

interface MemberFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpenChange: (open: boolean) => void;
  selectedMember?: Member;
}

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

const MemberForm = ({
  open,
  setOpen,
  onOpenChange,
  selectedMember,
}: MemberFormProps) => {
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

      setOpen(false);
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

      setOpen(false);
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

      setOpen(false);
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  useEffect(() => {
    if (selectedMember && open) {
      form.reset({
        name: selectedMember.name,
        email: selectedMember.email,
        designation: selectedMember.designation ?? "",
        role: selectedMember.role,
      });
    } else if (selectedMember === undefined && open) {
      form.reset({
        name: "",
        email: "",
        designation: "",
      });
    }
  }, [selectedMember, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  disabled={createMember.isLoading || updateMember.isLoading}
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
  );
};

export default MemberForm;
