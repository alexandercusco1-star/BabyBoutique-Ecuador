// carrito.js

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const contenedorCarrito = document.getElementById("lista-carrito");
const totalElemento = document.getElementById("total-carrito");
const contador = document.getElementById("contador-carrito");


function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}


function mostrarCarrito() {

    if (!contenedorCarrito) return;

    contenedorCarrito.innerHTML = "";

    let total = 0;
    let cantidadTotal = 0;


    if (carrito.length === 0) {

        contenedorCarrito.innerHTML = `
            <p class="carrito-vacio">
                Tu carrito está vacío
            </p>
        `;

        if(totalElemento){
            totalElemento.textContent = "$0.00";
        }

        actualizarContador();
        return;
    }


    carrito.forEach((producto, index)=>{


        let subtotal = producto.precio * producto.cantidad;

        total += subtotal;
        cantidadTotal += producto.cantidad;


        contenedorCarrito.innerHTML += `

        <div class="item-carrito">

            <img src="${producto.imagen}" alt="${producto.nombre}">

            <div>
                <h3>${producto.nombre}</h3>

                <p>
                Precio: $${producto.precio.toFixed(2)}
                </p>

                <div class="cantidad">

                    <button onclick="restarCantidad(${index})">
                    -
                    </button>


                    <span>
                    ${producto.cantidad}
                    </span>


                    <button onclick="sumarCantidad(${index})">
                    +
                    </button>

                </div>


                <p>
                Subtotal:
                $${subtotal.toFixed(2)}
                </p>


                <button 
                onclick="eliminarProducto(${index})"
                class="btn-eliminar">

                Eliminar

                </button>


            </div>


        </div>

        `;


    });


    if(totalElemento){

        totalElemento.textContent =
        "$" + total.toFixed(2);

    }


    actualizarContador();

}



function sumarCantidad(index){

    carrito[index].cantidad++;

    guardarCarrito();

    mostrarCarrito();

}



function restarCantidad(index){

    if(carrito[index].cantidad > 1){

        carrito[index].cantidad--;

    }else{

        carrito.splice(index,1);

    }


    guardarCarrito();

    mostrarCarrito();

}



function eliminarProducto(index){

    carrito.splice(index,1);

    guardarCarrito();

    mostrarCarrito();

}



function actualizarContador(){

    if(contador){

        let cantidad = carrito.reduce(
            (total, producto)=> total + producto.cantidad,
            0
        );

        contador.textContent = cantidad;

    }

}



function vaciarCarrito(){

    carrito=[];

    guardarCarrito();

    mostrarCarrito();

}



mostrarCarrito();
