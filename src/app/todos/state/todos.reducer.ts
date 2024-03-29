import { createReducer, on } from '@ngrx/store';
import { TodosApiActions, TodosPageActions } from '.';
import { initialTodos, Todo } from '../model';

export const todosStateFeatureKey = 'todosState';

export interface TodosState {
  todos: Todo[];
}

const initialState: TodosState = {
  todos: [],
};

export const todosReducer = createReducer(
  initialState,
  on(TodosApiActions.loadAllSuccess, (currentState, action) => ({
    ...currentState,
    todos: action.todos,
  })),
  on(TodosApiActions.addTodoSuccess, (currentState, action) => ({
    ...currentState,
    todos: [...currentState.todos, action.todo],
  })),
  on(TodosPageActions.removeTodo, (currentState, action) => ({
    ...currentState,
    todos: currentState.todos.filter((todo) => todo.id !== action.todo.id),
  })),
  on(TodosPageActions.markAsCompleted, (currentState, action) => ({
    ...currentState,
    todos: currentState.todos.map((todo) =>
      todo.id === action.todo.id ? { ...todo, completed: true } : todo
    ),
  })),
  on(TodosPageActions.markAsPending, 
     TodosApiActions.markAsCompletedError,
    (currentState, action) => ({
    ...currentState,
    todos: currentState.todos.map((todo) =>
      todo.id === action.todo.id ? { ...todo, completed: false } : todo
    ),
  })),
  on(TodosApiActions.clearCompletedSuccess, (state, action) => ({
    ...state,
    todos: state.todos.filter((item) => action.deletedTodos.find(
      (deletedTodo) => deletedTodo.id === item.id
     )  === undefined
    ),
  }))
);