import { Context } from "@netlify/functions";
import { supabase } from "./db.mjs";
import { PubMedArticle } from "../../src/app/types/pubmedArticle";

export default async (req: Request, context: Context) => {
  try {
    if (req.method === "POST") {
      //TODO: insert logic
      const body: PubMedArticle[] = await req.json();

      const supabaseResponse = await supabase.rpc(
        "bulk_insert_pubmed_articles",
        { p_data: body }
      );

      if (supabaseResponse.error) {
        console.log(supabaseResponse);
        throw new Error(supabaseResponse.error.message);
      }

      return new Response(JSON.stringify(body), {
        status: 200,
      });
    }
  } catch (e: any) {
    console.log(e);
    return new Response(e.message, {
      status: e.status ?? 500,
    });
  }
};
