import { useEffect, useRef, useState } from 'react';
import { Check, Monitor, Moon, Sun, X } from 'lucide-react';
import { cleanTheme, defaultTheme, themePresets, themeTokens } from './theme.js';

export function useWorkspaceTheme(userId) {
  const key=`nesthub-workspace-theme:${userId}`;
  const [theme,setTheme]=useState(()=>{try{return cleanTheme(JSON.parse(localStorage.getItem(key)));}catch{return defaultTheme;}});
  const [systemDark,setSystemDark]=useState(()=>window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)'),change=()=>setSystemDark(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(theme));}catch{/* Theme still works when storage is unavailable. */}},[key,theme]);
  return {theme,setTheme,style:themeTokens(theme,systemDark)};
}

export default function ThemeSelector({theme,onChange}) {
  const [open,setOpen]=useState(false),container=useRef(null),button=useRef(null);
  useEffect(()=>{
    if(!open)return;
    const outside=e=>{if(!container.current?.contains(e.target))setOpen(false);};
    const escape=e=>{if(e.key==='Escape'){setOpen(false);button.current?.focus();}};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[open]);
  return <div className="pm-theme-selector" ref={container}>
    <button ref={button} className="pm-theme-trigger" aria-label="Choose workspace theme" aria-expanded={open} aria-controls="workspace-theme-picker" onClick={()=>setOpen(!open)} title="Change theme for all modules"><span className="pm-colour-wheel" aria-hidden="true"/><span>Theme</span></button>
    {open&&<section id="workspace-theme-picker" className="pm-theme-popover" aria-label="Workspace theme">
      <header><div><h2>Make it yours</h2><p>One theme, every module.</p></div><button className="pm-icon-btn" aria-label="Close theme selector" onClick={()=>{setOpen(false);button.current?.focus();}}><X size={18}/></button></header>
      <p className="pm-theme-label">COLOUR PALETTE</p><div className="pm-theme-presets">{themePresets.map(p=><button key={p.id} aria-pressed={theme.accent.toLowerCase()===p.color.toLowerCase()} onClick={()=>onChange({...theme,accent:p.color})}><span style={{background:p.color}}>{theme.accent.toLowerCase()===p.color.toLowerCase()&&<Check size={15}/>}</span>{p.name}</button>)}</div>
      <label className="pm-custom-colour"><span>Custom accent colour<small>Choose your own colour</small></span><input type="color" aria-label="Custom accent colour" value={theme.accent} onChange={e=>onChange({...theme,accent:e.target.value})}/></label>
      <p className="pm-theme-label">APPEARANCE</p><div className="pm-theme-modes">{[['light','Light',Sun],['dark','Dark',Moon],['system','System',Monitor]].map(([id,name,Icon])=><button key={id} aria-pressed={theme.appearance===id} onClick={()=>onChange({...theme,appearance:id})}><Icon size={16}/>{name}</button>)}</div>
      <footer><span>Saved for your account in this browser.</span><button onClick={()=>onChange(defaultTheme)}>Reset</button></footer>
    </section>}
  </div>;
}
