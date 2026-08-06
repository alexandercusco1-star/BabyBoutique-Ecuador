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
onclick="agregarCarrito(${producto.id});">

🛒 Añadir al carrito

</button>



</div>


`;



listaProductos.appendChild(tarjeta);



});


}

function seleccionarTalla(boton){

let grupo = boton.parentElement.parentElement;


grupo.querySelectorAll("button")
.forEach(btn=>{

btn.classList.remove("activo");

});


boton.classList.add("activo");


}




function sumar(id){


if(!cantidades[id]){

cantidades[id]=0;

}


cantidades[id]++;



document.getElementById(`cantidad-${id}`)
.innerHTML = cantidades[id];



actualizarPrecio(id);

actualizarEnvio(id);



}




function restar(id){


if(cantidades[id]>0){

cantidades[id]--;

}



document.getElementById(`cantidad-${id}`)
.innerHTML = cantidades[id];



actualizarPrecio(id);

actualizarEnvio(id);



}





function actualizarPrecio(id){


let producto =
productos.find(p=>p.id==id);



let precio =
producto.precio;



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






function actualizarEnvio(id){


let faltan =
12-cantidades[id];



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







function cambiarColor(id,index){


let producto =
productos.find(p=>p.id==id);



document.getElementById(`imagen-${id}`)
.src =
producto.colores[index].imagen;



}






function agregarCarrito(id){

    let producto = productos.find(p => p.id == id);


    if(cantidades[id] <= 0){

        alert("Primero seleccione una cantidad");

        return;

    }



    carrito[id] = {

        id: producto.id,

        nombre: producto.nombre,

        cantidad: cantidades[id],

        precio: producto.precio,

        precioMediaDocena: producto.precioMediaDocena,

        precioDocena: producto.precioDocena

    };



    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );



    contadorCarrito.innerHTML =
    Object.keys(carrito).length;



    alert("Producto añadido al carrito");

}






function guardarCarrito(){


localStorage.setItem(

"carrito",

JSON.stringify(carrito)

);


}






function actualizarCarrito(){


if(contadorCarrito){


contadorCarrito.innerHTML =
Object.keys(carrito).length;


}



guardarCarrito();



}







function filtrarCategoria(categoria){


let productosFiltrados =
productos.filter(producto=>{


return producto.categoria===categoria;


});



mostrarProductos(productosFiltrados);



}





document.querySelectorAll(".menuCategorias button")
.forEach(boton=>{


boton.addEventListener("click",()=>{


let texto =
boton.textContent;



document.querySelectorAll(".menuCategorias button")
.forEach(btn=>{

btn.classList.remove("activo");

});



boton.classList.add("activo");




if(texto.includes("Bodies")){


filtrarCategoria("Body");


}



else if(texto.includes("Enterizos")){


filtrarCategoria("Enterizos");


}



else if(texto.includes("Toallas")){


filtrarCategoria("Toallas");


}



else if(texto.includes("Conjuntos")){


filtrarCategoria("Conjuntos");


}



else if(texto.includes("Medias")){


filtrarCategoria("Medias");


}



else if(texto.includes("Accesorios")){


filtrarCategoria("Accesorios");


}



});

});
