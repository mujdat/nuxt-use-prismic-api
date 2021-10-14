# Nuxt usePrismicApi
A handy little composable to query data from any Prismic API on your Nuxt.js application. This composable allows you to query data from any Prismic API and abstracts the process a little further to make it easy to retreive and display data on your Nuxt application. It works for both SSR and Static Nuxt applications (v2.15.7 or above, including Nuxt 3!) that are using `@nuxtjs/composition-api` and `@nuxtjs/prismic` modules.

## Installation
Make sure you have [@nuxtjs/composition-api](https://composition-api.nuxtjs.org) and [@nuxt/prismic](https://prismic.nuxtjs.org/installation) modules installed. After that, install this package via npm or Yarn with the following commands.

### npm:

```bash
npm i nuxt-use-prismic-api
```

### Yarn:

```bash
yarn add nuxt-use-prismic-api
```

### Import
Import it at any page or component you want to use like this:

```js
import { usePrismicApi } from 'nuxt-use-prismic-api'
```

## Usage

I tried to make the syntax for queries as simple as possible and also as similar as possible to the original Prismic API references. I'll go over and show examples of for each method below. I highly recommend taking a look at the official [Prismic Documentation](https://prismic.io/docs) for references mentioned below.

### Query
The composable exports a function called `usePrismicApi()` and it takes a payload object as a parameter.

The payload object may look like this for a given query:
```ts
{
  data: string,
  method: string,
  query: {
    predicates: string,
    path: string,
    queryValue: string | string[],
    options: {
      page: number,
      pageSize: number
    }
  }
}
```

The `data` property is the dynamic variable that is exported by the `usePrismicApi()` function. Basically, the exported constant can be named by the user. Queries return an array of objects and the value of the data property is used as a prefix for **Pagination**, **Loading** and **Error** objects as well as **RefetchData** function. Let's take look at an example query below.

```js
const {
  blogPosts,
  blogPostsPagination,
  blogPostsRefetchData,
  blogPostsLoading,
  blogPostsError,
} = usePrismicApi({
  data: 'blogPosts',
  method: 'query',
  query: {
    predicates: 'at',
    path: 'document.type',
    queryValue: 'blog_post',
    options: {
      page: 1,
      pageSize: 50
    },
  },
})
```

In the example above, the `data` property is named `blogPosts` which is going to be exported as a constant which can then be used within a template. Since this is a query that returns an array of objects, there is a dynamically named pagination object as `blogPostsPagination` which includes all the pagination data from the API. If there is no need to build a complex pagination and but a simple next and previous page navigation, then `blogPostsRefetchData()` function can be called and `next_page` and `prev_page` values from the `blogPostsPagination` can be given as a parameter. The function then does a refetch of the given page and returns the new data from the API. The `query` object must be present if your selected method is query. The `query` object takes in the key - value pairs as in the example above. For predicates, path and queryValue you can refer to the official Prismic Documentation. They are explained very well in there but in order to make it clear here is a rundown of what's actually happening in the example above.

The query is sent with a predicates value of `'at`' which looks at a specific `path` which in this case is a `document.type` and the queryValue is set as `blog_post` that means this query is looking for documents with the type `blog_post`. The `queryValue` for some of these predicates can be different. For example `any`, takes in an array of strings instead of just a string in the case of `at`.

Currently only `at`, `any`, `not` and `in` predicates are supported but I'm working on adding other predicates as well.

### getByUID

This is a very handy method that uses the getByUID helper function which returns a single object of a specified document type with a given UID. It's great for creating a single blog post page. Here is an example getByUID method with this composable.

```js
const { singleBlogPost, singleBlogPostLoading, singleBlogPostError } = usePrismicApi({
  data: 'singleBlogPost',
  method: 'getByUID',
  docType: 'blog_post',
  uid: 'my-first-blog-post'
})
```
In this example, there is no query object since our method is `getByUID`. Here, we just need to specify `docType` and the `uid` values. These can also be given dynamically. In fact, for a single blog post page, the `uid` value would most likely come in form of a `param` from the parent page.

Currently only `getByUID` is supported but I'm working on adding `getByID`, `getByIDs` and other helper functions as well.
