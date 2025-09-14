import { Context } from "@netlify/functions";
import { supabase } from "./db.mjs";

export default async (req: Request, context: Context) => {
  try {
    if (req.method === "POST") {
      const body = await req.json();

      const supabaseResponse = await supabase
        .from("pubmed_articles")
        .insert(body);

      if (supabaseResponse.error) {
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
