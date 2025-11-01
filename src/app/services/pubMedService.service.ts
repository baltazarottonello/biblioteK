import { inject, Injectable, signal } from "@angular/core";
import { PubMedArticle } from "../types/pubmedArticle";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";

@Injectable({
  providedIn: "root",
})
export class PubMedService {
  ready = signal(false);
  http = inject(HttpClient);

  getArticles(pmid: string, qty = 1) {
    const link = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml`;
    return qty < 200
      ? this.http.get(link, { responseType: "text" })
      : this.http.post(link, { responseType: "text" });
  }

  createArticle(articles: PubMedArticle[]) {
    return this.http.post(`${environment.apiUrl}/articles`, articles);
  }
}
