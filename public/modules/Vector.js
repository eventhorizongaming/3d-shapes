export class Vector {
  x;
  y;
  z;

  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static subtract(vec1, vec2) {
    return vec(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z);
  }

  static dot(vec1, vec2) {
    return (vec1.x * vec2.x) + (vec1.y * vec2.y) + (vec1.z * vec2.z);
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  clone() {
    return vec(this.x, this.y, this.z);
  }

  length() {
    return Math.sqrt(Math.pow(this.x, 2), Math.pow(this.y, 2), Math.pow(this.z, 2))
  }

  scale(scalar) {
    this.x = this.x * scalar;
    this.y = this.y * scalar;
    this.z = this.z * scalar;
  }

  normalize() {
    this.scale(1 / this.length());
  }

  rotateX(angle) {
    const l = Math.hypot(this.z, this.y);
    const a = Math.atan2(this.y, this.z) + angle;
    this.z = Math.sin(a) * l;
    this.y = Math.cos(a) * l;
  }

  rotateY(angle) {
    const l = Math.hypot(this.x, this.z);
    const a = Math.atan2(this.z, this.x) + angle;
    this.x = Math.sin(a) * l;
    this.z = Math.cos(a) * l;
  }

  rotateZ(angle) {
    const l = Math.hypot(this.x, this.y);
    const a = Math.atan2(this.y, this.x) + angle;
    this.x = Math.sin(a) * l;
    this.y = Math.cos(a) * l;
  }

  normalHex() {
    const newVec = this.clone();
    newVec.normalize();

    const r = Math.max(Math.min(Math.round((newVec.x * 128) + 128), 255), 0);
    const g = Math.max(Math.min(Math.round((newVec.y * 128) + 128), 255), 0);
    const b = Math.max(Math.min(Math.round((newVec.z * 128) + 128), 255), 0);

    return r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
  }
}

export function vec(...params) {
  if (params.length === 0) {
    return new Vector(0, 0, 0);
  } else if (params.length === 1 && typeof params[0] === "object") {
    return new Vector(Number(params[0].x), Number(params[0].y), Number(params[0].z));
  } else if (params.length === 2) {
    return new Vector(Number(params[0]), Number(params[1]), 0);
  } else if (params.length === 3) {
    return new Vector(Number(params[0]), Number(params[1]), Number(params[2]));
  }

  throw new Error(`Invalid parameters: \n${JSON.stringify(...params)}`);
}