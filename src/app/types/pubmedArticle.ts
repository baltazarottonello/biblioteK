export type PubMedArticle = {
  pmid: number;
  title: string;
  year: number;
  status: string;
  doi?: string | null;
  month?: number | null;
  types?: PubmedPubType[] | null;
  volume?: number | null;
  issue?: number | null;
  start_page?: number | null;
  end_page?: number | null;
  abstract?: string | null;
  authors?: PubmedAuthor[] | null;
  langs?: PubmedLang[] | null;
  mesh?: PubmedMesh[] | null;
  journal?: PubmedJournal | null;
};

export type PubmedAuthor = {
  name?: string | null;
  lastname?: string | null;
  orcid?: string | null;
  affiliations?: PubmedAffiliation[] | null;
};

export type PubmedMesh = {
  name?: string | null;
  ui?: string | null;
};

export type PubmedLang = {
  name?: string | null;
};

export type PubmedPubType = {
  name?: string | null;
};

export type PubmedJournal = {
  title: string;
  country?: string | null;
  abbr?: string | null;
  issn?: string | null;
  issn_type?: string | null;
};

export type PubmedAffiliation = {
  name?: string;
};
