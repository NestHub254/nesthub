export const themePresets = [
  { id:'ocean', name:'Ocean', color:'#2563eb' },
  { id:'violet', name:'Violet', color:'#7c3aed' },
  { id:'forest', name:'Forest', color:'#23845b' },
  { id:'sunset', name:'Sunset', color:'#c56927' },
  { id:'rose', name:'Rose', color:'#c83e73' },
  { id:'slate', name:'Slate', color:'#526078' },
];
export const defaultTheme = { accent:'#2563eb', appearance:'light' };
export function cleanTheme(value) {
  return { accent:/^#[0-9a-f]{6}$/i.test(value?.accent) ? value.accent : defaultTheme.accent, appearance:['light','dark','system'].includes(value?.appearance) ? value.appearance : 'light' };
}
export function hueOf(hex) {
  const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min,l=(max+min)/2;
  let h=0;if(delta){if(max===r)h=((g-b)/delta)%6;else if(max===g)h=(b-r)/delta+2;else h=(r-g)/delta+4;h*=60;if(h<0)h+=360;}
  return {h,s:delta===0?0:delta/(1-Math.abs(2*l-1))*100,l:l*100};
}
export function themeTokens(preference, systemDark=false) {
  const config=cleanTheme(preference),dark=config.appearance==='dark'||(config.appearance==='system'&&systemDark);
  const {h,s}=hueOf(config.accent),sat=Math.min(76,Math.max(s,18)),neutral=s<12?0:Math.min(20,sat);
  const c=(s,l)=>`hsl(${Math.round(h)} ${Math.round(s)}% ${l}%)`;
  return {
    '--t-canvas':c(neutral,dark?8:97), '--t-surface':c(neutral,dark?12:100),
    '--t-raised':c(neutral,dark?16:99), '--t-soft':c(Math.min(sat,35),dark?19:94),
    '--t-tint':c(Math.min(sat,35),dark?15:97), '--t-border':c(neutral,dark?25:87),
    '--t-line':c(neutral,dark?21:92), '--t-text':c(neutral,dark?94:17),
    '--t-muted':c(neutral,dark?74:39), '--t-faint':c(neutral,dark?65:44),
    '--t-accent':c(sat,dark?73:34), '--t-accent-hover':c(sat,dark?80:27),
    '--t-accent-ink':dark?c(30,10):'#ffffff', '--t-accent-soft':c(Math.min(sat,50),dark?24:89),
    '--t-accent-muted':c(Math.min(sat,35),dark?63:43),
    '--t-deep':c(Math.min(sat,38),dark?15:20), '--t-deep-ink':c(25,94),
    '--t-sidebar':c(Math.min(sat,38),dark?6:13), '--t-sidebar-ink':c(20,83),
    '--t-sidebar-muted':c(17,66), '--t-sidebar-active':c(Math.min(sat,50),dark?29:89),
    '--t-sidebar-active-ink':c(30,dark?96:20), '--t-shadow':c(neutral,3),
    '--t-chart-secondary':c(Math.min(sat,25),dark?43:73),
    colorScheme:dark?'dark':'light',
  };
}
