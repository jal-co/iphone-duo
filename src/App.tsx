import { useState } from 'react'
import { DialRoot, useDialKitController } from 'dialkit'
import 'dialkit/styles.css'
import { SocialLinks } from './SocialLinks'
import { AppleCredit, FoldablePhone, FoldScrubber, FoldToggle, PhoneBackground, PhoneDevice } from './iphone-duo'

const wallpapers = ['lock', 'tide', 'ink'] as const

export default function App() {
  const [tuning, setTuning] = useState(false)
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const dial = useDialKitController('iPhone Duo', {
    fold: [0, 0, 180, 1],
    rotation: [-6, -35, 35, 1],
    duration: [2, 0.2, 3, 0.05],
    blur: [48, 0, 80, 1],
    parallax: [1, 0, 2, 0.05],
    exposure: [1.2, 0.5, 2, 0.05],
    background: { type: 'select', options: ['Studio', 'Sand', 'Slate'], default: 'Studio' },
    screen: { type: 'image', options: wallpapers.map(name => ({ value: `/wallpapers/${name === 'lock' ? 'apple-desert.avif' : `${name}.svg`}`, label: name })), default: '/wallpapers/apple-desert.avif' },
    cover: { type: 'image', options: wallpapers.map(name => ({ value: `/wallpapers/${name === 'lock' ? 'apple-desert-cover.avif' : `${name}.svg`}`, label: name })), default: '/wallpapers/apple-desert-cover.avif' },
  }, { id: 'iphone-duo', persist: true })
  const { values } = dial
  function chooseWallpaper(name: string) {
    dial.setValues({ screen: `/wallpapers/${name === 'lock' ? 'apple-desert.avif' : `${name}.svg`}`, cover: `/wallpapers/${name === 'lock' ? 'apple-desert-cover.avif' : `${name}.svg`}` })
  }
  return <main className={dark ? 'page dark' : 'page'}>
    <FoldablePhone className="phone-study" value={values.fold / 180} onValueChange={value => dial.setValue('fold', value * 180)} duration={values.duration}>
      <PhoneBackground data-background={values.background} />
      <PhoneDevice modelSrc="/models/iphone-duo.glb" screenSrc={values.screen} coverSrc={values.cover} rotation={values.rotation} exposure={values.exposure} blur={values.blur} parallax={values.parallax} revealSrc={values.screen === '/wallpapers/apple-desert.avif' ? '/wallpapers/home-photo.svg' : undefined} screenOverlaySrc={values.screen === '/wallpapers/apple-desert.avif' ? '/wallpapers/home-apps.svg' : undefined} coverOverlaySrc={values.cover === '/wallpapers/apple-desert-cover.avif' ? '/wallpapers/home-cover.svg' : undefined} />
      <div className="phone-controls">
        <div className="fold-controls"><FoldToggle /><FoldScrubber /><output aria-label="Opening angle">{Math.round(values.fold)}°</output></div>
        <div className="wallpaper-controls" role="group" aria-label="Wallpaper">
          {wallpapers.map(name => <button key={name} type="button" aria-label={`${name} wallpaper`} aria-pressed={values.screen === `/wallpapers/${name === 'lock' ? 'apple-desert.avif' : `${name}.svg`}`} onClick={() => chooseWallpaper(name)}><img src={`/wallpapers/${name === 'lock' ? 'apple-desert-cover.avif' : `${name}.svg`}`} width="28" height="28" alt="" /></button>)}
        </div>
      </div>
      <div className="phone-caption"><span>Drag to unfold. Click to open or close.</span><AppleCredit /></div>
    </FoldablePhone>
    <nav className="page-actions" aria-label="Page controls"><button type="button" onClick={() => setDark(!dark)}>{dark ? 'Light mode' : 'Dark mode'}</button><a href="https://www.apple.com/iphone-duo/" target="_blank" rel="noopener noreferrer">iPhone Duo</a></nav>
    <SocialLinks />
    <button className="tuning-toggle" type="button" aria-expanded={tuning} aria-controls="phone-tuning" onClick={() => setTuning(!tuning)}>{tuning ? 'Close controls' : 'Tune'}</button>
    <aside id="phone-tuning" className="tuning-panel" aria-label="Phone settings" hidden={!tuning}><DialRoot mode="inline" defaultOpen theme={dark ? 'dark' : 'light'} productionEnabled /></aside>
  </main>
}
