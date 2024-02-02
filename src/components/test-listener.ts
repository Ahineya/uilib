import {component, useEffect} from "../framework/framework.ts";

export const TestDestroy = component(() => {

    useEffect(() => {
        const listener = () => {
            console.log('click');
        }

        window.addEventListener('click', listener);

        return () => {
            window.removeEventListener('click', listener);
        }
    }, []);

    return `
        <div class="test-listener">
            Test Listener
        </div>
    `
});
