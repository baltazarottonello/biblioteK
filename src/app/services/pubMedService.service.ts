import { inject, Injectable } from "@angular/core";
import { PubMedArticle } from "../types/pubmedArticle";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PubMedService {
  http = inject(HttpClient);

  getArticles(pmid: string) {
    const link = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml`;
    return this.http.get(link, { responseType: "text" });
  }

  createArticle(articles: PubMedArticle[]) {
    return this.http.post("/.netlify/functions/articles", articles);
  }
}
