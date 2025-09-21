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
import {
  PubMedArticle,
  PubmedAuthor,
  PubmedLang,
  PubmedMesh,
  PubmedPubType,
} from "../../types/pubmedArticle";
import { PubMedService } from "../../services/pubMedService.service";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import {
  ReactiveFormsModule,
  FormsModule,
  FormControl,
  Validators,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { concatMap, delay, from, map, of, switchMap } from "rxjs";

@Component({
  selector: "app-pubmed-component",
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
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
  formattedArticles = signal<PubMedArticle[]>([]);
  csvUploaded = signal(false);
  csvConverted = signal(false);
  loading = signal(false);

  pmidFormControl = new FormControl("", [Validators.required]);
  toCsvFormControl = new FormControl("", [Validators.required]);

  async readFile(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const fileList = inputElement.files as FileList;
    const [file] = fileList;
    file.text().then((data: string) => {
      this.ids.set(data);
      this.csvUploaded.set(true);
    });
  }

  toCsv(data: any) {
    if (this.toCsvFormControl.invalid) {
      this.toCsvFormControl.markAsTouched();
      return;
    }
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
    this.csvConverted.set(true);
  }

  downloadCsv() {
    this.downloadCsvLink()?.nativeElement.click();
  }

  //TODO: if more than about 200 UIDs are to be provided, the request should be made using the HTTP POST method.
  searchPmid(pmid: string) {
    if (this.pmidFormControl.invalid && !this.csvUploaded()) {
      this.pmidFormControl.markAsTouched();
      return;
    }

    if (this.ids().length >= 200) {
      const idsArray = this.ids().split(",");
      const chunkSize = idsArray.length / 100 > 1 ? 100 : idsArray.length;
      const chunksQty = Math.ceil(idsArray.length / chunkSize);

      const chunks = [];

      let counter = 0;
      for (let i = 0; i < chunksQty; i++) {
        const chunk = [];
        for (let j = 0; j < chunkSize; j++) {
          if (counter >= idsArray.length) break;
          chunk.push(idsArray[counter]);
          counter++;
        }
        chunks.push(chunk);
      }
      this.loading.set(true);
      from(chunks)
        .pipe(
          concatMap((chunk) =>
            this.pubmedService.getArticles(chunk.join(","), chunk.length).pipe(
              map((res: any) => {
                const domParser = new DOMParser();
                const xml = domParser.parseFromString(res, "text/xml");
                this.articlesSet.set(xml);
                this.formatArticleSet();
                return this.formattedArticles();
              }),
              concatMap((articles) =>
                this.pubmedService.createArticle(articles)
              ),
              delay(500)
            )
          )
        )
        .subscribe({
          next: (res: any) => {
            console.log("insertado");
          },
          error: (e) => {
            console.error(e);
            this.loading.set(false);
          },
          complete: () => this.loading.set(false),
        });
    } else {
      this.pubmedService
        .getArticles(pmid)
        .pipe(
          map((res: any) => {
            const domParser = new DOMParser();
            const xml = domParser.parseFromString(res, "text/xml");
            this.articlesSet.set(xml);
            this.formatArticleSet();
            return this.formattedArticles();
          }),
          switchMap((articles) => this.pubmedService.createArticle(articles))
        )
        .subscribe({
          next: (res: any) => {},
          error: (e) => console.error(e),
        });
    }
  }

  private formatArticleSet() {
    //TODO: handle PubmedBookArticle as well
    const articleSet = this.articlesSet()?.querySelectorAll("PubmedArticle")!;
    const articlesXml = [];
    const articles: PubMedArticle[] = [];
    for (let [_, value] of articleSet.entries()) {
      articlesXml.push(value);
    }

    for (let [_, value] of articlesXml.entries()) {
      const pmid = parseInt(value.querySelector("PMID")?.textContent?.trim()!);
      const title = value.querySelector("ArticleTitle")?.textContent?.trim()!;
      const year = parseInt(
        value.querySelector("DateRevised > Year")?.textContent?.trim()!
      );
      const status = value
        .querySelector("MedlineCitation")
        ?.attributes.getNamedItem("Status")
        ?.value?.trim()!;
      const doi = this.extractDoi(value);
      const month = this.extractMonth(value);
      const types = this.extractTypes(value);
      const volume = this.extractVolume(value);
      const issue = this.extractIssue(value);
      const start_page = this.extractStartPage(value);
      const end_page = this.extractendPage(value);
      const abstractXmlString = this.extractAbstractXmlString(value);
      const authors = this.extractAuthors(value);
      const languages = this.extractLanguages(value);
      const mesh = this.extractMesh(value);
      const journal = this.extractJournalData(value);

      const article: PubMedArticle = {
        pmid,
        title,
        year,
        status,
        doi,
        month,
        types,
        volume,
        issue,
        start_page,
        end_page,
        abstract: abstractXmlString,
        authors,
        langs: languages,
        mesh,
        journal,
      };
      articles.push(article);
      this.formattedArticles.set(articles);
    }
  }

  private extractDoi(xml: Element) {
    let doi = null;
    const doiOption1 = xml.querySelector('ELocationID[EIdType="doi"]');
    const doiOption2 = xml.querySelector('ArticleId[IdType="doi"]');

    if (doiOption1) {
      doi = doiOption1.textContent?.trim() ?? null;
    }

    if (doiOption2) {
      doi = doiOption2.textContent?.trim() ?? null;
    }

    return doi;
  }

  private extractMonth(xml: Element) {
    const raw = xml.querySelector("DateRevised > Month")?.textContent?.trim();
    return raw ? parseInt(raw) : null;
  }

  private extractTypes(xml: Element) {
    const types = Array.from(
      xml.querySelectorAll("PublicationTypeList > PublicationType")
    )
      .map((type) => {
        const name = type.textContent?.trim() ?? null;
        return { name };
      })
      .filter((t) => t.name);

    return types.length > 0 ? types : null;
  }

  private extractVolume(xml: Element) {
    const volume = xml.querySelector("Volume")?.textContent?.trim();
    return volume ? parseInt(volume) : null;
  }

  private extractIssue(xml: Element) {
    const issue = xml.querySelector("Issue")?.textContent?.trim();
    return issue ? parseInt(issue) : null;
  }

  private extractStartPage(xml: Element) {
    const startPage = xml.querySelector("StartPage")?.textContent?.trim();
    return startPage ? parseInt(startPage) : null;
  }

  private extractendPage(xml: Element) {
    const endPage = xml.querySelector("EndPage")?.textContent?.trim();
    return endPage ? parseInt(endPage) : null;
  }

  private extractAbstractXmlString(xml: Element) {
    const abstract = xml.querySelector("Abstract")?.outerHTML!;
    return abstract ?? null;
  }

  private extractAuthors(xml: Element) {
    const authors: PubmedAuthor[] | null = [];
    const authorsEl = xml.querySelectorAll("Author");

    if (authorsEl) {
      for (let [_, value] of authorsEl.entries()) {
        const name = value.querySelector("ForeName")?.textContent;
        const lastname = value.querySelector("LastName")?.textContent;
        const orcid =
          value.querySelector('Identifier[Source="ORCID"]')?.textContent ??
          null;
        const affiliations = this.extractAffiliations(value);
        authors.push({ name, lastname, orcid, affiliations });
      }
      return authors;
    } else return null;
  }

  private extractAffiliations(xml: Element) {
    const affiliationsNodeList = xml.querySelectorAll(
      "AffiliationInfo > Affiliation"
    );

    const affiliations = [];
    console.log();
    if (affiliationsNodeList.length > 0) {
      for (let [_, aff] of affiliationsNodeList.entries()) {
        const affiliation = aff.textContent?.trim();
        affiliations.push({ name: affiliation });
      }
      return affiliations;
    } else return null;
  }

  private extractLanguages(xml: Element) {
    const languageEl = xml.querySelectorAll("Article > Language");

    const languages: PubmedLang[] = [];

    if (languageEl.length > 0) {
      for (let [_, lang] of languageEl.entries()) {
        const language = lang.textContent?.trim();
        languages.push({ name: language });
      }
      return languages;
    } else return null;
  }

  private extractMesh(xml: Element) {
    const descriptorsList = xml.querySelectorAll(
      "MeshHeadingList > MeshHeading > DescriptorName[UI]"
    );

    const meshHeadings: PubmedMesh[] = [];

    if (descriptorsList.length > 0) {
      for (let [_, descriptor] of descriptorsList.entries()) {
        const descriptorName = descriptor.textContent?.trim();
        const descriptorUi = descriptor.attributes
          .getNamedItem("UI")
          ?.value?.trim();
        meshHeadings.push({ name: descriptorName, ui: descriptorUi });
      }
      return meshHeadings;
    } else return null;
  }

  private extractJournalData(xml: Element) {
    const journalEl = xml.querySelector("Journal");
    const title = journalEl!.querySelector("Title")!.textContent!.trim()!;
    const country = xml
      .querySelector("MedlineJournalInfo > Country")
      ?.textContent?.trim();
    const abbr = journalEl
      ?.querySelector("ISOAbbreviation")
      ?.textContent?.trim();
    const issn = journalEl?.querySelector("ISSN")?.textContent?.trim();
    const issn_type = journalEl
      ?.querySelector("ISSN")
      ?.attributes.getNamedItem("IssnType")
      ?.value.trim();
    return {
      title,
      country,
      abbr,
      issn,
      issn_type,
    };
  }
}
