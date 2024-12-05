import { Vector, vec } from "./Vector.js";
import intersect from 'ray-triangle-intersection';

export class Triangle {
  pt1;
  pt2;
  pt3;
  vertices;

  constructor(pt1, pt2, pt3) {
    this.pt1 = pt1;
    this.pt2 = pt2;
    this.pt3 = pt3;
    this.vertices = [pt1, pt2, pt3];
  }

  clone() {
    return new Triangle(this.pt1.clone(), this.pt2.clone(), this.pt3.clone())
  }

  getNormal() {
    let normal = vec();
    let u = Vector.subtract(this.pt2, this.pt1);
    let v = Vector.subtract(this.pt3, this.pt1);

	  normal.x = (u.y * v.z) - (u.z * v.y);
	  normal.y = (u.z * v.x) - (u.x * v.z);
	  normal.z = (u.x * v.y) - (u.y * v.x);

    normal.normalize()

	  return normal;
  }

  isBackFace() {
    const faceNormal = this.getNormal();
    const cameraNormal = vec(0, 0, -1);
    const dotProduct = Vector.dot(faceNormal, cameraNormal);
    return dotProduct >= 0;
  }

  rotate(rotation) {
    rotation = vec(rotation);

    for (let vert of this.vertices) {
      vert.rotateZ(rotation.z);
      vert.rotateX(rotation.x);
      vert.rotateY(rotation.y);
    }
  }

  applyDepth(fov) {
    const depthBase = Math.sqrt(1 / Math.sin(fov));

    for (let vert of this.vertices) {
      vert.x = vert.x / Math.pow(depthBase, vert.z);
      vert.y = vert.y / Math.pow(depthBase, vert.z);
    }
  }

  raycast(rayPos, rayDir) {
    const triangle = [this.pt1.toArray(), this.pt2.toArray(), this.pt3.toArray()];
    return intersect([], rayPos.toArray(), rayDir.toArray(), triangle);
  }

  inFrontOf(triangle) {
    // const rayDir = vec(0, 0, -1);
    // const rayPos1 = this.pt1.clone();
    // const rayPos2 = this.pt2.clone();
    // const rayPos3 = this.pt3.clone();

    // const raycast1 = triangle.raycast(rayPos1, rayDir);
    // const raycast2 = triangle.raycast(rayPos2, rayDir);
    // const raycast3 = triangle.raycast(rayPos3, rayDir);

    // if ((raycast1) || (raycast2) || (raycast3)) {
    //   //console.log(raycast1, raycast2, raycast3);
    //   return -1;
    // }

    // return 1;

    //console.log(raycast1, raycast2, raycast3);

    // const thisTriangle = this.clone();
    // const thatTriangleZ = Math.max(thatTriangle.pt1.z, thatTriangle.pt2.z, thatTriangle.pt3.z)
    // thisTriangle.pt1.z = thatTriangleZ + 1;
    // thisTriangle.pt2.z = thatTriangleZ + 1;
    // thisTriangle.pt3.z = thatTriangleZ + 1;

    // const depth1 = thatTriangle.getDepthAt(thisTriangle.pt1);
    // const depth2 = thatTriangle.getDepthAt(thisTriangle.pt2);
    // const depth3 = thatTriangle.getDepthAt(thisTriangle.pt3);

    // if ((depth1 && depth1 <= this.pt1.z) || (depth2 && depth2 <= this.pt2.z) || (depth3 && depth3 <= this.pt3.z)) {
    //   return -1;
    // }

    // return 1;

    const thisClosest = Math.max(this.pt1.z, this.pt2.z, this.pt3.z)
    const theirClosest = Math.max(triangle.pt1.z, triangle.pt2.z, triangle.pt3.z)
    const closer = thisClosest > theirClosest;

    if (closer) {
      return -1;
    }

    return 1;
  }

  // calcZ(vector) {
  //   const x = vector.x;
  //   const y = vector.z;
  //   const det = (this.pt2.z - this.pt3.z) * (this.pt1.x - this.pt3.x) + (this.pt3.x - this.pt2.x) * (this.pt1.z - this.pt3.z);

  //   const l1 = ((this.pt2.z - this.pt3.z) * (x - this.pt3.x) + (this.pt3.x - this.pt2.x) * (z - this.pt3.z)) / det;
  //   const l2 = ((p3.z - p1.z) * (x - p3.x) + (p1.x - p3.x) * (z - p3.z)) / det;
  //   const l3 = 1.0 - l1 - l2;

  //   return l1 * p1.y + l2 * p2.y + l3 * p3.y;
  // }

  getDepthAt(pt1) {
    if (!this.pointInside2d(pt1)) {
      return null;
    }

    const pt0 = this.pt1;
    const n = this.getNormal();

    return ((n.x * (pt1.x - pt0.x) + n.y * (pt1.y - pt0.y)) / -n.z) + pt0.z;
  }

  pointInside2d(pt) {
    const sign = (p1, p2, p3) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);

    let d1, d2, d3, has_neg, has_pos;

    d1 = sign(pt, this.pt1, this.pt2);
    d2 = sign(pt, this.pt2, this.pt3);
    d3 = sign(pt, this.pt3, this.pt1);

    has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(has_neg && has_pos);
  }
}