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

@Component({
  selector: "app-pubmed-component",
  imports: [],
  templateUrl: "./pubmed-component.html",
  styleUrl: "./pubmed-component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PubmedComponent {
  http = inject(HttpClient);
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
    this.http.get(".netlify/functions/articles").subscribe({
      next: (res: any) => {
        console.log(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
    const link = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml`;
    this.http.get(link, { responseType: "text" }).subscribe((res: any) => {
      const domParser = new DOMParser();
      const xml = domParser.parseFromString(res, "text/xml");
      this.articlesSet.set(xml);
      this.formatArticleSet();
    });
  }

  private formatArticleSet() {
    const articlesArray = [];
    const articles = this.articlesSet()?.querySelectorAll("PubmedArticle")!;
    for (let [_, value] of articles.entries()) {
      articlesArray.push(value);
    }
    console.log(articlesArray);
  }
}
