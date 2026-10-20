/* Pure calculations: all dimensions in cm; metrage is rounded up to 0.1 m. */
(function(root){
const up=x=>Math.ceil((x-1e-9)*10)/10;
function calculate(kind,d){
 for(const [k,v] of Object.entries(d)) if(!Number.isFinite(v)||v<0) throw Error('Revisa los campos: usa números iguales o mayores que cero.');
 if(d.roll<=0||d.shrink>=30) throw Error('El ancho debe ser positivo y el encogimiento inferior al 30 %.');
 const scale=1/(1-d.shrink/100); let meters,parts=[],shape;
 if(kind==='cortinas'){
  if(d.width<=0||d.height<=0||d.fullness<1||![1,2].includes(d.leaves)) throw Error('Introduce medidas positivas y un fruncido de al menos 1.');
  const useful=d.roll*(1-d.shrink/100)-d.side*2;
  if(useful<=0) throw Error('Los márgenes laterales no caben en el ancho de tela.');
  const widths=Math.ceil((d.width*d.fullness/d.leaves-1e-9)/useful)*d.leaves;
  let cut=(d.height+d.hem)*scale;
  if(d.repeat>0)cut=Math.ceil((cut-1e-9)/d.repeat)*d.repeat;
  meters=widths*cut/100;
  parts=[['Paños de ancho completo',widths+''],['Largo de cada corte',cut.toFixed(1)+' cm'],['Ancho plano necesario',(d.width*d.fullness).toFixed(0)+' cm']];
  shape={w:d.width,h:d.height,n:d.leaves};
 }else if(kind==='manteles'){
  if(d.width<=0||d.height<=0) throw Error('Introduce las medidas de la mesa.');
  const a=(d.width+2*(d.drop+d.hem))*scale;
  const b=((d.round?d.width:d.height)+2*(d.drop+d.hem))*scale;
  const across=Math.min(a,b),along=Math.max(a,b);
  if(across>d.roll+1e-9) throw Error('No cabe en una sola pieza de este rollo. Necesitas una tela más ancha o un diseño con uniones; no calculamos esas uniones.');
  meters=along/100;
  parts=[['Pieza a cortar',a.toFixed(1)+' × '+b.toFixed(1)+' cm'],['Caída acabada por lado',d.drop+' cm'],['Orientación','Lado menor a lo ancho del rollo']];
  shape={w:d.width,h:d.round?d.width:d.height,round:d.round};
 }else{
  if(d.width<=0||d.height<=0||d.count<1||!Number.isInteger(d.count)) throw Error('Introduce medidas positivas y un número entero de cojines.');
  const a=(d.width+2*d.seam)*scale,b=(d.height+2*d.seam)*scale,n=2*d.count;
  const p=Math.floor((d.roll+1e-9)/a),q=Math.floor((d.roll+1e-9)/b);
  const v=p?Math.ceil(n/p)*b:Infinity,u=q?Math.ceil(n/q)*a:Infinity;
  if(!Number.isFinite(Math.min(v,u)))throw Error('Las piezas no caben en el ancho de tela indicado.');
  meters=Math.min(v,u)/100;
  parts=[['Rectángulos a cortar',n+' piezas'],['Tamaño de cada pieza',a.toFixed(1)+' × '+b.toFixed(1)+' cm'],['Distribución','Cuadrícula simple; permite girar piezas']];
  shape={w:d.width,h:d.height};
 }
 const buy=up(meters);
 return {meters,buy,cost:buy*d.price,parts,shape};
}
root.TelaCalc={calculate};
if(typeof module!=='undefined')module.exports={calculate};
})(typeof window==='undefined'?globalThis:window);
