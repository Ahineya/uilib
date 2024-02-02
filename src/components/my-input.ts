import {component, useDerivedValue, useEffect, useListener, useValue} from "../framework/framework.ts";

export const MyInput = component("My-Input", function MyInput() {
    const [getValue, setValue] = useValue('value', '');

    useDerivedValue('derivedValue', () => `cl-${getValue().toLowerCase()}`, ['value']);

    useEffect(() => {
        console.log('Effect', getValue())
    }, ['value']);

    useListener(
        function change(e: Event) {
            setValue((e.target as HTMLInputElement).value);
        }
    );

    return `
        <input class="{derivedValue}" value="{value}" oninput="change">
    `
});
