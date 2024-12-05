import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import puppeteer from 'puppeteer';

export const pdfRouter = createTRPCRouter({
  generatePdf: publicProcedure
    .input(z.object({
      htmlContent: z.string(),
    }))
    .mutation(async ({ input }) => {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for running in a Docker container
      });
      const page = await browser.newPage();
      await page.setContent(input.htmlContent, { waitUntil: 'networkidle0' }); // Ensure all subresources are loaded.
      const pdfBuffer = await page.pdf({
        format: 'Letter', 
        printBackground: true,  
        margin: {  
          top: "20mm",  
          right: "20mm",  
          bottom: "20mm",  
          left: "20mm"   
        },
        displayHeaderFooter: true, 
        headerTemplate: '<div style="font-size:10px; text-align: center; width: 100%; padding: 5px;"></div>',
        footerTemplate: '<div style="font-size:10px; text-align: center; width: 100%; padding: 5px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
        // scale: 0.8,  
      });
      
      await browser.close();
      return Buffer.from(pdfBuffer).toString('base64');
    }),
});

