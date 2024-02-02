import {component, useListener, useValue} from "../framework/framework.ts";

export const Counter = component("Counter", function Counter() {
    const [, setCount] = useValue<number>('count', 0);

    useListener(
        function increment() {
            setCount(oldCount => oldCount + 1);
        }
    );

    return `
        <div class="counter">
            <h1>{count}</h1>
            <button onclick="increment">Increment</button>
        </div>
    `
});
