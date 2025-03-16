import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const fetchDataRouter = createTRPCRouter({
    fetchData: publicProcedure
      .input(z.object({
        placeholder: z.string(),
      }))
      .query(async ({ input }) => {
        console.log("Input received:", input);
  
        const { placeholder } = input;
  
        return {
          message: `You provided the placeholder: ${placeholder}`,
          success: true,
        };
      }),
  });
  