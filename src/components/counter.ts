import {component, useListener, useValue} from "../framework/framework.ts";

export const Counter = component(() => {
    const [count, setCount] = useValue<number>(0);

    const increment = useListener(
        function increment() {
            setCount(oldCount => oldCount + 1);
        }
    );

    return `
        <div class="counter">
            <h1>{${count}}</h1>
            <button onclick="${increment}">Increment</button>
        </div>
    `
});
