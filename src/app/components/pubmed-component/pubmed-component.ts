import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  signal,
  ViewChild,
  viewChild,
} from "@angular/core";
import { PubMedArticle } from "../../types/pubmedArticle";
import { PubMedService } from "../../services/pubMedService.service";

@Component({
  selector: "app-pubmed-component",
  imports: [],
  templateUrl: "./pubmed-component.html",
  styleUrl: "./pubmed-component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PubmedComponent {
  pubmedService = inject(PubMedService);
  downloadCsvLink = viewChild<ElementRef>("downloadCsvLink");
  showDownloadCsvButton = signal(false);
  renderer = inject(Renderer2);
  ids = signal("");
  articlesSet = signal<Document | null>(null);
  async readFile(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const fileList = inputElement.files as FileList;
    const [file] = fileList;
    file.text().then((data: string) => {
      this.ids.set(data);
    });
  }

  toCsv(data: any) {
    const formattedData = data.replaceAll(" ", "\n").split("\n").join(",");

    const blob = new Blob([formattedData], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    this.renderer.setAttribute(
      this.downloadCsvLink()?.nativeElement,
      "href",
      url
    );
    this.renderer.setAttribute(
      this.downloadCsvLink()?.nativeElement,
      "download",
      "datos.csv"
    );
    this.showDownloadCsvButton.set(true);
  }

  downloadCsv() {
    this.downloadCsvLink()?.nativeElement.click();
  }

  //TODO: if more than about 200 UIDs are to be provided, the request should be made using the HTTP POST method.
  searchPmid(pmid: string) {
    this.pubmedService.getArticles(pmid).subscribe({
      next: (res: any) => {
        const domParser = new DOMParser();
        const xml = domParser.parseFromString(res, "text/xml");
        this.articlesSet.set(xml);
        this.formatArticleSet();
      },
      error: (e) => console.error(e),
    });
  }

  private formatArticleSet() {
    const articleSet = this.articlesSet()?.querySelectorAll("PubmedArticle")!;
    const articlesXml = [];
    const articles: PubMedArticle[] = [];
    for (let [_, value] of articleSet.entries()) {
      articlesXml.push(value);
    }

    for (let [_, value] of articlesXml.entries()) {
      const pmid = parseInt(value.querySelector("PMID")?.innerHTML!);
      const title = value.querySelector("ArticleTitle")?.innerHTML!;
      const year = parseInt(
        value.querySelector("DateRevised")!.querySelector("Year")?.innerHTML!
      );
      const status = value
        .querySelector("MedlineCitation")
        ?.attributes.getNamedItem("Status")?.value!;
      const article = {
        pmid,
        title,
        year,
        status,
      };
      articles.push(article);
    }

    this.pubmedService.createArticle(articles).subscribe({
      next: (res: any) => console.log(res),
      error: (e) => console.error(e),
    });
  }
}
