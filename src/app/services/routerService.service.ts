import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class RouterService {
  router = inject(Router);

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
