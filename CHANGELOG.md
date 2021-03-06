## [2.13.0]

* `entityUpdateFields(entity, fields)` Will update an entity based on the fields object only.

## [2.12.1]

*  Re: `tripleDel()`. `delRefs()` should delete REF field instead of setting `null` value.

## [2.12.0]

* `tripleDel()` action.

## [2.11.0]

* `triplePut()` now accepts a `single` boolean property within the triple object to signify if it should be added to as a singular ref or multiple refs.
* `getPath()` 2nd arg can be a fieldId.

## [2.10.0]

* `isValidId()` accepts 3 string ids.
* Bump some package versions.

## [2.9.0]

* Trying to fix callstack issue with `buildFullEntity()`. Limiting depth 0 on refs instead of 1 as before.

## [2.8.1]

* Trying to fix callstack issue with `buildFullEntity()`.

## [1.6.2]

* fix entity update reducer function.

## [1.6.0]

* `create(dispatch, entity)` creates a triple or entity. To skip the conditional check use `createEntity()` directly.
* `selectorCreate(entityBuilder)` takes thunk action signature and passes result of `entityBuilder(getState())` to create.

## [1.4.3]

* `rebuildEntitiesSelector()`. Same as `rebuildEntity` but takes an collection of entities.

## [1.4.2]

* Added `entityDomainIncludes(entityIdSelector)`. Basically the opposite of `rebuildEntity()`.
* Added `key0` and `val0` to allow getting the first key or value of an object like array[0]. Obviously if the object has more than one key there is no promise of key order.

## [1.4.1]

* Fixed bug in reducer where objects were mutated instead of re-created.
* Added `rebuildEntity()`

## [1.4.0]

* Added `buildTypeIndex(entities)`. Returns object grouped by type and then keyed by id.
* Added `tripleTypeIndexSelector(selector)` is a selector builder that will return a typeIndex.

## [1.3.1]

* Cleanup of `create(dispatch, entity)` that will add add subject first before `createTriple`.
* Added `splitEntity()` that will return `{ subject, triples }`.

## [1.3.0]

* Added `entityHasType(typeId, entity)` curried function to check is valid entity with certain type.
* Improve validation of `isTriple` to check for plain object first.
* Now throwing error if first  arg is not a function on `createIfNew(dispatch, entity)` and `createTriple`.
* `createIfNew` and `create` now return reduced entity where triple object fields are removed.

## [1.2.1]
This is prep for version 2 where each entity will be stored in its own type index.

* `selectTypeIndex(state)` returns object keyed by entity type property.
* `entityTypeSelector(typeId)(state)` selector creator returns selector that will return only entity type specified.

## [1.2.0]
> 2016-08-20

Added several helper functions.

* `create()` will create required triples and objects.
* `createIfNew()` will dispatch new entity if it doesn't have an id field.
* `createTriple()` will dispatch new entities and triples.
* `nextId()` generate a new random key. Probably unique.
* `isEntity()` is the object an entity.
* `isEntityCreated()` does the entity have an id field. Second arg to check dateCreated prop.
* `isTriple()` validate triple object.
* `insertFields()` add fields (id and dateCreate) required for save.

## [1.1.0]
> 2016-07-26

* Allowed using `UPDATE` to create new entity if one is not found.
* Updated packages.

## [1.1.0]
> 2016-06-16

* Added triple action helper `buildTriple()` that is applied to both `put()` and `putAll()` actions.
* Updated packages.

## [1.0.1]
> 2016-04-07

Initial Release
