import React, { FC, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { GetSessionParams, getSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import { useFieldArray, useForm } from "react-hook-form";
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

export const foodFormSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  breadsAmount: z
    .string({
      required_error: "Breads Amount is required",
    })
    .nonempty({
      message: "Breads Amount is required",
    })
    .refine((val) => parseInt(val) >= 0, {
      message: "Breads Amount can't be negative",
    }),
  curriesAmount: z
    .string({
      required_error: "Curries Amount is required",
    })
    .nonempty({
      message: "Curries Amount is required",
    })
    .refine((val) => parseInt(val) >= 0, {
      message: "Curries Amount can't be negative",
    }),
  extraStuff: z.string().optional(),
  extraMembers: z
    .array(
      z.object({
        numberOfMembers: z
          .string({
            required_error: "Number of Members is required",
          })
          .nonempty({
            message: "Number of Members is required",
          }),
        relatedTo: z
          .string({
            required_error: "Related To is required",
          })
          .nonempty({
            message: "Related To is required",
          }),
      }),
    )
    .optional(),
  totalAmount: z
    .string({
      required_error: "Total Ammount is required",
    })
    .nonempty({
      message: "Total Ammount is required",
    }),
  membersBroughtFood: z.array(z.string()).optional(),
});

type FoodFormValues = z.infer<typeof foodFormSchema>;

function generateRandomString(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const foodSummary: FC = () => {
  const ref = useRef(null);
  const [foodOpenModal, setFoodOpenModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: company } = api.company.getCompany.useQuery();
  const { data: foodSummaries, isFetching: fetchingFoodSummaries } =
    api.foodSummary.getAllFoodSummary.useQuery({
      companyId: company?.id ?? "",
    });
  const { data: members } = api.member.getTeamMembers.useQuery({
    companyId: company?.id ?? "",
  });
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const { mutateAsync: fetchPresignedUrls, isLoading: fetchingPresignedUrl } =
    api.s3.getStandardUploadPresignedUrl.useMutation();

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    maxFiles: 1,
    maxSize: 5 * 2 ** 30, // roughly 5GB
    multiple: false,
    onDropAccepted: (files, _event) => {
      const uuid = generateRandomString(50);

      fetchPresignedUrls({
        key: uuid,
      })
        .then((url) => {
          setPresignedUrl(url);
          setFileKey(uuid);
        })
        .catch((err) => console.error(err));
    },
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

  const { fields, append } = useFieldArray({
    name: "extraMembers",
    control: form.control,
  });

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
      methods.reset();
      form.reset({
        membersBroughtFood: [],
        extraMembers: [],
      });
      acceptedFiles.length = 0;
      setPresignedUrl(null);
      setFileKey(null);
      setSubmitting(false);
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });

      setSubmitting(false);
    },
  });

  const onSubmit = async (data: FoodFormValues) => {
    try {
      setSubmitting(true);
      if (acceptedFiles.length > 0 && presignedUrl !== null) {
        const file = acceptedFiles[0] as File;
        await axios.put(presignedUrl, file.slice(), {
          headers: { "Content-Type": file.type },
        });
      }

      const membersDidNotBringFood = members?.filter(
        (member) => !data.membersBroughtFood?.includes(member.id),
      );

      createFoodSummary.mutate({
        companyId: company?.id ?? "",
        membersDidNotBringFood:
          membersDidNotBringFood?.map((member) => member.id) ?? [],
        ...data,
        fileKey: fileKey ?? null,
      });
    } catch (err) {
      setSubmitting(false);
      console.error(err);
    }
  };

  useEffect(() => {
    const breadsAmount = form.watch("breadsAmount");
    const curriesAmount = form.watch("curriesAmount");
    const extraStuff = form.watch("extraStuff") ?? 0;

    if (breadsAmount && curriesAmount) {
      const totalAmount =
        Number(breadsAmount) + Number(curriesAmount) + Number(extraStuff);
      form.setValue("totalAmount", totalAmount.toString());
    } else {
      form.setValue("totalAmount", "");
    }
  }, [
    form.watch("breadsAmount"),
    form.watch("curriesAmount"),
    form.watch("extraStuff"),
  ]);

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
                  breads: foodSummary.totalBreadsAmount,
                  curries: foodSummary.totalCurriesAmount,
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
          <DialogContent className="sm:max-w-[600px]s overflow-y-auto sm:max-h-[90vh]">
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
                              "ml-0 w-full pl-3 text-left font-normal",
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

                  <div
                    className="flex w-full items-center justify-center"
                    {...getRootProps()}
                  >
                    <label
                      htmlFor="dropzone-file"
                      className="dark:hover:bg-bray-800 flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                    >
                      <div className="flex flex-col items-center justify-center pb-6 pt-5">
                        {acceptedFiles.length > 0 ? (
                          acceptedFiles.map((file) => {
                            return (
                              <div className="flex flex-col items-center justify-center">
                                <svg
                                  aria-hidden="true"
                                  className="mb-3 h-10 w-10 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                  ></path>
                                </svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold">
                                    {file.name}
                                  </span>{" "}
                                  ({file.size} bytes)
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <>
                            <svg
                              aria-hidden="true"
                              className="mb-3 h-10 w-10 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              ></path>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">
                                Click to upload reciept
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              SVG, PNG, JPG or GIF (MAX. 800x400px)
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        {...getInputProps()}
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 place-items-stretch gap-4">
                    <FormField
                      control={form.control}
                      name="breadsAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Total Breads Amount"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {company?.breadPrice !== 0 &&
                              `Each bread costs Rs. ${company?.breadPrice}`}
                          </FormDescription>
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
                            <Input
                              placeholder="Total Curries Amount"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="extraStuff"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Extra Stuff Amount"
                              {...field}
                            />
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
                            <Input
                              placeholder="Total Amount"
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormLabel>Extra Members</FormLabel>
                    <FormDescription>
                      Add extra members and who they are related to.
                    </FormDescription>
                    {fields.map((field, index) => (
                      <div className="my-4 grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          key={field.id}
                          name={`extraMembers.${index}.numberOfMembers`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Number of Members"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`extraMembers.${index}.relatedTo`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Related To" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {members?.map((member) => (
                                    <SelectItem value={member.id}>
                                      {member.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => append({} as any)}
                    >
                      Add Extra Members
                    </Button>
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
                                                ...(field.value || []),
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
                      disabled={
                        createFoodSummary.isLoading ||
                        fetchingPresignedUrl ||
                        submitting
                      }
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
