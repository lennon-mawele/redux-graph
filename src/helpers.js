import { curry, get, isPlainObject, isString, now, pickBy, reduce, set } from 'lodash'
import { omit, pick } from 'lodash/fp'
import { setIn } from 'cape-redux'
import { isEntityCreated, getTripleError, isValidId, isValidType } from './lang'

export const REF = '_ref'
export const REFS = '_refs'

// Generate a new random key. Probably unique.
export function nextId() {
  return Math.random().toString(36).substr(6)
  .substring(1, 9)
}
export function getKey({ type, id }) {
  return `${type}_${id}`
}
export const pickTypeId = pick([ 'dateModified', 'id', 'type' ])
export function requireIdType(props, typeId = null, doPick = true) {
  if (!isPlainObject(props)) throw new Error('Must pass an object.')
  if (!isValidType(props.type)) {
    console.error(props)
    throw new Error('Must have a valid type.')
  }
  if (!isValidId(props.id)) throw new Error('Must have a valid id.')
  if (typeId && props.type !== typeId) throw new Error('Wrong entity type.')
  return doPick ? pickTypeId(props) : null
}
export function getPath(item) {
  requireIdType(item, null, false)
  return [ item.type, item.id ]
}
export function getRefPath(predicate, obj) {
  if (!isString(predicate)) throw new Error('predicate must be a string.')
  return !obj ? [ REF, predicate ] : [ REFS, predicate, getKey(obj) ]
}
export function fullRefPath(subj, predicate, obj) {
  return getPath(subj).concat(getRefPath(predicate, obj))
}
export function setRef(subject, predicate, obj) {
  return setIn(getRefPath(predicate), subject, pickTypeId(obj))
}
export function setRefs(subject, predicate, obj) {
  return setIn(getRefPath(predicate, obj), subject, pickTypeId(obj))
}
export function buildRef(result, val, predicate) {
  // Does not support merging previously set REF field.
  if (isEntityCreated(val)) return setRef(result, predicate, val)
  return set(result, predicate, val)
}
// Get predicate from an entity.
export function getRef(node, predicate) {
  if (!isString(predicate)) throw new Error('getRef() predicate must be a string.')
  return get(node, [ REF, predicate ])
}
export function getRefs(node, predicate) {
  return get(node, [ REFS, predicate ])
}
// First is the object you are looking for.
export const refMatch = curry((ref, obj) =>
  obj && obj.id === ref.id && obj.type === ref.type
)
export const hasPredicate = curry((predicate, subject, node) =>
  refMatch(subject, getRef(node, predicate))
)
export const predicateFilter = curry((predicate, obj, collection) =>
  pickBy(collection, hasPredicate(predicate, obj))
)
// Split out triple refs because the need to be handled in the reducer.
export function buildRefs(entity) {
  return reduce(entity, buildRef, {})
}
export const indexFields = { rangeIncludes: {}, [REF]: {}, [REFS]: {} }
export const rmRefs = omit([ REF, REFS ])

// Add fields required for save.
export function insertFields(data = {}) {
  return {
    type: 'Thing',
    ...indexFields,
    ...buildRefs(data),
    dateCreated: data.dateCreated ? data.dateCreated : now(),
    id: data.id ? data.id : nextId(),
  }
}
export function updateFields(data) {
  return {
    ...buildRefs(data),
    dateModified: data.dateModified ? data.dateModified : now(),
  }
}
export function uniqEntity(type) { return insertFields({ type }) }

export function tripleErr(triple) {
  const errMsg = getTripleError(triple)
  if (errMsg) throw new Error(errMsg)
}
export function buildTriple(triple) {
  tripleErr(triple)
  return {
    subject: pickTypeId(triple.subject),
    predicate: triple.predicate,
    object: pickTypeId(triple.object),
  }
}

export function rangePath(obj, predicate, subj, subjKey) {
  const key = subjKey || getKey(subj)
  return getPath(obj).concat([ 'rangeIncludes', predicate, key ])
}
export function setRangeIncludes(prevState, obj, predicate, subj, subjKey) {
  return setIn(rangePath(obj, predicate, subj, subjKey), prevState, subj)
}
