const listaProductos = document.getElementById("listaProductos");
const contadorCarrito = document.getElementById("contadorCarrito");

let productos = [];
let carrito = [];
let cantidades = {};

fetch("data/productos.json")
.then(res=>res.json())
.then(data=>{

productos=data;

mostrarProductos(productos);

});

function mostrarProductos(lista){

listaProductos.innerHTML="";

lista.forEach(producto=>{

if(!cantidades[producto.id]){
cantidades[producto.id]=0;
}

let tarjeta=document.createElement("div");

tarjeta.className="producto";

tarjeta.innerHTML=`

<img id="imagen-${producto.id}"
src="${producto.colores[0].imagen}"
alt="${producto.nombre}">

<div class="infoProducto">

<h2>${producto.nombre}</h2>

<p class="codigo">
Código: ${producto.codigo}
</p>

<p>
Tela: ${producto.tela}
</p>

<p>
Clima: ${producto.clima}
</p>

<p class="estado">
${producto.disponible ? "Disponible ✅":"Agotado ❌"}
</p>

<p
class="precio"
id="precio-${producto.id}">
$${producto.precio.toFixed(2)}
</p>

<p class="tituloOpcion">
Talla
</p>

<div class="opciones">

${producto.tallas.map(t=>`

<div>

<button
onclick="seleccionarTalla(this)">
${t.numero}
</button>

<div>
${t.edad}
</div>

</div>

`).join("")}

</div>

<p class="tituloOpcion">
Color
</p>

<div class="opciones">

${producto.colores.map((c,index)=>`

<div>

<button
class="color ${c.nombre.toLowerCase()}"
onclick="cambiarColor(${producto.id},${index})">
</button>

<div>
${c.nombre}
</div>

</div>

`).join("")}

</div>

<p class="tituloOpcion">
Cantidad
</p>

<div class="cantidad">

<button
onclick="restar(${producto.id})">
-
</button>

<span
class="numeroCantidad"
id="cantidad-${producto.id}">
0
</span>

<button
onclick="sumar(${producto.id})">
+
</button>

</div>

<p id="envio-${producto.id}">
Te faltan 12 prendas para obtener envío GRATIS 🚚
</p>

<button
class="btnCarrito"
onclick="agregarCarrito(${producto.id})">

🛒 Añadir al carrito

</button>

</div>

`;

listaProductos.appendChild(tarjeta);

});

}

function seleccionarTalla(boton){

let grupo=boton.parentElement.parentElement;

grupo.querySelectorAll("button").forEach(btn=>{
btn.classList.remove("activo");
});

boton.classList.add("activo");

}

function sumar(id){

cantidades[id]++;

document.getElementById(`cantidad-${id}`).innerHTML=
cantidades[id];

actualizarPrecio(id);

actualizarEnvio(id);

}

function restar(id){

if(cantidades[id]>0){

cantidades[id]--;

}

document.getElementById(`cantidad-${id}`).innerHTML=
cantidades[id];

actualizarPrecio(id);

actualizarEnvio(id);

}

function actualizarPrecio(id){

let producto=productos.find(p=>p.id==id);

let precio=producto.precio;

if(cantidades[id]>=12){

precio=producto.precioDocena;

}else if(cantidades[id]>=6){

precio=producto.precioMediaDocena;

}

document.getElementById(`precio-${id}`).innerHTML=
"$"+precio.toFixed(2);

}

function actualizarEnvio(id){

let faltan=12-cantidades[id];

let mensaje=document.getElementById(`envio-${id}`);

if(faltan>0){

mensaje.innerHTML=
`Te faltan ${faltan} prendas para obtener envío GRATIS 🚚`;

}else{

mensaje.innerHTML=
"🎉 ¡Tu pedido tiene envío GRATIS!";

}

}

function cambiarColor(id,index){

let producto=productos.find(p=>p.id==id);

document.getElementById(`imagen-${id}`).src=
producto.colores[index].imagen;

}

function agregarCarrito(id){

let producto=productos.find(p=>p.id==id);

let existente=carrito.find(p=>p.id==id);

if(existente){

existente.cantidad=cantidades[id];

}else{

carrito.push({

id:producto.id,

nombre:producto.nombre,

cantidad:cantidades[id],

precio:producto.precio

});

}

actualizarCarrito();

}

function actualizarCarrito(){

contadorCarrito.innerHTML=carrito.length;

}

function filtrarCategoria(categoria){

if(categoria=="Todos"){

mostrarProductos(productos);

return;

}

let filtrados=productos.filter(producto=>{

return producto.categoria===categoria;

});

mostrarProductos(filtrados);

}

function calcularTotal(){

let total=0;

carrito.forEach(item=>{

let producto=productos.find(p=>p.id==item.id);

let precio=producto.precio;

if(item.cantidad>=12){

precio=producto.precioDocena;

}else if(item.cantidad>=6){

precio=producto.precioMediaDocena;

}

total+=precio*item.cantidad;

});

return total.toFixed(2);

}

function generarCodigoPedido(){

const ahora=new Date();

const año=ahora.getFullYear();

const mes=String(ahora.getMonth()+1).padStart(2,"0");

const dia=String(ahora.getDate()).padStart(2,"0");

const numero=Math.floor(Math.random()*90000)+10000;

return `BBE-${año}${mes}${dia}-${numero}`;

}

function enviarWhatsApp(){

if(carrito.length===0){

alert("Primero agrega productos al carrito.");

return;

}

let codigo=generarCodigoPedido();

let mensaje=`Hola, deseo realizar el siguiente pedido.%0A%0A`;

mensaje+=`Código: ${codigo}%0A%0A`;

carrito.forEach(item=>{

mensaje+=`${item.nombre}%0A`;

mensaje+=`Cantidad: ${item.cantidad}%0A%0A`;

});

mensaje+=`Total: $${calcularTotal()}%0A`;

mensaje+=`Solicito el descuento correspondiente.%0A`;

const telefono="593XXXXXXXXX";

window.open(`https://wa.me/${telefono}?text=${mensaje}`,"_blank");

}

document.querySelectorAll(".menuCategorias button").forEach(boton=>{

boton.addEventListener("click",()=>{

document.querySelectorAll(".menuCategorias button")
.forEach(btn=>btn.classList.remove("activo"));

boton.classList.add("activo");

const texto=boton.textContent.trim();

if(texto.includes("Bodies")){

filtrarCategoria("Body");

}else if(texto.includes("Enterizos")){

filtrarCategoria("Enterizos");

}else if(texto.includes("Conjuntos")){

filtrarCategoria("Conjuntos");

}else if(texto.includes("Medias")){

filtrarCategoria("Medias");

}else if(texto.includes("Toallas")){

filtrarCategoria("Toallas");

}else if(texto.includes("Accesorios")){

filtrarCategoria("Accesorios");

}

});

});
