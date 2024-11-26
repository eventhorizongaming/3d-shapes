export class Wavefront {
  geometricVertices = [];
  normalVertices = [];
  faces = [];

  constructor(instructions) {

    // Parse the vertices
    for (let instruction of instructions) {
      if (instruction.startsWith('v ')) {
        const values = instruction.split(' ');

        this.geometricVertices.push({
          x: Number(values[1]),
          y: Number(values[2]),
          z: Number(values[3]),
          w: Number(values[4])
        });
      } else if (instruction.startsWith('vn ')) {
        const values = instruction.split(' ');

        this.normalVertices.push({
          x: Number(values[1]),
          y: Number(values[2]),
          z: Number(values[3])
        });
      }
    }

    // Parse the faces/materials
    let currentMaterial;

    for (let instruction of instructions) {
      if (instruction.startsWith('f ')) {
        const vertices = instruction.split(' ').slice(1);
        const points = {vertices: [], material: currentMaterial};

        for (let vertex of vertices) {
          const pointData = vertex.split('/').map(e => Number(e));
          const newPoint = {vertex: this.geometricVertices[pointData[0] - 1]};

          if (pointData[2]) {
            newPoint.normal = this.normalVertices[pointData[2] - 1];
          }
          
          points.vertices.push(newPoint);
        }

        this.faces.push(points);
      } else if (instruction.startsWith('usemtl ')) {
        currentMaterial = instruction.split(' ')[1];
      }
    }

    console.log(this.faces);
  }

  rotate2D(x, y, r) {
    const l = Math.hypot(x, y);
    const a = Math.atan2(y, x) + r;

    x = Math.sin(a) * l;
    y = Math.cos(a) * l;

    return {x: x, y: y};
  }

  rotatePoint(point, rotation) {
    rotation = {x: rotation.x, y: rotation.y, z: rotation.z}
    // We use YXZ rotation order

    const pt = {x: point.x, y: point.y, z: point.z};

    const yr = this.rotate2D(pt.x, pt.z, rotation.y);
    pt.x = yr.x;
    pt.z = yr.y;

    const xr = this.rotate2D(pt.y, pt.z, rotation.x);
    pt.y = xr.x;
    pt.z = xr.y;

    const zr = this.rotate2D(pt.y, pt.x, rotation.z);
    pt.y = zr.x;
    pt.x = zr.y;

    return pt;
  }

  draw(graphics, frame) {
    const r = 2;

    graphics.clear();
    graphics.lineStyle(1, 0xff0000, 1);
    graphics.endFill();
    

    const rotation = {x: frame / 10, y: frame / 10, z: 0};

    for (let face of this.faces) {
      const verts = face.vertices;

      const startPoint = this.rotatePoint(verts.at(-1).vertex, rotation);
      graphics.moveTo(startPoint.x * 240, startPoint.y * 240);

      for (let vert of verts) {
        const point = this.rotatePoint(vert.vertex, rotation);
        graphics.lineTo(point.x * 240, point.y * 240);
      }
    }

    graphics.beginFill(0xffffff);

    for (let pt of this.geometricVertices) {
      pt = this.rotatePoint(pt, rotation);
      graphics.drawCircle(pt.x * 240, pt.y * 240, r);
    }
  }

  static async from(path) {
    const request = await fetch(path);
    const data = await request.text();
    return new Wavefront(data.split('\n'));
  }
}