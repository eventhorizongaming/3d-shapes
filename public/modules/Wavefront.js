import { vec } from "./Vector.js";
import { Triangle } from "./Triangle.js";

/**
 * Important to note: make sure the model is triangulated and no faces are clipping
 */
export class Wavefront {
  geometricVertices = [];
  faces = [];

  constructor(instructions) {

    // Parse the vertices
    for (let instruction of instructions) {
      if (instruction.startsWith('v ')) {
        const values = instruction.split(' ');

        this.geometricVertices.push(vec(values[1], values[2], values[3]));
      }
    }

    // Parse the triangles/materials
    let currentMaterial;

    for (let instruction of instructions) {
      if (instruction.startsWith('f ')) {
        const vertices = instruction.split(' ').slice(1);
        const points = [];

        for (let vertex of vertices) {
          const pointData = vertex.split('/').map(e => Number(e));
          points.push(this.geometricVertices[pointData[0] - 1]);
        }

        const triangle = new Triangle(points[0], points[1], points[2]);

        triangle.material = currentMaterial;

        this.faces.push(triangle);
      } else if (instruction.startsWith('usemtl ')) {
        currentMaterial = instruction.split(' ')[1];
      }
    }

    console.log(this.faces);
  }

  transformTriangle(triangle, transform) {
    triangle = triangle.clone();
    triangle.rotate(transform.rotation);
    triangle.applyDepth(transform.fov);
    return triangle;
  }

  draw(graphics, frame) {
    const rotation = vec(0, frame / 10, 0);
    const fov = Math.PI / 4;
    const transform = { rotation, fov };

    const faces = this.faces
      .map(e => this.transformTriangle(e.clone(), transform))
      .sort((a, b) => a.inFrontOf(b));

    graphics.clear();
    graphics.lineStyle(1, 0xff0000, 1);
    graphics.endFill();

    for (let face of faces) {

      if (!face.isBackFace()) {
        const startPoint = face.vertices.at(-1);
        graphics.moveTo(startPoint.x * 240, startPoint.y * 240);
        graphics.lineStyle(1, 0xff0000, 1);
        graphics.beginFill(face.getNormal().normalHex());

        for (let vert of face.vertices) {
          const point = vert;
          graphics.lineTo(point.x * 240, point.y * 240);
        }

        graphics.closePath();
        graphics.endFill();
      }
    }
  }

  static async from(path) {
    const request = await fetch(path);
    const data = await request.text();
    return new Wavefront(data.split('\n'));
  }
}