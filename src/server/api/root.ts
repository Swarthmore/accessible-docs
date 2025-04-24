// src/server/api/root.ts
import { postRouter } from "~/server/api/routers/post";
import { createTRPCRouter } from "~/server/api/trpc";
import { pdfRouter } from "./routers/pdfRouter";
import { fetchDataRouter } from "./routers/dataFetchRouter";
import { searchRouter } from "./routers/searchRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  pdf: pdfRouter,
  fetchData: fetchDataRouter,
  search: searchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;