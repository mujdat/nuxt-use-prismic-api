export interface ResultObject {
  id: string
  uid: string
  url: string
  type: string
  href: string
  tags: string[]
  first_publication_date: string
  last_publication_date: string
  slugs: string[]
  linked_documents: []
  lang: string
  alternate_languages: string[]
  data?: any
}

export interface PartialResponseObject {
  page: string
  results_per_page: string
  results_size: string
  total_results_size: string
  total_pages: string
  next_page: string
  prev_page: string
}

export interface QueryObject {
  predicates: 'any' | 'at' | 'not'
  path: string
  queryValue?: string | string[] | number
  options?: {
    after: number
    fetch: string | string[]
    fetchLinks: string
    page: number
    pageSize: number
    orderings: string
    lang: string
    ref: string
  }
}

export interface PayloadObject {
  data: string
  method: 'query' | 'getByID' | 'getByIDs' | 'getByUID'
  query?: QueryObject
  id?: string
  ids?: string[]
  uid?: string
  docType?: string
}

export interface PredicatesObject {
  at: any
  any: any
  not: any
  in: any
}
