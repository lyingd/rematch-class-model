# rematch-class-model

Now we can get a model like this:
```javascript
import { dispatch } from '@rematch/core'
import { select } from '@rematch/select'
import { RematchClassModel, reducer, effect, selector, subscription } from './RematchClassModel'

// origin model
export const visibilityFilter = {
  state: 'SHOW_ALL',
  reducers: {
    setVisibilityFilter(state, payload) {
      return payload
    }
  }
}

// class model
@RematchClassModel
export class todos {
  name = 'todos' // required
  state = []
  @reducer
  addTodo(text) {
    return [
      ...this.state,
      {
        text,
        completed: false
      }
    ]
  }
  @reducer
  toggleTodo(index) {
    return this.state.map((todo, i) => {
      if (i === index) {
        return Object.assign({}, todo, {
          completed: !todo.completed
        })
      }
      return todo
    })
  }
  @selector
  getTodoCount(rootState) {
    return this.state.length
  }
  @effect
  async addTodoAsync(text, rootState) {
    console.log(rootState)
    console.log(this.state)
    await new Promise(resolve => {
      setTimeout(resolve, 1000)
    })
    this.addTodo(text)
    console.log(this.getTodoCount())
    console.log(select.todos.getTodoCount(rootState))
  }
  @subscription
  'visibilityFilter/setVisibilityFilter'(action, state, unsubscribe) {
    console.log(action)
    this.addTodo(action.type)
    this.addTodoAsync(`${action.type} async`)
    unsubscribe()
  }
}
```

Amazing!
**this** always points to an instance of class, so it's no different from using a normal class, and you can get full autocomplete.

# Inspiration
from [resa](https://github.com/wangtao0101/resa)
