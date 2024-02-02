import './style.css'
import {component, useGlobalValue, useListener, useValue} from "./framework/framework.ts";
import {Counter} from "./components/counter.ts";

import {MyInput} from "./components/my-input.ts";
import {Panel} from "./components/panel.ts";

export const App = component("App", function App() {
    const [getValue, setValue] = useValue<string | number>('value', 0);

    const [getGlobalValue, setGlobalValue] = useGlobalValue('globalValue', "Hello world!");

    useListener(
        function someFn() {
            console.log('Clicked!', getValue());

            setValue(oldValue => {
                if (typeof oldValue === 'number' && oldValue + 1 === 3) {
                    setGlobalValue('Hello world 2!')
                    return getGlobalValue();
                }

                if (typeof oldValue === 'string') {
                    return oldValue + '!';
                }

                return (oldValue as number) + 1;
            });
        }
    );

    return `
        <div class="app">
            <h1>{value}</h1>
            <h2>{globalValue}</h2>
            
            <button onclick="someFn">Click me!</button>

            <${MyInput}></${MyInput}>
            
            <${Panel}>
                <${Counter}></${Counter}>
            </${Panel}>
        </div>
    `
});

