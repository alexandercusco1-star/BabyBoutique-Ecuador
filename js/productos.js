const listaProductos = document.getElementById("listaProductos");
const contadorCarrito = document.getElementById("contadorCarrito");

let productos = [];
let carrito = {};
let cantidades = {};


// CARGAR PRODUCTOS

fetch("data/productos.json")

.then(res => res.json())

.then(data => {

    productos = data;

    mostrarProductos(productos);

});




// MOSTRAR PRODUCTOS

function mostrarProductos(lista){


    listaProductos.innerHTML = "";


    lista.forEach(producto => {



        if(!cantidades[producto.id]){

            cantidades[producto.id] = 0;

        }



        let tarjeta = document.createElement("div");

        tarjeta.className = "producto";



        tarjeta.innerHTML = `


        <img 
        id="imagen-${producto.id}"
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



        <p 
        class="precio"
        id="precio-${producto.id}">
        $${producto.precio.toFixed(2)}
        </p>



        <p class="tituloOpcion">
        Talla
        </p>


        <div class="opciones">


        ${producto.tallas.map(talla => `


        <div>


        <button onclick="seleccionarTalla(this)">
        ${talla.numero}
        </button>


        <div>
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



        <div>


        <button

        class="color ${color.nombre.toLowerCase()}"

        onclick="cambiarColor(${producto.id},${index})">

        </button>


        <div>
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






// SELECCIONAR TALLA

function seleccionarTalla(boton){


let grupo = boton.parentElement.parentElement;



grupo.querySelectorAll("button")
.forEach(btn=>{

btn.classList.remove("activo");

});



boton.classList.add("activo");



}







// SUMAR CANTIDAD

function sumar(id){


cantidades[id]++;



document.getElementById(`cantidad-${id}`)
.innerHTML = cantidades[id];



actualizarPrecio(id);

actualizarEnvio(id);



}







// RESTAR CANTIDAD

function restar(id){


if(cantidades[id]>0){

cantidades[id]--;

}



document.getElementById(`cantidad-${id}`)
.innerHTML = cantidades[id];



actualizarPrecio(id);

actualizarEnvio(id);



}







// CAMBIO DE PRECIO

function actualizarPrecio(id){


let producto = productos.find(p=>p.id==id);



let precio = producto.precio;



if(cantidades[id]>=12){


precio = producto.precioDocena;


}

else if(cantidades[id]>=6){


precio = producto.precioMediaDocena;


}



document.getElementById(`precio-${id}`)
.innerHTML =
"$"+precio.toFixed(2);



}







// MENSAJE ENVÍO GRATIS

function actualizarEnvio(id){


let faltan = 12 - cantidades[id];


let mensaje =
document.getElementById(`envio-${id}`);



if(faltan>0){


mensaje.innerHTML =
`Te faltan ${faltan} prendas para envío GRATIS 🚚`;


}else{


mensaje.innerHTML =
"🎉 Tu pedido tiene envío GRATIS";


}



}








// CAMBIAR COLOR

function cambiarColor(id,index){


let producto =
productos.find(p=>p.id==id);



document.getElementById(`imagen-${id}`)
.src =
producto.colores[index].imagen;



}







// AÑADIR AL CARRITO

function agregarCarrito(id){


let producto =
productos.find(p=>p.id==id);



if(cantidades[id]<=0){


alert("Seleccione una cantidad antes de añadir");

return;


}





carrito[id]={


id:producto.id,

nombre:producto.nombre,

cantidad:cantidades[id]


};




actualizarCarrito();



}







// CONTADOR DEL CARRITO

function actualizarCarrito(){


contadorCarrito.innerHTML =
Object.keys(carrito).length;



}







// FILTRAR CATEGORÍAS

function filtrarCategoria(categoria){


let resultado =
productos.filter(producto=>

producto.categoria === categoria

);



mostrarProductos(resultado);



}







// BOTONES DE CATEGORÍA

document.querySelectorAll(".menuCategorias button")
.forEach(boton=>{


boton.addEventListener("click",()=>{



let texto =
boton.textContent;



if(texto.includes("Bodies")){


filtrarCategoria("Body");


}



if(texto.includes("Enterizos")){


filtrarCategoria("Enterizos");


}



if(texto.includes("Toallas")){


filtrarCategoria("Toallas");


}



});



});







// WHATSAPP

function enviarWhatsApp(){



if(Object.keys(carrito).length===0){


alert("El carrito está vacío");


return;


}



let mensaje =
"Hola, deseo realizar un pedido:%0A%0A";



Object.values(carrito).forEach(item=>{


mensaje +=
`${item.nombre} - Cantidad: ${item.cantidad}%0A`;


});



const telefono="593984391581";



window.open(

`https://wa.me/${telefono}?text=${mensaje}`,

"_blank"

);



}
