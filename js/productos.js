
const listaProductos = document.getElementById("listaProductos");
const contadorCarrito = document.getElementById("contadorCarrito");

let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || {};
let cantidades = {};

fetch("data/productos.json")
.then(res => res.json())
.then(data => {

    productos = data;

    mostrarProductos(productos);

    actualizarCarrito();

});



function mostrarProductos(lista){

    listaProductos.innerHTML = "";


    lista.forEach(producto=>{


        cantidades[producto.id] = 0;


        let tarjeta = document.createElement("div");

        tarjeta.className="producto";


        tarjeta.innerHTML = `


<img 
id="imagen-${producto.id}"
src="${producto.colores[0].imagen}"
alt="${producto.nombre}">


<div class="infoProducto">


<h2>${producto.nombre}</h2>


<p>
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



<p class="precio" id="precio-${producto.id}">
$${producto.precio.toFixed(2)}
</p>



<p class="tituloOpcion">
Talla
</p>


<div class="opciones">


${producto.tallas.map(t=>`

<div>

<button onclick="seleccionarTalla(this)">
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


<button onclick="restar(${producto.id})">
-
</button>


<span 
id="cantidad-${producto.id}"
class="numeroCantidad">
0
</span>


<button onclick="sumar(${producto.id})">
+
</button>


</div>



<p id="envio-${producto.id}">
Te faltan 12 prendas para envío GRATIS 🚚
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
