import { ary, get, isEmpty, omit, partialRight, reduce } from 'lodash'
import { createReducer } from 'cape-redux'
import { merge, setIn } from 'cape-lodash'

import {
  ENTITY_DEL, ENTITY_PUT, ENTITY_PUTALL, ENTITY_UPDATE, TRIPLE_DEL, TRIPLE_PUT } from './actions'
import {
  getKey, fullRefPath, getPath, setRangeIncludes, rangePath, REF, REFS, pickTypeId,
} from './helpers'

// Update `rangeIncludes` values on object entity.
export function updateRefObjs(state, item) {
  if (isEmpty(item[REF])) return state
  const key = getKey(item)
  const subj = pickTypeId(item)
  const updateRange = partialRight(setRangeIncludes, subj, key)
  return reduce(item[REF], ary(updateRange, 3), state)
}
export function mergeIndexes(oldItem, item) {
  if (!oldItem) return item
  return {
    ...item,
    [REF]: merge(oldItem[REF], item[REF]),
    [REFS]: merge(oldItem[REFS], item[REFS]),
    rangeIncludes: merge(oldItem.rangeIncludes, item.rangeIncludes),
  }
}
// Insert or replace entity.
export function entityPutReducer(state, item) {
  const path = getPath(item)
  // I'm not so sure you want to mergeIndexes here? How do you know when to delete?
  const node = mergeIndexes(get(state, path), item)
  const newState = setIn(path, state, node)
  return updateRefObjs(newState, node)
}
export function entityPutAllReducer(state, payload) {
  return reduce(payload, entityPutReducer, state)
}
// An object node was updated. Update predicate values on subject.
export function updateSubjRef(state, subj, predicate, obj) {
  const refPath = fullRefPath(subj, predicate)
  if (get(state, refPath)) return setIn(refPath, state, obj)
  const refsPath = fullRefPath(subj, predicate, obj)
  return setIn(refsPath, state, obj)
}
// Update `_refs` values on subject entities.
export function updateRangeSubjs(state, item) {
  if (isEmpty(item.rangeIncludes)) return state
  const obj = pickTypeId(item)
  function updateSubj(prevState, subjs, predicate) {
    return reduce(subjs, (ste, subj) => updateSubjRef(ste, subj, predicate, obj), prevState)
  }
  return reduce(item.rangeIncludes, updateSubj, state)
}
export function entityUpdateReducer(state, item) {
  const path = getPath(item)
  const oldItem = get(state, path)
  const newItem = mergeIndexes(oldItem, item)
  const node = merge(oldItem, newItem)
  const newState = setIn(path, state, node)
  return updateRangeSubjs(updateRefObjs(newState, node), node)
}
export function delAt(path, state) {
  const omitKey = path.pop()
  return setIn(path, state, omit(get(state, path), omitKey))
}
export function delRange(state, obj, predicate, subj) {
  // console.log('pred', predicate, obj, subj)
  return delAt(rangePath(obj, predicate, subj), state)
}
// Remove from all rangeIncludes.
export function delRanges(state, item) {
  if (isEmpty(item[REF])) return state
  return reduce(item[REF], ary(partialRight(delRange, item), 3), state)
}
export function entityDelReducer(state, item) {
  const entity = get(state, getPath(item))
  return delAt(getPath(item), delRanges(state, entity))
}

export function putRef(state, subject, predicate, object) {
  return setIn(fullRefPath(subject, predicate), state, object)
}
// Single vs many?
export function putRefs(state, triple) {
  const { single, subject, predicate, object } = triple
  if (single) return putRef(state, subject, predicate, object)
  const ste1 = setIn(fullRefPath(subject, predicate, object), state, object)
  return setRangeIncludes(ste1, object, predicate, subject)
}

export function delRefs(state, triple) {
  const { single, subject, predicate, object } = triple
  if (single) return delAt(fullRefPath(subject, predicate), state)
  // @TODO REFS DEL
  return delAt(fullRefPath(subject, predicate, object), state)
}

export const reducers = {
  [ENTITY_PUT]: entityPutReducer,
  [ENTITY_UPDATE]: entityUpdateReducer,
  [ENTITY_DEL]: entityDelReducer,
  [ENTITY_PUTALL]: entityPutAllReducer,
  [TRIPLE_DEL]: delRefs,
  [TRIPLE_PUT]: putRefs,
}
const reducer = createReducer(reducers)
export default reducer
