import {component} from "../framework/framework.ts";

export const Panel = component("Panel", function Panel() {
    return `
        <div class="panel" style="border: 1px solid black">
            <slot></slot>
        </div>
    `
});
