export type PubMedArticle = {
  pmid: number;
  title: string;
  year: number;
  status: string;
  doi?: string;
  authors?: string;
  month?: number;
  lang?: string;
  type?: string;
  mesh?: string;
  volume?: number;
  issue?: number;
  startPage?: number;
  endPage?: number;
  abstract?: string;
};
