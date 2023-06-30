import type { NextApiRequest, NextApiResponse } from "next";
import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";

const auth = (req: NextApiRequest, res: NextApiResponse) => ({ id: "fakeId" });

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req, res }) => {
      const user = await auth(req, res);

      if (!user) throw new Error("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
