import {allEventListeners} from "./event-listeners.ts";
import styles from "./framework.css";

// Add styles to the head of the document.
const style = document.createElement('style');
style.innerHTML = styles;
document.head.appendChild(style);


class Rendered {
    private renderContexts: Map<string, Context> = new Map();
    private stateVariables: Map<any, Map<string, {
        value: any,
        listeners: Set<Function>
    }>> = new Map();

    private globalVariables: Map<string, {
        value: any,
        listeners: Set<Function>
    }> = new Map();

    private teardowns: Map<string, Map<string, Function>> = new Map();

    setTeardown(componentId: string, name: string, fn: Function) {
        if (!this.teardowns.has(componentId)) {
            this.teardowns.set(componentId, new Map());
        }

        this.teardowns.get(componentId)!.set(name, fn);
    }

    getTeardowns(componentId: string) {
        if (!this.teardowns.has(componentId)) {
            this.teardowns.set(componentId, new Map());
        }
        return this.teardowns.get(componentId)!;
    }

    getTeardown(componentId: string, name: string) {
        const teardowns = this.teardowns.get(componentId);
        if (!teardowns) {
            console.warn(`Destroy: Component ${componentId} doesn't have any teardowns`);
            return;
        }

        return teardowns.get(name);
    }

    deleteTeardowns(componentId: string) {
        const teardowns = this.teardowns.get(componentId);
        if (!teardowns) {
            console.warn(`Destroy: Component ${componentId} doesn't have any teardowns`);
            return;
        }

        teardowns.forEach(fn => fn());

        this.teardowns.delete(componentId);
    }

    getRenderContext(componentId: string) {
        if (!this.renderContexts.has(componentId)) {
            this.renderContexts.set(componentId, {
                componentId,
                listeners: {},
                variables: new Set(),
                globalVariables: new Set(),
                getVariable() {
                },
                setVariable() {
                }
            });
        }
        return this.renderContexts.get(componentId)!;
    }

    deleteRenderContext(componentId: string) {
        this.deleteTeardowns(componentId);

        const variables = this.stateVariables.get(componentId);
        if (!variables) {
            console.warn(`Destroy: Component ${componentId} doesn't have any variables`);
            return;
        }

        variables.forEach((value, key) => {
            value.listeners.forEach(listener => {
                variables.get(key)!.listeners.delete(listener);
            });

            variables.delete(key);
        });

        this.stateVariables.delete(componentId);
        this.renderContexts.delete(componentId);
    }

    getStateVariables(componentId: string) {
        if (!this.stateVariables.has(componentId)) {
            this.stateVariables.set(componentId, new Map());
        }
        return this.stateVariables.get(componentId)!;
    }

    getGlobalVariables() {
        return this.globalVariables;
    }

    addGlobalVariable(name: string, value: any) {
        this.globalVariables.set(name, {
            value,
            listeners: new Set()
        });
    }

    getVariable(componentId: string, name: string) {
        const componentName = componentId;
        const value = this.getStateVariables(componentId).get(name);

        if (value) {
            return value;
        } else {
            throw new Error(`Variable ${name} is not defined in component ${componentName}`);
        }
    }

    setVariable(componentId: string, name: string, value: any) {
        const variable = this.getStateVariables(componentId).get(name);
        if (variable) {

            if (variable.value === value) {
                return;
            }

            variable.value = value;
            variable.listeners.forEach(listener => listener());
        } else {
            this.getStateVariables(componentId).set(name, {
                value,
                listeners: new Set()
            });
        }
    }

    getGlobalVariable(name: string) {
        const value = this.globalVariables.get(name);

        if (value) {
            return value;
        } else {
            throw new Error(`Global variable ${name} is not defined`);
        }
    }

    setGlobalVariable(name: string, value: any) {
        const variable = this.globalVariables.get(name);
        if (variable) {

            if (variable.value === value) {
                return;
            }

            variable.value = value;
            variable.listeners.forEach(listener => listener());
        } else {
            this.globalVariables.set(name, {
                value,
                listeners: new Set()
            });
        }
    }
}

type Context = {
    componentId: string,

    listeners: Record<string, EventListener>,
    variables: Set<string>,

    globalVariables: Set<string>,

    getVariable(name: string): any,
    setVariable(name: string, value: any): void
}

function kebabCase(name: string) {
    return name
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
}

class Random {
    private used: Set<string> = new Set();

