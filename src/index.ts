import { ref, useContext, useFetch } from '@nuxtjs/composition-api'

interface ResponsePaginationObject {
  page: string
  results_per_page: string
  results_size: string
  total_results_size: string
  total_pages: string
  next_page: string
  prev_page: string
}

interface ResultObject {
  id: string
  uid: string
  url: string
  type: string
  href: string
  tags: string[]
  first_publication_date: string
  last_publication_date: string
  slugs: string[]
  linked_documents: [] | string[]
  lang: string
  alternate_languages: string[]
  data?: any
}

interface PayloadObject {
  data: string
  method: 'query' | 'getByUID' | 'getByID'
  query?: {
    predicates: 'any' | 'at' | 'not'
    path: string
    queryValue?: string | string[] | number
    options?: {
      after?: number
      fetch?: string | string[]
      fetchLinks?: string
      page?: number
      pageSize?: number
      orderings?: string
      lang?: string
      ref?: string
    }
  }
  docType?: string
  uid?: string
  id?: string
  ids?: string[]
}

export const usePrismicAPI = (payload: PayloadObject) => {
  const { $prismic } = useContext()

  if (payload && payload.method === 'query') {
    const dynamicQueryDataObject = ref<any>({
      [`${payload.data}`]: [],
    })
    const dynamicQueryPaginationObject = ref<any>({
      [`${payload.data}Pagination`]: {},
    })
    const dynamicQueryLoadingStateObject = ref<any>({
      [`${payload.data}Loading`]: {},
    })
    const dynamicQueryErrorStateObject = ref<any>({
      [`${payload.data}Error`]: {},
    })
    const generatePaginationObjectFromResponse = (
      response: ResponsePaginationObject
    ) => {
      return {
        page: response.page,
        results_per_page: response.results_per_page,
        results_size: response.results_size,
        total_results_size: response.total_results_size,
        total_pages: response.total_pages,
        next_page: response.next_page,
        prev_page: response.prev_page,
      }
    }
    const getPredicatesQuery = (predicates: string | undefined) => {
      if (predicates && predicates === 'at') {
        return $prismic.api.query(
          $prismic.predicates.at(
            `${payload?.query?.path}`,
            payload?.query?.queryValue
          ),
          payload?.query?.options
        )
      } else if (predicates && predicates === 'any') {
        return $prismic.api.query(
          $prismic.predicates.any(
            `${payload?.query?.path}`,
            payload?.query?.queryValue
          ),
          payload?.query?.options
        )
      } else if (predicates && predicates === 'not') {
        return $prismic.api.query(
          $prismic.predicates.not(
            `${payload?.query?.path}`,
            payload?.query?.queryValue
          ),
          payload?.query?.options
        )
      } else if (predicates && predicates === 'in') {
        return $prismic.api.query(
          $prismic.predicates.in(
            `${payload?.query?.path}`,
            payload?.query?.queryValue
          ),
          payload?.query?.options
        )
      }
    }
    useFetch(async () => {
      try {
        dynamicQueryLoadingStateObject.value[`${payload.data}Loading`].state =
          ref<Boolean>(true)
        const response = await getPredicatesQuery(payload.query?.predicates)
        if (response) {
          dynamicQueryPaginationObject.value[`${payload.data}Pagination`].data =
            { ...generatePaginationObjectFromResponse(response) }
          if (response.results && response.results.length) {
            response.results.forEach((result: ResultObject) => {
              dynamicQueryDataObject.value[`${payload.data}`].push(result)
            })
          }
        }
        dynamicQueryLoadingStateObject.value[`${payload.data}Loading`].state =
          ref<Boolean>(false)
      } catch (error: any) {
        dynamicQueryErrorStateObject.value[`${payload.data}Error`].status =
          error.status
        dynamicQueryLoadingStateObject.value[`${payload.data}Loading`].state =
          ref<Boolean>(false)
      }
    })
    const refetchDataFunctionObject = ref<any>({
      [`${payload.data}RefetchData`]: (url: string) => {
        try {
          dynamicQueryLoadingStateObject.value[`${payload.data}Loading`].state =
            ref<Boolean>(true)
          if (url) {
            fetch(url)
              .then((response) => response.json())
              .then((data) => {
                if (data) {
                  dynamicQueryDataObject.value[`${payload.data}`].splice(
                    0,
                    dynamicQueryDataObject.value[`${payload.data}`].length
                  )
                  data.results.forEach((result: ResultObject) => {
                    dynamicQueryDataObject.value[`${payload.data}`].push(result)
                  })
                  dynamicQueryPaginationObject.value[
                    `${payload.data}Pagination`
                  ].data = {}
                  dynamicQueryPaginationObject.value[
                    `${payload.data}Pagination`
                  ].data = { ...generatePaginationObjectFromResponse(data) }
                }
              })
            dynamicQueryLoadingStateObject.value[
              `${payload.data}Loading`
            ].state = ref<Boolean>(false)
          } else {
            return null
          }
        } catch (error: any) {
          dynamicQueryErrorStateObject.value[`${payload.data}Error`].status =
            error.status
        }
      },
    })
    return {
      ...dynamicQueryDataObject.value,
      ...dynamicQueryPaginationObject.value,
      ...refetchDataFunctionObject.value,
      ...dynamicQueryLoadingStateObject.value,
      ...dynamicQueryErrorStateObject.value,
    }
  } else if (payload && payload.method === 'getByUID') {
    const dynamicGetByUIDDataObject = ref<any>({
      [`${payload.data}`]: [],
    })
    const dynamicGetByUIDLoadingStateObject = ref<any>({
      [`${payload.data}Loading`]: [],
    })
    const dynamicGetByUIDErrorStateObject = ref<any>({
      [`${payload.data}Error`]: [],
    })
    useFetch(async () => {
      try {
        dynamicGetByUIDLoadingStateObject.value[
          `${payload.data}Loading`
        ].splice(0, 0, true)
        dynamicGetByUIDErrorStateObject.value[`${payload.data}Error`].splice(
          0,
          1,
          false
        )
        const response = await $prismic.api.getByUID(
          payload.docType,
          payload.uid
        )
        if (response) {
          dynamicGetByUIDDataObject.value[`${payload.data}`].push(response)
          dynamicGetByUIDLoadingStateObject.value[
            `${payload.data}Loading`
          ].splice(0, 1, false)
          dynamicGetByUIDErrorStateObject.value[`${payload.data}Error`].splice(
            0,
            1,
            false
          )
        }
      } catch (error: any) {
        dynamicGetByUIDLoadingStateObject.value[
          `${payload.data}Loading`
        ].splice(0, 1, false)
        dynamicGetByUIDErrorStateObject.value[`${payload.data}Error`].splice(
          0,
          1,
          true
        )
      }
    })
    return {
      ...dynamicGetByUIDDataObject.value,
      ...dynamicGetByUIDLoadingStateObject.value,
      ...dynamicGetByUIDErrorStateObject.value,
    }
  } else if (payload && payload.method === 'getByID') {
    const dynamicGetByIDDataObject = ref<any>({
      [`${payload.data}`]: [],
    })
    const dynamicGetByIDLoadingStateObject = ref<any>({
      [`${payload.data}Loading`]: [],
    })
    const dynamicGetByIDErrorStateObject = ref<any>({
      [`${payload.data}Error`]: [],
    })
    useFetch(async () => {
      try {
        dynamicGetByIDLoadingStateObject.value[`${payload.data}Loading`].splice(
          0,
          0,
          true
        )
        dynamicGetByIDErrorStateObject.value[`${payload.data}Error`].splice(
          0,
          0,
          false
        )
        const response = await $prismic.api.getByID(payload.id)
        if (response) {
          dynamicGetByIDDataObject.value[`${payload.data}`].push(response)
          dynamicGetByIDLoadingStateObject.value[
            `${payload.data}Loading`
          ].splice(0, 1, false)
        }
      } catch (error: any) {
        dynamicGetByIDLoadingStateObject.value[`${payload.data}Loading`].splice(
          0,
          1,
          false
        )
        dynamicGetByIDErrorStateObject.value[`${payload.data}Error`].splice(
          0,
          1,
          true
        )
      }
    })
    return {
      ...dynamicGetByIDDataObject.value,
      ...dynamicGetByIDLoadingStateObject.value,
      ...dynamicGetByIDErrorStateObject.value,
    }
  }
}
