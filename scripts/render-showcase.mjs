import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { once } from 'node:events'

const output = 'exports/iphone-duo-demo.mp4'
await mkdir('exports/proofs', { recursive: true })
const encoder = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', '30', '-vcodec', 'mjpeg', '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output], { stdio: ['pipe', 'ignore', 'inherit'] })
const browser = await chromium.launch()
const ease = t => { const p = Math.max(0, Math.min(1, t)); return p * p * (3 - 2 * p) }
const cameraStops = [[0,1.2,0,0],[30,1.2,0,0],[60,1.85,-0.14,0],[90,1.85,-0.14,0],[120,1.85,0.15,-0.12],[150,1.85,0.15,-0.12],[180,1.2,0,0],[270,1.2,0,0],[300,1.42,-0.025,0],[345,1.42,-0.025,0],[375,1.2,0,0],[540,1.2,0,0]]
function camera(frame) {
  const index = cameraStops.findIndex(stop => stop[0] >= frame)
  if (index === 0) return cameraStops[0].slice(1)
  const a = cameraStops[index - 1], b = cameraStops[index], t = ease((frame-a[0])/(b[0]-a[0]))
  return a.slice(1).map((v,i)=>v+(b[i+1]-v)*t)
}
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, colorScheme: 'dark' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => errors.push(`${request.url()}: ${request.failure()?.errorText}`))
  await page.goto('http://127.0.0.1:5201/')
  await page.locator('[data-ready="true"]').waitFor({ timeout: 20000 })
  await page.waitForLoadState('networkidle')
  await page.getByRole('slider', { name: 'Fold angle', exact: true }).fill('1')
  await page.getByRole('button', { name: 'Tune', exact: true }).click()
  const blur = page.getByRole('slider', { name: 'Blur', exact: true, includeHidden: true })
  await blur.focus()
  const layout = await page.evaluate(() => {
    const root = document.querySelector('.phone-study'), device = document.querySelector('.duo-device')
    const r = root.getBoundingClientRect(), d = device.getBoundingClientRect()
    const credit = document.querySelector('.duo-credit')
    document.body.append(credit)
    Object.assign(credit.style, { position: 'fixed', right: '184px', top: '696px', color: '#d9dbd4', fontSize: '12px', zIndex: '30' })
    for (const selector of ['.page-actions','.social-links','.tuning-toggle','.tuning-panel','.phone-controls','.phone-caption']) document.querySelector(selector).style.visibility = 'hidden'
    root.style.transformOrigin = '0 0'
    document.body.style.overflow = 'hidden'
    const cursor = document.createElement('div'); cursor.id = 'capture-cursor'
    Object.assign(cursor.style, { position:'fixed',width:'32px',height:'32px',borderRadius:'50%',background:'rgb(255 255 255 / .28)',boxShadow:'inset 0 0 0 1px rgb(255 255 255 / .6), 0 5px 15px rgb(0 0 0 / .16)',pointerEvents:'none',zIndex:'40',opacity:'0' })
    document.body.append(cursor)
    return { x:r.x,y:r.y,cx:d.x+d.width/2-r.x,cy:d.y+d.height/2-r.y,width:d.width,height:d.height,dragWidth:document.querySelector('.duo-device-target').clientWidth }
  })
  await page.clock.install({ time: new Date('2026-09-09T12:00:00Z') })
  await page.clock.pauseAt(new Date('2026-09-09T12:00:01Z'))
  const states = []
  for(let frame=0; frame<540; frame++) {
    const [scale,ax,ay] = camera(frame)
    const tx=640-layout.x-(layout.cx+layout.width*ax)*scale
    const ty=440-layout.y-(layout.cy+layout.height*ay)*scale
    let cursor = { x:515,y:455,opacity:0,pressed:false }
    if(frame>=180&&frame<195) { const t=ease((frame-180)/14);cursor={x:465+50*t,y:500-45*t,opacity:t,pressed:false} }
    if(frame>=195&&frame<=240) cursor={x:515+layout.dragWidth*.5*.32*ease((frame-195)/44),y:455,opacity:1,pressed:true}
    if(frame>240&&frame<258) cursor={x:515+layout.dragWidth*.5*.32+35*ease((frame-240)/18),y:455+30*ease((frame-240)/18),opacity:1-ease((frame-246)/12),pressed:false}
    for(const trigger of [375,450]) if(frame>=trigger-10&&frame<trigger+20) cursor={x:640+40*ease((frame-trigger)/14),y:455+45*ease((frame-trigger)/14),opacity:frame<trigger?ease((frame-trigger+10)/7):1-ease((frame-trigger-8)/12),pressed:frame>=trigger&&frame<trigger+3}
    await page.evaluate(({tx,ty,scale,cursor})=>{document.querySelector('.phone-study').style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;const c=document.querySelector('#capture-cursor');c.style.transform=`translate(${cursor.x-16}px,${cursor.y-16}px) scale(${cursor.pressed?.9:1})`;c.style.opacity=String(cursor.opacity)}, {tx,ty,scale,cursor})
    if(frame===195) { await page.mouse.move(515,455);await page.mouse.down() }
    if(frame>195&&frame<240) await page.mouse.move(cursor.x,cursor.y)
    if(frame===240) await page.mouse.up()
    if(frame>=240&&frame<248) for(let n=0;n<6;n++) await blur.dispatchEvent('keydown', { key: 'ArrowLeft', code: 'ArrowLeft' })
    if(frame===375||frame===450) await page.mouse.click(640,455)
    if(frame>=375&&frame<383) { for(let n=0;n<6;n++)await blur.dispatchEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight' }) }
    await page.clock.runFor(1000/30)
    const progress=Number(await page.locator('.duo-device').getAttribute('data-progress'))
    states.push({frame,progress,blur:Number(await blur.getAttribute('aria-valuenow')),scale,anchor:[ax,ay]})
    const image=await page.screenshot({type:'jpeg',quality:95,clip:{x:160,y:154,width:960,height:592}})
    if(!encoder.stdin.write(image)) await once(encoder.stdin,'drain')
    if([0,75,135,225,285,330,435,539].includes(frame)) await writeFile(`exports/proofs/${String(frame).padStart(3,'0')}.jpg`,image)
  }
  await writeFile('exports/frame-state.json',JSON.stringify({errors,states},null,2))
  if(errors.length)throw new Error(errors.join('\n'))
  encoder.stdin.end()
  const [code]=await once(encoder,'close')
  if(code!==0)throw new Error(`Encoder exited ${code}`)
} finally { await browser.close();if(encoder.exitCode===null)encoder.kill() }
