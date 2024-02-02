import {component, list, useListener, useStoreSubscribe, useValue} from "../../framework/framework.ts";
import {todoStore} from "../../stores/test-store.ts";

export const Todos = component(() => {
    const todos = useStoreSubscribe(todoStore.todos);

    const [newTodoName, setNewTodoName] = useValue('');

    const changeNewTodoName = useListener((e: Event) => {
        setNewTodoName((e.target as HTMLInputElement).value);
    });

    const toggleTodo = (todoId: string) => {
        return useListener(() => {
            todoStore.toggleCompleted(todoId);
        });
    }

    const removeTodo = (todoId: string) => {
        return useListener(() => {
            todoStore.removeTodo(todoId);
        });
    }

    const addTodo = () => {
        todoStore.addTodo(newTodoName());
        setNewTodoName('');
    };

    const addTodoListener = useListener(addTodo);

    const addTodoOnPress = useListener((e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    return `
    <div class="todos">
        <h1>Todos</h1>
        <div class="todo-list">
            ${list(todos, (todo) => {
                return `
                    <div>
                        <input type="checkbox" checked="${todo.completed}" onchange="${toggleTodo(todo.id)}"/>
                        <span>${todo.text}</span>
                        <button onclick="${removeTodo(todo.id)}">Remove</button>
                    </div>
                `
            })}            
        </div>
        
        <input
            type="text"
            value="{${newTodoName}}"
            oninput="${changeNewTodoName}"
            onkeydown="${addTodoOnPress}"
        />
        <button onclick="${addTodoListener}">Add</button>
    </div>
    `
});
