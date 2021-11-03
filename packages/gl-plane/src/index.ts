import createShader, { GLShader } from "gl-shader"
import tragVertexSrc from "./shaders/trangle-vertex"
import trangFragSrc from "./shaders/trangle-fragment"
import createVAO, { GLVAO } from "gl-vao"
import createBuffer from "gl-buffer"
import createTexture from "gl-texture2d"
type GLBuffer = ReturnType<typeof createBuffer>

type Mat4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
]
type Position = [number, number, number]

const IDENTITY: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

export type DrawParam = {
  model?: Mat4
  view?: Mat4
  projection: Mat4
}
export type GLPlaneOption = {
  gl: WebGLRenderingContext
  model?: Mat4
  view?: Mat4
  projection?: Mat4
  opacity?: number
  points: [Position, Position, Position, Position]
  texture?: HTMLImageElement
}

export class GLPlane {
  bounds = [
    [0.3,0.3,0.4],
    [1,1,1.2]
  ]
  option: Required<Omit<GLPlaneOption, "texture">> & {
    texture?: HTMLImageElement
  }
  vao: GLVAO
  vertextBuffer: GLBuffer
  trangleShader: GLShader<
    {
      model: Mat4
      view: Mat4
      projection: Mat4
    },
    "position"
  >
  texture: ReturnType<typeof createTexture>

  constructor(opt: GLPlaneOption) {
    this.option = {
      model: IDENTITY,
      view: IDENTITY,
      projection: IDENTITY,
      opacity: 1,
      ...opt
    }
    this.texture = createTexture(opt.gl, opt.texture || [1, 1])
    const vertex = 
      this.getVertexCoords(...opt.points)
    this.vertextBuffer = createBuffer(
      opt.gl,
      vertex
    )
    this.updateBounds(opt.points)
    this.trangleShader = createShader(opt.gl, tragVertexSrc, trangFragSrc)
    this.vao = createVAO(opt.gl, [
      {
        buffer: this.vertextBuffer,
        type: opt.gl.FLOAT,
        size: 3
      },
      {
        buffer: createBuffer(opt.gl, [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0]),
        type: opt.gl.FLOAT,
        size: 2
      }
    ])
  }
  private getVertexCoords(
    p1: Position,
    p2: Position,
    p3: Position,
    p4: Position
  ) {
    return [...p1, ...p2, ...p3, ...p1, ...p3, ...p4]
  }
  private updateBounds(points: Position[]) {
    const max = [-Infinity,-Infinity,-Infinity]
    const min = [Infinity,Infinity,Infinity]
    for (let i = 1; i < points.length ; i++) {
      const a = points[i-1] 
      const b = points[i]
      for(let j = 0;j<3;j++) {
        max[j] = Math.max(max[j],a[j],b[j])
        min[j] = Math.min(min[j],a[j],b[j])
      }
    }
    this.bounds=[
      min,max
    ]
  }

  public pick() {
    // No pick implementation yet
    // but plotly need a pick method
    return null
  }

  public isOpaque() {
    return this.option.opacity === 1
  }

  public isTransparent() {
    return !this.isOpaque()
  }

  public update(opt: Partial<GLPlaneOption>) {
    const gl = opt.gl ?? this.option.gl
    if (opt.texture && opt.texture !== this.option.texture) {
      this.texture.dispose()
      this.texture = createTexture(gl, opt.texture)
    }
    this.option = {
      ...this.option,
      ...opt
    }
    if(opt.points) {
      this.updateBounds(opt.points)
      this.vertextBuffer.update(
        this.getVertexCoords(...opt.points)
      )
    }
  }

  public draw(param: DrawParam) {
    const opt = this.option
    const { gl } = opt
    const uniforms = {
      model: param.model ?? opt.model,
      view: param.view ?? opt.view,
      projection: param.projection ?? opt.projection,
      opacity: opt.opacity,
      texture: 0
    }
    this.texture.bind(0)
    this.trangleShader.bind()
    this.trangleShader.uniforms = uniforms
    this.vao.bind()
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    this.vao.unbind()
  }
  public drawTransparent(param: DrawParam) {
    this.draw(param)
  } 

  public dispose() {
    this.vao.dispose()
    this.texture.dispose()
    this.trangleShader.dispose()
    this.vertextBuffer.dispose()
  }
}
