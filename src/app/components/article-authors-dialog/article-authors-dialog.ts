import {
  ChangeDetectionStrategy,
  Component,
  inject,
  INJECTOR,
  OnInit,
} from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableModule } from "@angular/material/table";
import { MatAnchor } from "@angular/material/button";

@Component({
  selector: "app-article-authors-dialog",
  imports: [MatTableModule, MatAnchor],
  templateUrl: "./article-authors-dialog.html",
  styleUrl: "./article-authors-dialog.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleAuthorsDialog {
  data = inject(MAT_DIALOG_DATA);
  columnsToDisplay = ["name", "lastname", "orcid"];
}
