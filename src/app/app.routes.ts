import { Routes } from "@angular/router";
import { MainComponent } from "./components/main-component/main-component";
import { PubmedComponent } from "./components/pubmed-component/pubmed-component";

export const routes: Routes = [
  {
    path: "",
    component: MainComponent,
    children: [
      {
        path: "pubmed",
        component: PubmedComponent,
      },
    ],
  },
];
