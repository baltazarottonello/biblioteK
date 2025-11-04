import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { RouterService } from "@app/services/routerService.service";
import { ProfileMenuComponent } from "../profile-menu-component/profile-menu-component";

@Component({
  selector: "app-main-component",
  imports: [
    RouterOutlet,
    RouterLink,
    MatButtonModule,
    MatGridListModule,
    MatSidenavModule,
    MatIconModule,
    ProfileMenuComponent,
  ],
  templateUrl: "./main-component.html",
  styleUrl: "./main-component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  navOpen = signal(false);
  routerService = inject(RouterService);

  toggleNav() {
    this.navOpen.update(() => (this.navOpen() ? false : true));
  }
}
