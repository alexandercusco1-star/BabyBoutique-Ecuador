const listaCarrito = document.getElementById("listaCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const contadorCarrito = document.getElementById("contadorCarrito");


let carrito = JSON.parse(localStorage.getItem("carrito")) || {};





function mostrarCarrito(){


listaCarrito.innerHTML="";


let total = 0;



if(Object.keys(carrito).length === 0){


listaCarrito.innerHTML = `

<h2>
Tu carrito está vacío 🛒
</h2>

`;

actualizarContador();

return;


}





Object.values(carrito).forEach(producto=>{



let precio = producto.precio;



if(producto.cantidad >= 12){

precio = producto.precioDocena || precio;


}

else if(producto.cantidad >= 6){

precio = producto.precioMediaDocena || precio;


}




let subtotal = precio * producto.cantidad;


total += subtotal;





let tarjeta = document.createElement("div");


tarjeta.className="producto";



tarjeta.innerHTML = `


<div class="infoProducto">


<h2>
${producto.nombre}
</h2>


<p>
Cantidad: ${producto.cantidad}
</p>


<p>
Precio unitario: $${precio.toFixed(2)}
</p>


<p>
Subtotal: $${subtotal.toFixed(2)}
</p>



<button 
class="btnCarrito"
onclick="eliminarProducto(${producto.id})">

❌ Eliminar

</button>



</div>



`;



listaCarrito.appendChild(tarjeta);



});




totalCarrito.innerHTML =
`Total: $${total.toFixed(2)}`;



actualizarContador();



}








function eliminarProducto(id){


delete carrito[id];



localStorage.setItem(

"carrito",

JSON.stringify(carrito)

);



mostrarCarrito();



}







function actualizarContador(){


if(contadorCarrito){


contadorCarrito.innerHTML =
Object.keys(carrito).length;


}



}







function enviarWhatsApp(){



if(Object.keys(carrito).length===0){


alert("El carrito está vacío");


return;


}




let mensaje =
"Hola, deseo realizar el siguiente pedido:%0A%0A";



Object.values(carrito).forEach(producto=>{


mensaje += 
`${producto.nombre}%0A`;

mensaje +=
`Cantidad: ${producto.cantidad}%0A%0A`;


});



mensaje +=
"Gracias.";



let telefono =
"593984391581";



window.open(

`https://wa.me/${telefono}?text=${mensaje}`,

"_blank"

);



}





mostrarCarrito();
