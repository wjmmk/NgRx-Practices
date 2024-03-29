import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  catchError,
  concatMap,
  exhaustMap,
  map,
  mergeMap,
  tap,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { NotificationsService } from 'src/app/notifications/notifications.service';
import { TodosApiActions, TodosPageActions, TodosSelectors } from '.';
import { TodosService } from '../todos.service';

@Injectable()
export class TodosEffects {
  constructor(
    private actions$: Actions,
    private todosService: TodosService,
    private notificationsService: NotificationsService,
    private store: Store
  ) {}

  loadAll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodosPageActions.init),
      exhaustMap((initAction) =>
        this.todosService.getAll().pipe(
          map((todos) => TodosApiActions.loadAllSuccess({ todos })),
          catchError(() =>
            of(
              TodosApiActions.loadAllError({
                errorMessage:
                  'Ha ocurrido un error al intentar obtener el listado de tareas.',
              })
            )
          )
        )
      )
    )
  );

  addTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodosPageActions.addTodo),
      concatMap((action) =>
        this.todosService.create(action.todo).pipe(
          map((savedTodo) =>
            TodosApiActions.addTodoSuccess({ todo: savedTodo })
          ),
          catchError(() =>
            of(
              TodosApiActions.addTodoError({
                errorMessage: `Ha ocurrido un error al intentar guardar la tarea: "${action.todo.description}"`,
              })
            )
          )
        )
      )
    )
  );
  
  removeTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodosPageActions.removeTodo),
      mergeMap((action) =>
        this.todosService.delete(action.todo).pipe(
          map(() => TodosApiActions.removeTodoSuccess({ todo: action.todo })),
          catchError(() =>
            of(
              TodosApiActions.removeTodoError({
                errorMessage: `Ha ocurrido un error al intentar borrar la tarea: "${action.todo.description}"`,
              })
            )
          )
        )
      )
    )
  );

  markTodoAsCompleted$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodosPageActions.markAsCompleted),
      concatMap((action) =>
        this.todosService.update(action.todo).pipe(
          map(() => TodosApiActions.markAsCompletedSuccess()),
          catchError(() =>
            of(
              TodosApiActions.markAsCompletedError({
                todo: action.todo,
                errorMessage: `Ha ocurrido un error al intentar marcar la tarea "${action.todo.description}" como completada.`,
              })
            )
          )
        )
      )
    )
  );

  markTodoAsPending$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodosPageActions.markAsPending),
      concatMap((action) =>
        this.todosService.update(action.todo).pipe(
          map(() => TodosApiActions.markAsPendingSuccess()),
          catchError(() =>
            of(
              TodosApiActions.markAsPendingError({
                todo: action.todo,
                errorMessage: `Ha ocurrido un error al intentar marcar la tarea "${action.todo.description}" como pendiente.`,
              })
            )
          )
        )
      )
    )
  );

  clearCompleted$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodosPageActions.clearCompleted),
      concatLatestFrom(() => this.store.select(TodosSelectors.completedTodos)),
      mergeMap(([action, completedTodos]) =>
        this.todosService.deleteMany(completedTodos).pipe(
          map(() =>
            TodosApiActions.clearCompletedSuccess({
              deletedTodos: completedTodos,
            })
          ),
          catchError(() =>
            of(
              TodosApiActions.clearCompletedError({
                errorMessage: `Ha ocurrido un error al intentar eliminar ${completedTodos.length} tarea(s) completada(s).`,
              })
            )
          )
        )
      )
    )
  );

  notifyApiError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          TodosApiActions.loadAllError,
          TodosApiActions.addTodoError,
          TodosApiActions.removeTodoError,
          TodosApiActions.markAsCompletedError,
          TodosApiActions.markAsPendingError,
          TodosApiActions.clearCompletedError
        ),
        tap((action) => this.notificationsService.error(action.errorMessage))
      ),
    { dispatch: false }
  );
}