// src/server/api/routers/searchRouter.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Client } from "typesense";

// Create Typesense client
const typesense = new Client({
  nodes: [{ 
    host: 'q8joz0kp2hix69esp-1.a1.typesense.net', 
    port: '443', 
    protocol: 'https' 
  }],
  apiKey: 'GUAbBTuteJRVjAjiknBibPzD9iFCb72s',  // Search Only API Key
  connectionTimeoutSeconds: 5
});

export const searchRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        queryBy: z.string().optional(),
        filterBy: z.string().optional(),
        perPage: z.number().optional(),
        facetBy: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const searchParams = {
          q: input.query,
          query_by: input.queryBy || 'course_name,folder_name,document_name,content',
          highlight_full_fields: 'content,course_name,folder_name,document_name',
          highlight_affix_num_tokens: 10,
          highlight_start_tag: '<mark>',
          highlight_end_tag: '</mark>',
          facet_by: input.facetBy || 'semester_code,department',
          filter_by: input.filterBy || '',
          per_page: input.perPage || 20
        };

        const results = await typesense
          .collections('course_documents')
          .documents()
          .search(searchParams);

        return results;
      } catch (error) {
        throw new Error(`Search failed: ${error.message}`);
      }
    }),
});