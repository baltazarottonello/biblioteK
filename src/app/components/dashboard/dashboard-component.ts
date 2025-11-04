import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-dashboard-component",
  imports: [MatIconModule, MatButtonModule, RouterLink],
  templateUrl: "./dashboard-component.html",
  styleUrl: "./dashboard-component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
