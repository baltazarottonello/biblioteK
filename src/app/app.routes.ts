import { Routes } from "@angular/router";
import { MainComponent } from "./components/main-component/main-component";
import { PubmedArticlesImportComponent } from "./components/pubmed-articles-import-component/pubmed-articles-import-component";
import { DashboardComponent } from "./components/dashboard/dashboard-component";
import { ArticlesComponent } from "./components/articles-component/articles-component";
import { PubmedArticlesDashboardComponent } from "./components/pubmed-articles-dashboard-component/pubmed-articles-dashboard-component";

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
        path: "articles/pubmed",
        component: PubmedArticlesDashboardComponent,
      },
      {
        path: "articles/pubmed/import",
        component: PubmedArticlesImportComponent,
      },
    ],
  },
];
