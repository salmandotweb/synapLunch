"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import { api } from "~/utils/api";
import { cn } from "~/utils/cn";
import { useZodForm } from "~/utils/zod-form";
import { toast } from "~/hooks/use-toast";
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
import { companyFormSchema } from "../SetupCompany";

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export function CompanyForm() {
  const { data: company } = api.company.getCompany.useQuery();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (company) {
      form.reset({
        id: company.id,
        name: company.name,
        username: company.name,
        email: company.email,
        websiteUrl: company.website ?? "",
        breadPrice: company?.breadPrice ?? 0,
      });
    }
  }, [company]);

  const methods = useZodForm({
    schema: companyFormSchema,
  });

  const utils = api.useContext();

  const updateCompany = api.company.updateCompany.useMutation({
    onSettled: async () => {
      await utils.company.invalidate();
      methods.reset();
    },

    onSuccess: () => {
      toast({
        title: "Company updated.",
        description: "Your company has been updated.",
      });
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  function onSubmit(data: CompanyFormValues) {
    updateCompany.mutate(data);
  }
  return (
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
                This is how your name will be displayed across the platform.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="company_name" {...field} />
              </FormControl>
              <FormDescription>
                Your username will be used in your profile URL. You can only
                change it once.
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
                <Input {...field} placeholder="company@gmail.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Url</FormLabel>
              <FormControl>
                <Input {...field} placeholder="www.company.tech" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="breadPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bread Price</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="0"
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value < 0) {
                      field.onChange(0);
                    } else {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          variant="outline"
          size="sm"
          type="submit"
          disabled={updateCompany.isLoading}
        >
          Update profile
        </Button>
      </form>
    </Form>
  );
}
