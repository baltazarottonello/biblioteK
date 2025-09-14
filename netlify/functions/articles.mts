import { Context } from "@netlify/functions";
import { supabase } from "./db.mjs";

export default async (req: Request, context: Context) => {
  try {
    if (req.method === "GET") {
      const supabaseResponse = supabase.from("pubmed_articles").select("*");

      return new Response(JSON.stringify("OK"), {
        status: 200,
      });
    }
  } catch (e: any) {
    return new Response(null, {
      status: e.status ?? 500,
    });
  }
};