    public getId = () => {
        let id = Math.random().toString(36).slice(2, 9);
        while (this.used.has(id)) {
            id = Math.random().toString(36).slice(2, 9);
        }

        id = `id-${id}`;

        this.used.add(id);
        return id;
    }

    public getSafeSymbolName = (prefix?: string) => {
        let id = Math.random().toString(36).slice(2, 9);
        while (this.used.has(id)) {
            id = Math.random().toString(36).slice(2, 9);
        }

        id = `${prefix || ''}${id}`;

        this.used.add(id);
        return id;
    }
}

const {getId, getSafeSymbolName} = new Random();

export class Framework {
    static __components: Map<string, Function> = new Map();

    static __store: Rendered = new Rendered();

    static __currentContext: Context = {
        componentId: '',
        listeners: {},
        variables: new Set(),
        globalVariables: new Set(),
        getVariable(name: string) {
            return Framework.__store.getVariable('dummy', name);
        },

        setVariable(name: string, value: any) {
            Framework.__store.setVariable('dummy', name, value);
        }
    };

    static addComponent(name: string, component: Function) {
        // Let's determine how the CamelCase name should be converted to kebab-case.
        // For example, 'Counter' should be converted to 'counter'.

// First, let's convert the first letter to lowercase.
        // 'Counter' => 'counter'

        // Then, let's find all uppercase letters.
        // 'Counter' => ['C']

        // Then, let's replace all uppercase letters with '-{letter}'.

        const kebabCaseName = kebabCase(name);

        if (Framework.__components.has(kebabCaseName)) {
            throw new Error(`Component with name ${name} already exists`);
        }

        Framework.__components.set(kebabCaseName, component);
    }

    static getComponent(name: string) {
        const kebabCaseName = kebabCase(name);

        console.log(Framework.__components)

        return Framework.__components.get(kebabCaseName);
    }

    static getComponents() {
        return Framework.__components;
    }

