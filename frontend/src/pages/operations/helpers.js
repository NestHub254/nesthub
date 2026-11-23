export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Nairobi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const money=n=>new Intl.NumberFormat('en-KE',{style:'currency',currency:'KES',maximumFractionDigits:2}).format(Number(n)||0);
export const sum=(rows,key='amount')=>rows.reduce((n,r)=>n+Number(r[key]||0),0);
