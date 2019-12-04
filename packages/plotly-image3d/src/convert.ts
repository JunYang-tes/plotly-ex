import { GLPlane } from 'gl-plane'
import {Data, Scene} from './types'
type Position = [number,number,number]
class Image3DTrace {
  data = {
    hoverinfo:"skip"
  }
  constructor(
    private scene: Scene,
    private plane: GLPlane
  ) {}

  update(data: Data){
    console.log("update")
    const { x, y, z } = data
    const [sx, sy, sz] =this.scene.dataScale
    const p1: Position = [x[0] * sx, y[0] * sy, z[0] * sz]
    const p2: Position = [x[1] * sx, y[1] * sy, z[1] * sz]
    const p3: Position = [x[2] * sx, y[2] * sy, z[2] * sz]
    const p4: Position = [x[3] * sx, y[3] * sy, z[3] * sz]
    this.plane.update({
      points:[p1,p2,p3,p4],
      opacity: data.opacity
    })
  }
  handlePick(){
    console.log("handlePick")
  }
  dispose() {
    console.log("dispose")
  }
}


export function createImage3dTrace(scene:Scene,data: Data) {
  const plane = new GLPlane({
    gl: scene.glplot.gl,
    points:[
      [0,0,0],
      [0,0,0],
      [0,0,0],
      [0,0,0],
    ],
  })
  data.texture.addEventListener('load', ()=>{
    plane.update({
      texture:data.texture
    })
    scene.glplot.redraw()
  })
  const trace = new Image3DTrace(
    scene,
    plane
  )
  trace.update(data)
  ;(plane as any)._trace = trace
  scene.glplot.add(plane)
  
  return trace
}