    static render(selector: string | Element, component: Function, context?: Context) {
        const root = typeof selector === 'string' ? document.querySelector(selector) : selector;

        const componentId = getId();

        if (root) {
            Framework.__currentContext = context || Framework.__store.getRenderContext(componentId);
            Framework.__currentContext.setVariable = (name, value) => Framework.__store.setVariable(componentId, name, value);
            Framework.__currentContext.getVariable = (name) => Framework.__store.getVariable(componentId, name);

            const html: string = component();

            const tempParent = document.createElement('div');
            tempParent.innerHTML = html;
            const element = tempParent.firstElementChild!;

            allEventListeners.forEach(eventName => {
                const elements = tempParent.querySelectorAll(`[${eventName}]`);

                elements.forEach(el => {
                    const attr = el.getAttribute(eventName);
                    if (attr) {
                        el.removeAttribute(eventName);
                        el.addEventListener(eventName.substring(2), Framework.__currentContext.listeners[attr]);
                    }
                });
            });

            // If element has a text node, which starts with '{' and ends with '}', then it is a placeholder.
            // We need to replace it with a variable.
            const descendants = tempParent.querySelectorAll(':scope *');

            descendants.forEach(el => {
                if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                    const text = el.childNodes[0].textContent;
                    if (text && text.startsWith('{') && text.endsWith('}')) {
                        const variableName = text.substring(1, text.length - 1);

                        // First, let's check if this is a component variable.
                        if (Framework.__currentContext.variables.has(variableName)) {
                            el.childNodes[0].textContent = Framework.__store.getVariable(componentId, variableName).value;

                            Framework.__store.getVariable(componentId, variableName).listeners.add(() => {
                                el.childNodes[0].textContent = Framework.__store.getVariable(componentId, variableName).value;
                            });
                        } else {
                            // If not, then it is a global variable.
                            if (!Framework.__currentContext.globalVariables.has(variableName)) {
                                throw new Error(`Component ${component.name} is trying to use global variable ${variableName}, but it is not implicitly declared. Use useGlobalValue('${variableName}') to declare it.`);
                            }

                            el.childNodes[0].textContent = Framework.__store.getGlobalVariable(variableName).value;

                            Framework.__store.getGlobalVariable(variableName).listeners.add(() => {
                                el.childNodes[0].textContent = Framework.__store.getGlobalVariable(variableName).value;
                            });
                        }
                    }
                } else {
                    // Let's traverse all the attributes and check if they contain a placeholder.
                    const attributes = el.attributes;

                    for (let i = 0; i < attributes.length; i++) {
                        const attribute = attributes[i];
                        const value = attribute.value;

                        if (value && value.startsWith('{') && value.endsWith('}')) {
                            const variableName = value.substring(1, value.length - 1);

                            let setter = (value: any) => {
                                if (attribute.name === 'value') {
                                    (el as HTMLInputElement).value = value;
                                    el.removeAttribute(attribute.name);
                                } else {
                                    el.setAttribute(attribute.name, value);
                                }
                            }

                            // First, let's check if this is a component variable.
                            if (Framework.__currentContext.variables.has(variableName)) {
                                setter(Framework.__store.getVariable(componentId, variableName).value);

                                Framework.__store.getVariable(componentId, variableName).listeners.add(() => {
                                    setter(Framework.__store.getVariable(componentId, variableName).value);
                                });
                            } else {
                                if (!Framework.__currentContext.globalVariables.has(variableName)) {
                                    throw new Error(`Component ${component.name} is trying to use global variable ${variableName}, but it is not implicitly declared. Use useGlobalValue('${variableName}') to declare it.`);
                                }

                                setter(Framework.__store.getGlobalVariable(variableName).value);

                                Framework.__store.getGlobalVariable(variableName).listeners.add(() => {
                                    setter(Framework.__store.getGlobalVariable(variableName).value);
                                });
                            }
                        }
                    }
                }
            });

            // If component has tags that correspond to another component, then we need to render them.

            const components = Framework.getComponents();
            const componentNames = Array.from(components.keys());

            const componentSelector = componentNames.join(', ');

            const componentTags = element.querySelectorAll(`:scope ${componentSelector}`);
            componentTags.forEach(el => {
                const component = Framework.getComponent(el.tagName.toLowerCase());
                if (component) {
                    // Save already rendered children.
                    const children = Array.from(el.children);
                    // Remove all children.
                    el.innerHTML = `${component.name} render error`;
                    // Remember the current context.
                    const context = Framework.__currentContext;
                    // TODO: This introduces recursion. We need to find a way to avoid it.
                    // A possible solution is to use a render stack. Exactly like a call stack.

                    const tp = document.createElement('div');
                    const elClone = el.cloneNode(true) as HTMLElement;
                    tp.appendChild(elClone);

                    Framework.render(tp.firstElementChild!, component);

                    let rendered = tp.firstElementChild;
                    if (!rendered) {
                        console.warn(`Wasn't able to render ${el.tagName}`);
                        Framework.__currentContext = context;
                        return;
                    }

                    el.parentNode?.insertBefore(rendered, el);
                    el.parentNode?.removeChild(el);

                    // Restore children
                    if (children.length > 0) {
                        const slot = rendered.querySelector('slot');

                        if (!slot) {
                            console.warn(`Component ${component.name} doesn't have a slot`);
                        } else {
                            // Add children to the slot.
                            children.forEach(c => slot.appendChild(c));
                        }
                    }

                    // Restore the context.
                    Framework.__currentContext = context;
                }
            });

            element.setAttribute('component-id', componentId);

            root.parentNode?.insertBefore(element, root);
            root.parentNode?.removeChild(root);
        } else {
            throw new Error(`Could not find element with selector ${selector}`);
        }
    }
}

export function useListener(fn: EventListener) {
    const name = fn.name || getSafeSymbolName('fn');

    fn.toString = () => {
        return name;
    }

    Framework.__currentContext.listeners[name] = fn;

    return name;
}

type ValueGetter<T> = (() => T) & { __subscribe: (fn: (value: T) => void) => void };

export function useValue<T>(initialValue: T): [ValueGetter<T>, (setter: T | ((oldValue: T) => T)) => void] {
    const name = getSafeSymbolName('state');

    if (!Framework.__currentContext.variables.has(name)) {
        Framework.__currentContext.variables.add(name);
        Framework.__currentContext.setVariable(name, initialValue);
    }

    const componentId = Framework.__currentContext.componentId;

    const valueGetter: ValueGetter<T> = () => Framework.__store.getVariable(componentId, name).value;
    valueGetter.toString = () => name;
    valueGetter.__subscribe = (fn: (value: T) => void) => {
        Framework.__store.getVariable(componentId, name).listeners.add(() => fn(valueGetter()));
    }

    return [
        valueGetter,
        (setter: T | ((oldValue: T) => T)) => {

            let setterFn: (oldValue: T) => T;

            if (typeof setter === 'function') {
                setterFn = setter as (oldValue: T) => T;
            } else {
                setterFn = () => setter;
            }

            const oldValue = Framework.__store.getVariable(componentId, name);
            const newValue = setterFn(oldValue.value);
            Framework.__store.setVariable(componentId, name, newValue);
        }
    ]
}

