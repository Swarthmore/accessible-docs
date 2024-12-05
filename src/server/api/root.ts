import { postRouter } from "~/server/api/routers/post";
import { createTRPCRouter } from "~/server/api/trpc";
import { pdfRouter } from "./routers/pdfRouter";
import { fetchDataRouter } from "./routers/dataFetchRouter";
import { storageRouter } from "./routers/storageRouter";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  pdf: pdfRouter,
  fetchData: fetchDataRouter,
  
});

// export type definition of API
export type AppRouter = typeof appRouter;
