import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { NgTemplateOutlet } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PubMedService } from "@app/services/pubMedService.service";
import { debounceTime, tap, Subject, switchMap } from "rxjs";
import { MatTableModule } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { ArticleAuthorsDialog } from "../article-authors-dialog/article-authors-dialog";

@Component({
  selector: "app-pubmed-articles-dashboard-component",
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink,
    NgTemplateOutlet,
    FormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./pubmed-articles-dashboard-component.html",
  styleUrl: "./pubmed-articles-dashboard-component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PubmedArticlesDashboardComponent implements OnInit {
  pubmedService = inject(PubMedService);
  searchSubject = new Subject<string>();
  nextPageSubject = new Subject<string>();
  query: string = "";
  searchResults: WritableSignal<any> = signal(null);
  loading = signal(false);
  pages: WritableSignal<any[]> = signal([]);
  currentPage = signal(0);
  columnsToDisplay = ["pmid", "title", "journal", "authors", "year"];
  paginationButtonsDisabled = signal(false);
  dialog = inject(MatDialog);

  ngOnInit() {
    this.searchSubject
      .pipe(
        tap(() => this.loading.set(true)),
        debounceTime(300),
        switchMap((query) =>
          this.pubmedService.searchTerm({
            term: query,
          })
        )
      )
      .subscribe((response: any) => {
        this.loading.set(false);
        this.searchResults.set(response);
        this.pages.set([response]);
        this.currentPage.set(1);
      });
    this.nextPageSubject
      .pipe(
        tap(() => this.paginationButtonsDisabled.set(true)),
        debounceTime(300),
        switchMap(() => {
          const last = this.searchResults().last;
          return this.pubmedService.searchTerm({
            term: this.query,
            last: last,
          });
        })
      )
      .subscribe({
        next: (response: any) => {
          this.paginationButtonsDisabled.set(false);
          this.pages.update((currentPagesOfResults) => [
            ...currentPagesOfResults,
            response,
          ]);
          this.currentPage.update((currentPage) => currentPage + 1);
          this.searchResults.update(() => response);
        },
        error: () => this.paginationButtonsDisabled.set(false),
      });
  }

  onInput(e: Event) {
    if (this.query) {
      this.searchSubject.next(this.query);
    }
  }

  previousPage() {
    this.searchResults.update(() => {
      this.currentPage.update((prev) => prev - 1);
      const previous = this.pages()[this.currentPage() - 1];
      return previous;
    });
  }

  nextPage() {
    if (this.currentPage() < this.pages().length) {
      this.searchResults.update(() => {
        const next = this.pages()[this.currentPage()];
        this.currentPage.update((prev) => prev + 1);
        return next;
      });
    } else {
      this.nextPageSubject.next("next");
    }
  }

  openAuthorsDialog(article: any) {
    this.dialog.open(ArticleAuthorsDialog, {
      width: "400px",
      data: {
        article,
      },
    });
  }
}