export function useDerivedValue<T>(fn: () => T, dependencies: ValueGetter<string>[]) {
    const componentId = Framework.__currentContext.componentId;

    const name = getSafeSymbolName('derived');

    if (!Framework.__currentContext.variables.has(name)) {
        Framework.__currentContext.variables.add(name);
        Framework.__currentContext.setVariable(name, fn());
    }

    dependencies.forEach(dependency => {
        Framework.__store.getVariable(componentId, dependency.toString()).listeners.add(() => {
            Framework.__store.setVariable(componentId, name, fn());
        });
    });

    const valueGetter: ValueGetter<T> = () => Framework.__store.getVariable(componentId, name).value;
    valueGetter.toString = () => name;
    valueGetter.__subscribe = (fn: (value: T) => void) => {
        Framework.__store.getVariable(componentId, name).listeners.add(() => fn(valueGetter()));
    }

    return valueGetter;
}

type Teardown = () => void;

export function useEffect(fn: () => Teardown | void, dependencies: ValueGetter<string>[]) {
    const componentId = Framework.__currentContext.componentId;

    const teardown = fn();
    const teardownId = getId();

    if (teardown) {
        Framework.__store.setTeardown(componentId, teardownId, teardown);
    }

    dependencies.forEach(dependency => {
        Framework.__store.getVariable(componentId, dependency.toString()).listeners.add(() => {
            const teardown = Framework.__store.getTeardown(componentId, teardownId);
            if (teardown) {
                teardown();
            }

            const newTeardown = fn();
            if (newTeardown) {
                Framework.__store.setTeardown(componentId, teardownId, newTeardown);
            }
        });
    });

}

export function useGlobalValue<T>(name: string, initialValue?: T): [() => T, (setter: T | ((oldValue: T) => T)) => void] {
    if (!Framework.__store.getGlobalVariables().has(name)) {
        Framework.__store.addGlobalVariable(name, initialValue);
    }

    if (!Framework.__currentContext.globalVariables.has(name)) {
        Framework.__currentContext.globalVariables.add(name);
    }

    return [
        () => Framework.__store.getGlobalVariable(name).value,
        (setter: T | ((oldValue: T) => T)) => {
            let setterFn: (oldValue: T) => T;

            if (typeof setter === 'function') {
                setterFn = setter as (oldValue: T) => T;
            } else {
                setterFn = () => setter;
            }

            const oldValue = Framework.__store.getGlobalVariable(name).value;
            const newValue = setterFn(oldValue);
            Framework.__store.setGlobalVariable(name, newValue);
        }
    ]
}

export function subscribeToGlobalValue<T>(name: string, fn: (value: T) => void) {
    const value = Framework.__store.getGlobalVariable(name);
    value.listeners.add(() => fn(value.value));
}

export function component(componentFn: () => string) {
    const id = getId();
    Framework.addComponent(id, componentFn);
    return id;
}

function renderDummy(html: string, context: Context): Element {
    const savedContext = Framework.__currentContext;

    const dummy = document.createElement('div');
    const dummyChild = document.createElement('div');
    dummy.appendChild(dummyChild);

    Framework.render(dummyChild, () => `<div class="dummy">${html}</div>`, context);

    Framework.__currentContext = savedContext;

    return dummy.firstElementChild!;
}

function derender(elements: Element) {
    const components = elements.querySelectorAll('[component-id]');
    components.forEach(component => {
        console.log('Destroying component', component.getAttribute('component-id')!);
        Framework.__store.deleteRenderContext(component.getAttribute('component-id')!);
    });
}

export function list<T>(items: ValueGetter<T[]>, fn: (item: T) => string) {
    const listSlotName = `list-slot-${getId()}`;
    const listSlot = `<list-slot name="${listSlotName}"></list-slot>`;

    const componentId = Framework.__currentContext.componentId;

    items.__subscribe((items) => {
        const slot = document.querySelector(`[name="${listSlotName}"]`);
        if (slot) {
            const context = Framework.__store.getRenderContext(componentId);

            const rerendered = items.map(fn).join('');

            const dummy = renderDummy(rerendered, context);

            const parent = slot.parentElement!;

            derender(parent);
            parent.innerHTML = '';

            parent.appendChild(slot);

            const dummyChildren = [...dummy.children];
            dummyChildren.forEach(c => parent.appendChild(c));
        }
    });

    return listSlot + items().map(fn).join('');
}
