import {Framework, StoreSubject} from "../framework/framework.ts";

type Todo = {
    id: string;
    text: string;
    completed: boolean;
}

export class TodoStore {
    public todos = new StoreSubject<Todo[]>([{
        id: Framework.getId(),
        text: 'Test',
        completed: false,
    },
        {
            id: Framework.getId(),
            text: 'Test 2',
            completed: true,
        }
    ]);

    public addTodo(text: string) {
        this.todos.next([
            {
                id: Framework.getId(),
                text,
                completed: false,
            },
            ...this.todos.getValue(),
        ]);
    }

    public removeTodo(id: string) {
        this.todos.next(this.todos.getValue().filter(todo => todo.id !== id));
    }

    public toggleCompleted(id: string) {
        console.log('toggleCompleted', id);

        this.todos.next(this.todos.getValue().map(todo => {
            if (todo.id === id) {
                return {
                    ...todo,
                    completed: !todo.completed,
                }
            }
            return todo;
        }));
    }
}

export const todoStore = new TodoStore();