/** @jsxRuntime classic */
/** @jsx Didact.createElement */

import Didact from "./didact";
import {Form} from "./components/form/form.component";

const container = document.getElementById("root");
const App = (
    <Form initialTask='Write a task!'/>
);
Didact.render(App, container)