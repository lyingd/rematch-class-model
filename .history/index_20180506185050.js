import { getState } from '@rematch/core'

export const RematchClassModel = (ModelClass) => {
  const instance = new ModelClass()
  const name = instance.name
  if (!name) {
    throw new Error('name props is required!')
  }
  const state = instance.state
  const rematchModel = {
    //name,
    state,
    reducers: {},
    selectors: {},
    effects: {},
    subscriptions: {},
  }
  for (const key of Object.getOwnPropertyNames(ModelClass.prototype)) {
    if (key !== 'constructor') {
      const fn = instance[key]
      const type = fn.rematch
      switch (type) {
        case 'reducer':
          rematchModel.reducers[key] = WrapReducer(fn, instance)
          break;
        case 'effect':
        case 'selector':
        case 'subscription':
          rematchModel[`${type}s`][key] = WrapOthers(fn, instance)
          break;
      }
    }
  }
  return rematchModel
}

export const effect = (targe, name, descriptor) => {
  let origin = descriptor.value
  descriptor.value = async function (payload, rootState) {
    this.state = rootState[self.name]
    return await origin.call(this, payload, rootState)
  }
  descriptor.value.rematch = 'effect'
  return descriptor
}

export const reducer = (targe, name, descriptor) => {
  let origin = descriptor.value
  descriptor.value = function (state, payload) {
    this.state = state
    const newState = origin.call(this, payload, state)
    this.state = newState
    return newState
  }
  descriptor.value.rematch = 'reducer'
  return descriptor
}

export const selector = (targe, name, descriptor) => {
  let origin = descriptor.value
  descriptor.value = function (...args) {
    const [state] = args
    if (args.length > 0) {
      this.state = state
    }
    const rootState = getState()
    return origin.call(this, rootState)
  }
  descriptor.value.rematch = 'selector'
  return descriptor
}

export const subscription = (targe, name, descriptor) => {
  let origin = descriptor.value
  descriptor.value = function (action, state, unsubscribe) {
    return origin.call(this, action, state, unsubscribe)
  }
  descriptor.value.rematch = 'subscription'
  return descriptor
}

const WrapReducer = (fn, self) => function (...args) {
  if (!self.isCopyReducers) {
    Object.assign(self, this)
    self.isCopyReducers = true
  }
  return fn.apply(self, args)
}
const WrapOthers = (fn, self) => function (...args) {
  if (!self.isCopyOthers) {
    Object.assign(self, this)
    self.isCopyOthers = true
  }
  return fn.apply(self, args)
}
