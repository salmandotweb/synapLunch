import {
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const s3Router = createTRPCRouter({
  getObjects: protectedProcedure.query(async ({ ctx }) => {
    const { s3 } = ctx;

    const listObjectsCommand = new ListObjectsCommand({
      Bucket: env.BUCKET_NAME,
    });

    return await s3.send(listObjectsCommand);
  }),
  getStandardUploadPresignedUrl: protectedProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { s3 } = ctx;

      const putObjectCommand = new PutObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: input.key,
      });

      return await getSignedUrl(s3, putObjectCommand);
    }),
  // get object url to show in browser
  getObjectUrl: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      const { s3 } = ctx;

      const command = new GetObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: input.key,
      });

      return await getSignedUrl(s3, command);
    }),
});
