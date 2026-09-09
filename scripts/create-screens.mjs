import { writeFileSync } from 'node:fs'
const dir=new URL('../public/wallpapers/', import.meta.url).pathname
const symbols=[
 ['#517467','<path d="M25 30h30v34H25zM55 40l17-10v34L55 54z"/>'],
 ['#f2e9d8','<path d="M26 24h48v52H26z" fill="#fff"/><path d="M26 24h48v14H26z" fill="#bc613c"/><text x="50" y="66" text-anchor="middle" font-size="30" fill="#252a27">9</text>'],
 ['#cf8159','<circle cx="50" cy="50" r="23" fill="none" stroke="white" stroke-width="7"/><circle cx="50" cy="50" r="8"/>'],
 ['#404742','<rect x="22" y="30" width="56" height="42" rx="10"/><circle cx="50" cy="51" r="13" fill="#404742"/><path d="M33 30l6-10h22l6 10"/>'],
 ['#608da0','<rect x="22" y="30" width="56" height="40" rx="7"/><path d="M25 34l25 20 25-20" fill="none" stroke="#608da0" stroke-width="5"/>'],
 ['#c7ad68','<rect x="28" y="21" width="44" height="58" rx="5"/><path d="M38 37h24M38 48h24M38 59h15" stroke="#a18c51" stroke-width="4"/>'],
 ['#ecebe5','<circle cx="50" cy="50" r="29" fill="#343c38"/><path d="M50 29v22l14 9" fill="none" stroke="white" stroke-width="4"/>'],
 ['#729284','<path d="M21 28l20-8 20 8 18-8v54l-18 7-20-8-20 8z"/><path d="M41 23v50M61 28v49" stroke="#729284" stroke-width="3"/>'],
 ['#394139','<rect x="21" y="29" width="58" height="40" rx="7" fill="none" stroke="white" stroke-width="6"/><path d="M38 78h24" stroke="white" stroke-width="5"/>'],
 ['#f1e9df','<path d="M28 24h44v52H28z" fill="#b26e55"/><path d="M37 36h26M37 47h26M37 58h17" stroke="white" stroke-width="4"/>'],
 ['#749ba7','<path d="M26 73l24-48 24 48M35 57h30" fill="none" stroke="white" stroke-width="7" stroke-linecap="round"/>'],
 ['#c46f4d','<path d="M35 62l8-26 29-13-13 29-24 10M32 58l-10 20 20-10"/><circle cx="56" cy="39" r="6" fill="#c46f4d"/>'],
 ['#f0e7dc','<path d="M50 75C8 49 27 13 50 37 73 13 92 49 50 75" fill="#b5665e"/>'],
 ['#4e625a','<rect x="22" y="29" width="56" height="44" rx="8"/><path d="M22 39h56" stroke="#c7ad68" stroke-width="8"/><path d="M60 54h18v12H60z" fill="#4e625a"/>'],
 ['#939e8a','<path d="M50 21c18 0 29 12 29 29S67 79 50 79 21 68 21 50 32 21 50 21z" fill="none" stroke="white" stroke-width="5"/><path d="M31 65c25-1 6-33 37-29" fill="none" stroke="white" stroke-width="5"/>'],
 ['#666d68','<circle cx="50" cy="50" r="24" fill="none" stroke="white" stroke-width="9"/><circle cx="50" cy="50" r="8"/>'],
]
const icon=(i,x,y,size)=>{const [color,shape]=symbols[i];return `<g transform="translate(${x} ${y}) scale(${size/100})"><rect width="100" height="100" rx="25" fill="${color}"/><g fill="#fff" font-family="Helvetica,Arial,sans-serif">${shape}</g></g>`}
const weather=(x,y,size)=>`<g transform="translate(${x} ${y}) scale(${size/250})"><rect width="250" height="250" rx="35" fill="#52788b"/><g fill="white" font-family="Helvetica,Arial,sans-serif"><text x="24" y="42" font-size="21">San Francisco</text><text x="20" y="118" font-size="75" font-weight="300">54°</text><circle cx="39" cy="159" r="14" fill="#f0cf7b"/><path d="M30 172h51a15 15 0 0 0-20-15 18 18 0 0 0-31 15"/><text x="24" y="213" font-size="19">Partly cloudy</text></g></g>`
const calendar=(x,y,size)=>`<g transform="translate(${x} ${y}) scale(${size/250})"><rect width="250" height="250" rx="35" fill="#eee9de"/><g font-family="Helvetica,Arial,sans-serif"><text x="24" y="42" fill="#9b4e33" font-size="21">WEDNESDAY</text><text x="20" y="134" fill="#303b35" font-size="88">9</text><path d="M24 163h202" stroke="#b9b9ac"/><circle cx="32" cy="196" r="6" fill="#598477"/><text x="50" y="202" fill="#303b35" font-size="17">Factory launch</text></g></g>`
for(const cover of [false,true]){
const width=cover?800:1600,left=cover?44:780,scale=cover?1.72:1.87
let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="1120" viewBox="0 0 ${width} 1120">`
s+=weather(left,116,142*scale)+calendar(left+160*scale,116,142*scale)
for(let i=0;i<16;i++)s+=icon(i,left+i%4*80*scale,116+(163+Math.floor(i/4)*82)*scale,62*scale)
const dock=width-112
s+=`<rect x="${dock-12}" y="360" width="100" height="420" rx="44" fill="#e7e2d6" fill-opacity=".6"/>`
for(let i=0;i<4;i++)s+=icon([0,7,4,14][i],dock,378+i*98,76)
s+=`<text x="${width-82}" y="80" text-anchor="middle" fill="white" font-family="Helvetica,Arial,sans-serif" font-size="25" font-weight="600">9:41</text><path d="M${width-105} 127q23-24 46 0m-37 10q14-14 28 0m-20 10q6-6 12 0" fill="none" stroke="white" stroke-width="4"/><circle cx="${width/2-14}" cy="1070" r="6" fill="white"/><circle cx="${width/2+14}" cy="1070" r="6" fill="white" fill-opacity=".4"/></svg>`
writeFileSync(dir+(cover?'home-cover.svg':'home-apps.svg'),s)
}
writeFileSync(dir+'home-photo.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1120" viewBox="0 0 1600 1120"><defs><clipPath id="panel"><rect x="105" y="116" width="572" height="892" rx="42"/></clipPath><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0v32" fill="none" stroke="#7aff78" stroke-opacity=".08" stroke-width="1"/></pattern></defs><g clip-path="url(#panel)"><path d="M105 116h572v892H105z" fill="#111a15"/><path d="M105 116h572v892H105z" fill="url(#grid)"/><g fill="#7aff78" font-family="Helvetica,Arial,sans-serif"><text x="155" y="199" font-size="22" letter-spacing="4">MASTRA</text><text x="153" y="293" font-size="72" font-weight="600" letter-spacing="-3">Factory</text><text x="157" y="351" font-size="32">Out now.</text></g><g transform="translate(188 470)"><path d="M0 230V70l95 48V70l95 48V0h66v140h45v90z" fill="#7aff78"/><path d="M32 162h35v35H32zm68 0h35v35h-35zm68 0h35v35h-35zm68 0h35v35h-35z" fill="#111a15"/><path d="M200-22c-38-14-45-41-19-58-5-25 19-39 42-28 25-21 57-2 53 24 34 17 21 50-13 48" fill="none" stroke="#7aff78" stroke-width="12" stroke-linecap="round"/></g><path d="M155 826h472" stroke="#354b3b"/><text x="155" y="884" fill="#e1eddf" font-family="Helvetica,Arial,sans-serif" font-size="27">Build with Mastra.</text><text x="155" y="945" fill="#7aff78" font-family="Helvetica,Arial,sans-serif" font-size="22">mastra.ai</text><path d="M578 926h34v34m0-34-34 34" fill="none" stroke="#7aff78" stroke-width="4"/></g></svg>`)
