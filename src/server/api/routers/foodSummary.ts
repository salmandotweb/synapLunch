import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { env } from "~/env.mjs";
import { foodFormSchema } from "~/pages/food-summary";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const UPLOAD_MAX_FILE_SIZE = 1000000;

const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: "http://localhost:9000",
  forcePathStyle: true,
  credentials: {
    accessKeyId: "S3RVER",
    secretAccessKey: "S3RVER",
  },
});

export const foodSummaryRouter = createTRPCRouter({
  getAllFoodSummary: protectedProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.foodSummary.findMany({
        where: {
          companyId: input.companyId,
        },
        orderBy: {
          date: "desc",
        },
      });
    }),

  createFoodSummary: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        membersDidNotBringFood: z.array(z.string()),
        ...foodFormSchema.shape,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const totalExtraMembers = input.extraMembers?.map((member) => {
        return member.numberOfMembers;
      });

      const sumOfExtraMembers = totalExtraMembers?.reduce(
        (accumulator, currentValue) => accumulator + parseInt(currentValue),
        0,
      );

      const extraMembersRelatedTo = input.extraMembers?.map((member) => {
        return member.relatedTo;
      });

      const foodSummary = ctx.prisma.foodSummary.create({
        data: {
          date: input.date,
          totalBreadsAmount: Number(input.breadsAmount),
          totalCurriesAmount: Number(input.curriesAmount),
          extraMembers: sumOfExtraMembers,
          extraMembersRelatedTo: {
            connect: extraMembersRelatedTo?.map((memberId) => {
              return {
                id: memberId,
              };
            }),
          },
          totalAmount: Number(input.totalAmount),
          company: {
            connect: {
              id: input.companyId,
            },
          },
          membersBroughtFood: {
            connect: input.membersBroughtFood?.map((memberId) => {
              return {
                id: memberId,
              };
            }),
          },
          membersDidntBringFood: {
            connect: input.membersDidNotBringFood.map((memberId) => {
              return {
                id: memberId,
              };
            }),
          },
        },
      });

      const members = await ctx.prisma.member.findMany({
        where: {
          id: {
            in: input.membersDidNotBringFood,
          },

          companyId: input.companyId,
        },
      });

      const roundedTotalAmount = Math.round(Number(input.totalAmount));

      const totalBreadAmount = Number(input.breadsAmount);

      const remainingAmount = roundedTotalAmount - totalBreadAmount;

      const amountToBeDeducted = remainingAmount / members.length;

      const roundedAmountToBeDeducted = Math.round(amountToBeDeducted);

      const updateCompanyBalance = ctx.prisma.company.update({
        where: {
          id: input.companyId,
        },
        data: {
          balance: {
            decrement: totalBreadAmount,
          },
        },
      });

      await updateCompanyBalance;

      const updateMemberBalancePromises = members.map((member) => {
        return ctx.prisma.member.update({
          where: {
            id: member.id,
          },

          data: {
            balance: member.balance - roundedAmountToBeDeducted,
          },
        });
      });

      await Promise.all(updateMemberBalancePromises);

      return foodSummary;
    }),

  deleteFoodSummary: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const getSummary = await ctx.prisma.foodSummary.findUnique({
        where: {
          id: input.id,
        },

        include: {
          membersDidntBringFood: true,
        },
      });

      const deleteSummary = ctx.prisma.foodSummary.delete({
        where: {
          id: input.id,
        },
      });

      await deleteSummary;

      const updateCompanyBalance = ctx.prisma.company.update({
        where: {
          id: getSummary?.companyId,
        },
        data: {
          balance: {
            increment: getSummary?.totalBreadsAmount,
          },
        },
      });

      await updateCompanyBalance;

      // update members balance who did not bring food
      const updateMemberBalancePromises = getSummary?.membersDidntBringFood.map(
        (member) => {
          return ctx.prisma.member.update({
            where: {
              id: member.id,
            },

            data: {
              balance: {
                increment:
                  getSummary?.totalCurriesAmount /
                  getSummary.membersDidntBringFood.length,
              },
            },
          });
        },
      );

      await Promise.all(updateMemberBalancePromises || []);

      return true;
    }),
  createPresignedUrl: protectedProcedure
    .input(z.object({ foodSummaryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.prisma.foodSummary.findUnique({
        where: {
          id: input.foodSummaryId,
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Food Summary not found",
        });
      }

      const imageId = uuidv4();
      await ctx.prisma.receipt.create({
        data: {
          date: new Date(),
          receipt: imageId,
          FoodSummary: {
            connect: {
              id: input.foodSummaryId,
            },
          },
        },
      });

      return createPresignedPost(s3Client, {
        Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
        Key: imageId,
        Fields: {
          key: imageId,
        },
        Conditions: [
          ["starts-with", "$Content-Type", "image/"],
          ["content-length-range", 0, UPLOAD_MAX_FILE_SIZE],
        ],
      });
    }),
});
