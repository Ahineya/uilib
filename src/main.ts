import {Framework} from "./framework/framework.ts";
import {App} from "./app.ts";

Framework.render('#app', Framework.getComponent(App)!);