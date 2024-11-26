import * as PIXI from 'pixi.js';
import { Wavefront } from './modules/Wavefront.js';

const w = await Wavefront.from("./model.obj");
console.log(w);

const app = new PIXI.Application({ antialias: true, resizeTo: window });

document.body.appendChild(app.view);

// let's create a moving shape
const thing = new PIXI.Graphics();

app.stage.addChild(thing);
thing.x = 800 / 2;
thing.y = 600 / 2;

let count = 0;

app.ticker.add(() =>
{
    count += 0.1;

    w.draw(thing, count);
});
