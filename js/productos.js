// productos.js

const listaProductos = document.getElementById("lista-productos");

let productos = [];


async function cargarProductos(){

    const respuesta = await fetch("data/productos.json");

    productos = await respuesta.json();


    mostrarProductos();

}



function mostrarProductos(){


    if(!listaProductos) return;


    listaProductos.innerHTML = "";


    productos.forEach(producto=>{


        listaProductos.innerHTML += `


        <div class="card-producto">


            <img 
            src="${producto.imagen}" 
            alt="${producto.nombre}"
            >


            <h2>
            ${producto.nombre}
            </h2>


            <p>
            $${producto.precio.toFixed(2)}
            </p>



            <a 
            href="producto.html?id=${producto.id}"
            class="btn-ver">

            Ver producto

            </a>



        </div>


        `;


    });


}



cargarProductos();
