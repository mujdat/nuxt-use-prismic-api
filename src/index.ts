import { ref, useContext, useFetch } from '@nuxtjs/composition-api'

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

export const usePrismicApi = (payload: PayloadObject) => {
  const { $prismic } = useContext()

  const generatePaginationObjectFromResponse = (response: PartialResponseObject) => {
    return {
      page: response.page,
      results_per_page: response.results_per_page,
      results_size: response.results_size,
      total_results_size: response.total_results_size,
      total_pages: response.total_pages,
      next_page: response.next_page,
      prev_page: response.prev_page
    }
  }

  if (payload && payload.method === 'query') {
    const dynamicQueryDataObject = ref<any>({
      [`${payload.data}`] : []
    })
    const dynamicQueryPaginationObject = ref<any>({
      [`${payload.data}PaginationObject`] : {}
    })
    const dynamicQueryLoadingStateObject = ref<any>({
      [`${payload.data}Loading`] : {}
    })
    const dynamicQueryErrorStateObject = ref<any>({
      [`${payload.data}Error`] : {}
    })
    const getPredicatesQuery = (predicates: string | undefined) => {
      if (predicates && predicates === 'at') {
        return $prismic.api.query($prismic.predicates.at(`${payload?.query?.path}`, payload?.query?.queryValue), payload?.query?.options)
      } else if (predicates && predicates === 'any') {
        return $prismic.api.query($prismic.predicates.any(`${payload?.query?.path}`, payload?.query?.queryValue), payload?.query?.options)
      } else if (predicates && predicates === 'not') {
        return $prismic.api.query($prismic.predicates.not(`${payload?.query?.path}`, payload?.query?.queryValue), payload?.query?.options)
      } else if (predicates && predicates === 'in') {
        return $prismic.api.query($prismic.predicates.in(`${payload?.query?.path}`, payload?.query?.queryValue), payload?.query?.options)
      }
    }
    useFetch(async () => {
      try {
      dynamicQueryLoadingStateObject.value[`${payload.data}Loading`].state = ref<Boolean>(true)
      const response = await getPredicatesQuery(payload.query?.predicates)
        if (response) {
          dynamicQueryPaginationObject.value[`${payload.data}PaginationObject`].data = {...generatePaginationObjectFromResponse(response)}
          if(response.results && response.results.length) {
            response.results.forEach((result: ResultObject) => {
            dynamicQueryDataObject.value[`${payload.data}`].push(result)
            })
          }
        }
      dynamicQueryLoadingStateObject.value[`${payload.data}Loading`].state = ref<Boolean>(false)
      } catch (error: any) {
        dynamicQueryErrorStateObject.value[`${payload.data}Error`].status = error.status
        dynamicQueryLoadingStateObject.value[`${payload.data}Loading`].state = ref<Boolean>(false)
      }
    })
    const paginationFunctionObject = ref<any>({
      [`${payload.data}PaginationFunction`]: (url: string) => {
        try {
          dynamicQueryLoadingStateObject.value[`${payload.data}Loading`].state = ref<Boolean>(true)
          if (url) {
            fetch(url)
            .then((response) => response.json())
            .then((data) => {
              if (data) {
                dynamicQueryDataObject.value[`${payload.data}`].splice(0, dynamicQueryDataObject.value[`${payload.data}`].length)
                data.results.forEach((result: ResultObject) => {
                  dynamicQueryDataObject.value[`${payload.data}`].push(result)
                })
                dynamicQueryPaginationObject.value[`${payload.data}PaginationObject`].data = {}
                dynamicQueryPaginationObject.value[`${payload.data}PaginationObject`].data = {...generatePaginationObjectFromResponse(data)}
              }
            })
            dynamicQueryLoadingStateObject.value[`${payload.data}Loading`].state = ref<Boolean>(false)
          } else {
            return null
          }
        } catch (error: any) {
          dynamicQueryErrorStateObject.value[`${payload.data}Error`].status = error.status
        }
      }
    })
    return {
      ...dynamicQueryDataObject.value,
      ...dynamicQueryPaginationObject.value,
      ...paginationFunctionObject.value,
      ...dynamicQueryLoadingStateObject.value,
      ...dynamicQueryErrorStateObject.value
    }
  }
}
