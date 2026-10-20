const kind=document.body.dataset.kind;
const configs={
 cortinas:{fields:[['width','Ancho de barra o riel',200,'cm','Mide la barra, no solo el cristal.'],['height','Altura terminada',250,'cm','Desde el encabezado hasta el borde final.'],['fullness','Coeficiente de fruncido',2,'×','Consulta la cinta o confección elegida.'],['leaves','Hojas de cortina',2,'select',''],['roll','Ancho del rollo',140,'cm','Ancho completo antes de lavar.'],['hem','Márgenes superior + inferior',25,'cm','Suma de ambos márgenes por paño.'],['side','Reserva lateral por borde',3,'cm','Incluye costuras o dobladillo lateral.'],['repeat','Repetición vertical del dibujo',0,'cm','0 para tela lisa. No calcula case horizontal.']],note:'Paños verticales de ancho completo, repartidos por igual entre hojas. No incluye forro, doble ancho girado ni uniones especiales.'},
 manteles:{fields:[['round','Forma de la mesa',0,'shape',''],['width','Ancho o diámetro de mesa',90,'cm','Para mesa redonda, indica el diámetro.'],['height','Largo de mesa rectangular',160,'cm','Se ignora si la mesa es redonda.'],['drop','Caída por lado',25,'cm','Lo que cuelga desde el borde de la mesa.'],['roll','Ancho del rollo',280,'cm','Para un mantel de una sola pieza.'],['hem','Reserva de dobladillo por lado',3,'cm','Reserva total de tela para plegar cada borde.']],note:'Mantel de una sola pieza y tela lisa, con giro permitido. Para estampados con dirección o manteles con uniones, consulta el patrón.'},
 cojines:{fields:[['width','Ancho acabado',45,'cm','Medida de la funda terminada.'],['height','Alto acabado',45,'cm','No es la medida de corte.'],['count','Número de cojines',2,'ud.','Dos caras por funda.'],['seam','Costura por borde',1.5,'cm','Se añade en los cuatro lados.'],['roll','Ancho del rollo',140,'cm','Tela lisa que permita girar las piezas.']],note:'Fundas de dos caras, sin solapa ni vivo. Distribución en cuadrícula con giro permitido; no es una optimización de corte profesional. No apto para pelo, dirección obligatoria o casado de dibujos.'}
};
const c=configs[kind];
const form=document.querySelector('form');
function field([id,label,value,unit,hint]){
 const tag=document.createElement('label'); tag.htmlFor=id;
 tag.append(document.createTextNode(label));
 if(hint){const s=document.createElement('small');s.textContent=hint;tag.append(s);}
 if(unit==='select'||unit==='shape'){
  const sel=document.createElement('select');sel.id=id;sel.name=id;
  const options=unit==='select'?[[1,'Una hoja'],[2,'Dos hojas']]:[[0,'Rectangular / cuadrada'],[1,'Redonda']];
  options.forEach(([v,t])=>sel.add(new Option(t,v,false,v===value)));tag.append(sel);
 }else{
  const wrap=document.createElement('div');wrap.className='input-wrap';
  const input=document.createElement('input');input.id=id;input.name=id;input.type='number';input.step=id==='count'?'1':'any';input.min='0';input.required=true;input.value=value;
  if(id==='shrink')input.max='29.99';if(id==='count')input.min='1';
  const suffix=document.createElement('span');suffix.textContent=unit;wrap.append(input,suffix);tag.append(wrap);
 }
 return tag;
}
const fields=document.querySelector('.fields');c.fields.forEach(f=>fields.append(field(f)));
const sub=document.createElement('div');sub.className='subhead';sub.textContent='Ajustes de compra';fields.append(sub);
[['shrink','Encogimiento previsto',0,'%','0 si la tela ya está prelavada.'],['price','Precio por metro lineal',12,'€/m','Opcional. Pon 0 si no quieres calcularlo.']].forEach(f=>fields.append(field(f)));
document.querySelector('#scope').textContent=c.note;
const fmt=n=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(n);
function read(){return Object.fromEntries([...form.elements].filter(x=>x.name).map(x=>[x.name,x.value===''?NaN:Number(x.value)]));}
function render(){
 const d=read();
 try{
  const r=TelaCalc.calculate(kind,d);document.querySelector('#error').hidden=true;document.querySelector('#success').hidden=false;
  document.querySelector('#total').textContent=fmt(r.buy);
  document.querySelector('#exact').textContent='Cálculo: '+fmt(r.meters)+' m · compra redondeada hacia arriba a 10 cm.';
  const dl=document.querySelector('dl');dl.replaceChildren();
  r.parts.forEach(([k,v])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;row.append(dt,dd);dl.append(row);});
  document.querySelector('#cost').textContent=fmt(r.cost)+' €';
  draw(r.shape);document.querySelector('#status').textContent='Resultado actualizado: '+fmt(r.buy)+' metros.';
 }catch(e){document.querySelector('#error').hidden=false;document.querySelector('#error').textContent=e.message;document.querySelector('#success').hidden=true;document.querySelector('#drawing').replaceChildren();document.querySelector('#status').textContent=e.message;}
}
function draw(s){
 const svg=document.querySelector('#drawing');const ratio=Math.min(270/s.w,95/s.h);const w=s.w*ratio,h=s.h*ratio,x=(360-w)/2,y=22;
 let interior='';
 if(kind==='cortinas')for(let i=1;i<12;i++)interior+=`<line x1="${x+w*i/12}" y1="${y}" x2="${x+w*i/12}" y2="${y+h}" stroke="#a8b787" stroke-width="2"/>`;
 svg.innerHTML=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${s.round?Math.min(w,h)/2:kind==='cojines'?14:2}" fill="#d3ddb8" stroke="#526b46" stroke-width="2"/>${interior}<line x1="${x}" y1="${y+h+12}" x2="${x+w}" y2="${y+h+12}" stroke="#526b46"/><text x="180" y="${y+h+29}" text-anchor="middle" fill="#243b32" font-size="12">${fmt(s.w)} cm</text><text x="${x+w+8}" y="${y+h/2}" fill="#243b32" font-size="12">${fmt(s.h)} cm</text>`;
}
form.addEventListener('input',render);form.addEventListener('change',render);form.addEventListener('submit',e=>{e.preventDefault();render();});
document.querySelector('#reset').addEventListener('click',()=>{form.reset();render();});
document.querySelector('#print').addEventListener('click',()=>window.print());
document.querySelector('#copy').addEventListener('click',async()=>{const d=read();const url=new URL(location.href);url.search=new URLSearchParams(d).toString();try{await navigator.clipboard.writeText(url.href);document.querySelector('#status').textContent='Enlace con tus medidas copiado.';}catch{document.querySelector('#status').textContent='No se pudo copiar. Puedes guardar la ficha con Imprimir.';}});
const params=new URLSearchParams(location.search);for(const el of form.elements)if(el.name&&params.has(el.name))el.value=params.get(el.name);
render();
