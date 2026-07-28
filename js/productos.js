const listaProductos = document.getElementById("listaProductos");


fetch("data/productos.json")
.then(respuesta => respuesta.json())
.then(productos => {


    productos.forEach(producto => {


        let cantidad = 0;


        let tarjeta = document.createElement("div");

        tarjeta.classList.add("producto");



        tarjeta.innerHTML = `


        <img id="imagen-${producto.id}" 
        src="${producto.imagenes[0]}" 
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
        Disponible ✅
        </p>


        <p class="precio">
        $${producto.precio.toFixed(2)}
        </p>




        <p class="tituloOpcion">
        Talla:
        </p>


        <div class="opciones">


        ${producto.tallas.map(talla =>

        `<button onclick="seleccionarTalla(this)">
        ${talla}
        </button>`

        ).join("")}


        </div>




        <p class="tituloOpcion">
        Color:
        </p>


        <div class="opciones">


        ${producto.colores.map((color,index)=>

        `<button 
        class="color ${color.toLowerCase()}"
        onclick="cambiarColor('${producto.id}',${index})">
        </button>`

        ).join("")}


        </div>





        <p class="tituloOpcion">
        Cantidad:
        </p>


        <div class="cantidad">


        <button onclick="restar(${producto.id})">
        -
        </button>


        <span class="numeroCantidad" id="cantidad-${producto.id}">
        0
        </span>


        <button onclick="sumar(${producto.id})">
        +
        </button>


        </div>



        <p id="envio-${producto.id}">
        Agrega 12 prendas para obtener envío gratis 🚚
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






let cantidades={};



function sumar(id){


    if(!cantidades[id]){
        cantidades[id]=0;
    }


    cantidades[id]++;


    document.getElementById(`cantidad-${id}`)
    .innerHTML=cantidades[id];


    actualizarEnvio(id);

}






function restar(id){


    if(!cantidades[id]){
        cantidades[id]=0;
    }


    if(cantidades[id]>0){

        cantidades[id]--;

    }


    document.getElementById(`cantidad-${id}`)
    .innerHTML=cantidades[id];


    actualizarEnvio(id);


}






function actualizarEnvio(id){


    let faltan = 12 - cantidades[id];


    let mensaje=document.getElementById(`envio-${id}`);



    if(faltan>0){


        mensaje.innerHTML=
        `Te faltan ${faltan} prendas para tener envío GRATIS 🚚`;


    }else{


        mensaje.innerHTML=
        `🎉 Tu pedido tiene envío GRATIS`;


    }


}






function cambiarColor(id,color){


fetch("data/productos.json")
.then(res=>res.json())
.then(productos=>{


let producto=productos.find(p=>p.id==id);


document.getElementById(`imagen-${id}`)
.src=
producto.imagenes[color];


});


}
