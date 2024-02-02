import {component, useDerivedValue, useEffect, useListener, useValue} from "../framework/framework.ts";

export const MyInput = component(() => {
    const [value, setValue] = useValue('');

    const derivedValue = useDerivedValue(() => `cl-${value().toLowerCase()}`, [value]);

    useEffect(() => {
        console.log('Effect', value())
    }, [value]);

    const change = useListener(
        (e: Event) => {
            setValue((e.target as HTMLInputElement).value);
        }
    );

    return `
        <input class="{${derivedValue}}" value="{${value}}" oninput="${change}">
    `
});
