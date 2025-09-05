import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";

@Component({
  selector: "app-main-component",
  imports: [],
  templateUrl: "./main-component.html",
  styleUrl: "./main-component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  httpClient = inject(HttpClient);
  response = signal<string | null>(null);

  search(pmid: string) {
    return this.httpClient
      .get(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&api_key=d238f49f7b64cb19863b746cc46c04e5af08	`,
        { responseType: "text" }
      )
      .subscribe({
        next: (xml: string) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xml, "application/xml");

          // Ejemplo: obtener el título del artículo
          const authorList = xmlDoc.querySelector("AuthorList");

          const response: string[] = [];

          authorList?.querySelectorAll("Author").forEach((el) => {
            const affiliation = el.querySelector(
              "AffiliationInfo > Affiliation"
            );

            if (
              affiliation?.textContent?.includes("Italiano") &&
              affiliation?.textContent?.includes("Buenos Aires")
            ) {
              const foreName = el.querySelector("ForeName")?.textContent;
              const lastName = el.querySelector("LastName")?.textContent;

              response.push(
                `${foreName} ${lastName} — ${affiliation.textContent}<br/>`
              );
            }
            this.response.set(response.join(""));
          });
        },
        error: (err) => console.error(err),
      });
  }
}
