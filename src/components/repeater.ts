import {component, list, useListener, useValue} from "../framework/framework.ts";

import {TestDestroy} from "./test-listener.ts";

export const Repeater = component(() => {
    const [value, setValue] = useValue([
        {name: 'John'},
    ]);

    const add = useListener(() => {
        setValue(oldValue => {
            return [...oldValue, {name: 'New name'}];
        });
    });

    return `
    <div class="repeater-test">
        <ul>
            ${list(value, (item) => {
                return `<${TestDestroy} key="${item.name}"></${TestDestroy}>`;
            })}
        </ul>
        <button onclick="${add}">Add</button>
    </div>
    `
});
