import { Routes } from "@angular/router";
import { MainComponent } from "./components/main-component/main-component";
import { ArticlesComponent } from "./components/articles-component/articles-component";
import { DashboardComponent } from "./components/dashboard/dashboard-component";

export const routes: Routes = [
  {
    path: "",
    component: MainComponent,
    children: [
      { path: "", component: DashboardComponent },
      {
        path: "articles",
        component: ArticlesComponent,
      },
      {
        path: "dashboard",
        component: DashboardComponent,
      },
    ],
  },
];
