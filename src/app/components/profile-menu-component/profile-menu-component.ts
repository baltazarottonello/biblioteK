import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-profile-menu-component",
  imports: [MatIconModule],
  templateUrl: "./profile-menu-component.html",
  styleUrl: "./profile-menu-component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent {}
