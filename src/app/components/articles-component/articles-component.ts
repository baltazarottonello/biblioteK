import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-articles-component",
  imports: [MatIconModule, MatButtonModule, RouterLink],
  templateUrl: "./articles-component.html",
  styleUrl: "./articles-component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlesComponent {}
