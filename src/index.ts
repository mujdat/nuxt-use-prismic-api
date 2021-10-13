import { ref, useContext, useFetch } from '@nuxtjs/composition-api'
import { PayloadObject, PartialResponseObject, ResultObject, PredicatesObject } from './types'

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

  if (payload && payload.method === 'query' && payload.query) {
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

    const prismicApiQueryPredicates: PredicatesObject = {
      at: $prismic.api.query($prismic.predicates.at(`${payload?.query?.path}`, payload?.query?.queryValue), payload?.query?.options),
      any: $prismic.api.query($prismic.predicates.any(`${payload?.query?.path}`, payload?.query?.queryValue), payload?.query?.options),
      not: $prismic.api.query($prismic.predicates.not(`${payload?.query?.path}`, payload?.query?.queryValue), payload?.query?.options),
      in: $prismic.api.query($prismic.predicates.in(`${payload?.query?.path}`, payload?.query?.queryValue), payload?.query?.options),
    }

    useFetch(async () => {
      try {
        dynamicQueryLoadingStateObject.value[`${payload.data}Loading`].state = ref<Boolean>(true)
        const response = payload?.query?.predicates === 'at' ? await prismicApiQueryPredicates.at
                       : payload?.query?.predicates === 'any' ? await prismicApiQueryPredicates.any
                       : payload?.query?.predicates === 'not' ? await prismicApiQueryPredicates.not
                       : null;
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
  } else if (payload && payload.method === 'getByUID') {
    const dynamicGetByUIDDataObject = ref<any>({
      [`${payload.data}`] : {}
    })
    const dynamicGetByUIDLoadingStateObject = ref<any>({
      [`${payload.data}Loading`] : {}
    })
    const dynamicGetByUIDErrorStateObject = ref<any>({
      [`${payload.data}Error`] : {}
    })
    useFetch(async () => {
      try {
        dynamicGetByUIDLoadingStateObject.value[`${payload.data}Loading`].state = ref<Boolean>(true)
        const response = await $prismic.api.getByUID(payload.docType, payload.uid)
        if (response) {
          dynamicGetByUIDDataObject.value[`${payload.data}`].data = response
        }
        dynamicGetByUIDLoadingStateObject.value[`${payload.data}Loading`].state = ref<Boolean>(false)
      } catch (error: any) {
        dynamicGetByUIDLoadingStateObject.value[`${payload.data}Loading`].state = ref<Boolean>(false)
        dynamicGetByUIDErrorStateObject.value[`${payload.data}Error`].status = error.status
      }

    })
    return {
      ...dynamicGetByUIDDataObject.value,
      ...dynamicGetByUIDLoadingStateObject.value,
      ...dynamicGetByUIDLoadingStateObject.value
    }
  }
}
