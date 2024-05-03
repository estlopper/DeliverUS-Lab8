import { get, post, destroy, put } from './helpers/ApiRequestsHelper'

function getDetailProduct (id) {
  return get(`products/${id}`)
}

function getProductCategories () {
  return get('productCategories')
}

function create (data) {
  return post('/products/', data)
}

function remove (id) {
  return destroy(`/products/${id}`)
}

function update (id, data) {
  return put(`/products/${id}`, data)
}

export { getDetailProduct, getProductCategories, create, remove, update }
