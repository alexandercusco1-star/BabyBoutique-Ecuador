const listaProductos = document.getElementById("listaProductos");

let cantidades = {};

fetch("data/productos.json")
.then(respuesta => respuesta.json())
.then(productos => {

    productos.forEach(producto => {

        cantidades[producto.id] = 0;

        let tarjeta = document.createElement("div");
        tarjeta.classList.add("producto");

        tarjeta.innerHTML = `

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
${producto.disponible ? "Disponible ✅" : "Agotado ❌"}
</p>

<p class="precio" id="precio-${producto.id}">
$${producto.precio.toFixed(2)}
</p>

<p class="tituloOpcion">
Talla
</p>

<div class="opciones">

${producto.tallas.map(talla => `

<div style="text-align:center">

<button onclick="seleccionarTalla(this)">
${talla.numero}
</button>

<div style="font-size:11px;margin-top:4px;">
${talla.edad}
</div>

</div>

`).join("")}

</div>

<p class="tituloOpcion">
Color
</p>

<div class="opciones">

${producto.colores.map((color,index)=>`

<div style="text-align:center">

<button
class="color ${color.nombre.toLowerCase()}"
onclick="cambiarColor(${producto.id},${index})">
</button>

<div style="font-size:11px;margin-top:4px;">
${color.nombre}
</div>

</div>

`).join("")}

</div>

<p class="tituloOpcion">
Cantidad
</p>

<div class="cantidad">

<button onclick="restar(${producto.id})">
-
</button>

<span
class="numeroCantidad"
id="cantidad-${producto.id}">
0
</span>

<button onclick="sumar(${producto.id})">
+
</button>

</div>

<p id="envio-${producto.id}">
Te faltan 12 prendas para tener envío GRATIS 🚚
</p>

<button class="btnCarrito">
🛒 Añadir al carrito
</button>

</div>

`;

        listaProductos.appendChild(tarjeta);

    });

});

function seleccionarTalla(boton){

document
.querySelectorAll(".opciones button")
.forEach(btn=>{

if(btn.innerHTML.match(/[0-9]/)){
btn.classList.remove("activo");
}

});

boton.classList.add("activo");

}

function sumar(id){

cantidades[id]++;

document.getElementById(`cantidad-${id}`).innerHTML =
cantidades[id];

actualizarPrecio(id);

actualizarEnvio(id);

}

function restar(id){

if(cantidades[id]>0){

cantidades[id]--;

}

document.getElementById(`cantidad-${id}`).innerHTML =
cantidades[id];

actualizarPrecio(id);

actualizarEnvio(id);

}function actualizarPrecio(id){

fetch("data/productos.json")
.then(res=>res.json())
.then(productos=>{

let producto=productos.find(p=>p.id==id);

let precio=producto.precio;

if(cantidades[id]>=12){

precio=producto.precioDocena;

}else if(cantidades[id]>=6){

precio=producto.precioMediaDocena;

}

document.getElementById(`precio-${id}`).innerHTML=
`$${precio.toFixed(2)}`;

});

}



function actualizarEnvio(id){

let faltan=12-cantidades[id];

let mensaje=document.getElementById(`envio-${id}`);

if(faltan>0){

mensaje.innerHTML=
`Te faltan ${faltan} prendas para tener envío GRATIS 🚚`;

}else{

mensaje.innerHTML=
`🎉 ¡Tu pedido tiene envío GRATIS!`;

}

}



function cambiarColor(id,index){

fetch("data/productos.json")
.then(res=>res.json())
.then(productos=>{

let producto=productos.find(p=>p.id==id);

document.getElementById(`imagen-${id}`).src=
producto.colores[index].imagen;

});

}
