/* ==========================================================================
   Baby Boutique Ecuador - Carrito
   Manejo completo del carrito, contador, cantidades, precios y WhatsApp
   ========================================================================== */

const CART_STORAGE_KEY = 'carrito';


// ============================================================
// OBTENER CARRITO
// ============================================================

function getCart() {

    try {

        const datos = localStorage.getItem(CART_STORAGE_KEY);

        if (!datos) {
            return [];
        }

        const carrito = JSON.parse(datos);

        return Array.isArray(carrito) ? carrito : [];

    } catch (error) {

        console.error('Error al leer el carrito:', error);

        return [];
    }
}


// ============================================================
// GUARDAR CARRITO
// ============================================================

function saveCart(carrito) {

    try {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(carrito)
        );

        sincronizarTodo();

    } catch (error) {

        console.error(
            'Error al guardar el carrito:',
            error
        );
    }
}


// ============================================================
// CONTADOR DEL CARRITO
// IMPORTANTE:
// Muestra PRODUCTOS/LÍNEAS diferentes,
// NO la cantidad total de prendas.
// ============================================================

function actualizarContador() {

    const contador =
        document.getElementById('contadorCarrito');

    if (!contador) return;

    const carrito = getCart();

    contador.textContent = carrito.length;
}


// ============================================================
// OBTENER PRECIO SEGÚN CANTIDAD
// ============================================================

function getPrecioPorTramo(producto, cantidad) {

    const precioUnitario =
        Number(producto.precio) || 0;

    const precioMediaDocena =
        Number(producto.precioMediaDocena) ||
        precioUnitario;

    const precioDocena =
        Number(producto.precioDocena) ||
        precioUnitario;


    if (cantidad >= 12) {

        return precioDocena;

    }

    if (cantidad >= 6) {

        return precioMediaDocena;

    }

    return precioUnitario;
}


// ============================================================
// TOTAL DE PRENDAS
// ============================================================

function obtenerTotalPrendas(carrito) {

    return carrito.reduce(
        (total, item) => {

            return total +
                (Number(item.cantidad) || 0);

        },
        0
    );
}


// ============================================================
// AGREGAR AL CARRITO
// FUNCIÓN GENERAL
// ============================================================

function agregarAlCarrito(producto) {

    if (!producto) return;

    const carrito = getCart();

    const cantidadNueva =
        Number(producto.cantidad) || 1;


    const indexExistente =
        carrito.findIndex(item =>

            item.id === producto.id &&
            item.color === producto.color &&
            item.talla === producto.talla

        );


    if (indexExistente !== -1) {

        carrito[indexExistente].cantidad =
            (Number(carrito[indexExistente].cantidad) || 0)
            + cantidadNueva;

    } else {

        carrito.push({

            id: producto.id,

            codigo:
                producto.codigo ||
                producto.id,

            nombre:
                producto.nombre,

            categoria:
                producto.categoria || '',

            precio:
                Number(producto.precio) || 0,

            precioMediaDocena:
                Number(producto.precioMediaDocena) ||
                Number(producto.precio) ||
                0,

            precioDocena:
                Number(producto.precioDocena) ||
                Number(producto.precio) ||
                0,

            color:
                producto.color || 'Único',

            talla:
                producto.talla || 'Única',

            cantidad:
                cantidadNueva,

            imagen:
                producto.imagen || ''

        });

    }

    saveCart(carrito);
}


// ============================================================
// ELIMINAR PRODUCTO
// ============================================================

function eliminarProducto(index) {

    const carrito = getCart();

    if (
        index < 0 ||
        index >= carrito.length
    ) {
        return;
    }


    carrito.splice(index, 1);

    saveCart(carrito);

    mostrarNotificacion(
        'Producto eliminado del carrito.'
    );
}


// ============================================================
// ACTUALIZAR CANTIDAD
// ============================================================

function actualizarCantidad(index, nuevaCantidad) {

    const carrito = getCart();

    if (
        index < 0 ||
        index >= carrito.length
    ) {
        return;
    }


    nuevaCantidad =
        parseInt(nuevaCantidad) || 0;


    if (nuevaCantidad <= 0) {

        carrito.splice(index, 1);

    } else {

        carrito[index].cantidad =
            nuevaCantidad;
    }


    saveCart(carrito);
}


// ============================================================
// VACIAR CARRITO
// ============================================================

function vaciarCarrito() {

    const carrito = getCart();

    if (carrito.length === 0) {
        return;
    }


    const confirmar =
        confirm(
            '¿Estás seguro de que deseas vaciar todo el carrito?'
        );


    if (!confirmar) {
        return;
    }


    localStorage.removeItem(
        CART_STORAGE_KEY
    );


    sincronizarTodo();

    mostrarNotificacion(
        'El carrito ha sido vaciado.'
    );
}


// ============================================================
// BANNER DE ENVÍO GRATIS
// ============================================================

function actualizarBannerEnvio() {

    const texto =
        document.getElementById(
            'shipping-text'
        );

    const relleno =
        document.getElementById(
            'shipping-fill'
        );


    if (!texto && !relleno) {
        return;
    }


    const carrito = getCart();

    const totalPrendas =
        obtenerTotalPrendas(carrito);


    const objetivo = 12;


    if (totalPrendas >= objetivo) {

        if (texto) {

            texto.innerHTML =
                '🚚 ¡Felicidades! Tienes <strong>ENVÍO GRATIS</strong> en Ecuador 🎉';

        }

    } else {

        const faltan =
            objetivo - totalPrendas;


        if (texto) {

            texto.innerHTML =
                `🚚 ¡Agrega <strong>${faltan} prendas</strong> para obtener <strong>ENVÍO GRATIS</strong> en Ecuador!`;

        }

    }


    if (relleno) {

        const porcentaje =
            Math.min(
                (totalPrendas / objetivo) * 100,
                100
            );


        relleno.style.width =
            `${porcentaje}%`;

    }
}


// ============================================================
// MOSTRAR CARRITO
// ============================================================

function mostrarCarrito() {

    const contenedor =
        document.getElementById(
            'cart-items-container'
        );


    if (!contenedor) {
        return;
    }


    const carrito = getCart();


    const totalPrendas =
        obtenerTotalPrendas(carrito);


    const totalPrendasElemento =
        document.getElementById(
            'cart-total-items'
        );


    const totalPrecioElemento =
        document.getElementById(
            'cart-total-price'
        );


    // --------------------------------------------------------
    // CARRITO VACÍO
    // --------------------------------------------------------

    if (carrito.length === 0) {

        contenedor.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="
                        text-align:center;
                        padding:50px 20px;
                        color:#6b7280;
                    "
                >

                    <div
                        style="
                            font-size:3rem;
                            margin-bottom:15px;
                        "
                    >
                        🛒
                    </div>

                    <h3
                        style="
                            color:#374151;
                            margin-bottom:10px;
                        "
                    >
                        Tu carrito está vacío
                    </h3>

                    <p>
                        Agrega productos desde nuestra boutique.
                    </p>

                    <a
                        href="productos.html"
                        style="
                            display:inline-block;
                            margin-top:15px;
                            padding:10px 20px;
                            background:#db2777;
                            color:white;
                            text-decoration:none;
                            border-radius:8px;
                        "
                    >
                        Ver Productos
                    </a>

                </td>

            </tr>

        `;


        if (totalPrendasElemento) {
            totalPrendasElemento.textContent = '0';
        }


        if (totalPrecioElemento) {
            totalPrecioElemento.textContent =
                '$0.00';
        }


        return;
    }


    // --------------------------------------------------------
    // MOSTRAR PRODUCTOS
    // --------------------------------------------------------

    let totalGeneral = 0;


    contenedor.innerHTML =
        carrito.map((item, index) => {


            const cantidad =
                Number(item.cantidad) || 0;


            const precio =
                getPrecioPorTramo(
                    item,
                    cantidad
                );


            const subtotal =
                precio * cantidad;


            totalGeneral += subtotal;


            const imagen =
                item.imagen ||
                'https://via.placeholder.com/100x100/fbcfe8/db2777?text=Baby';


            return `

                <tr>

                    <td>

                        <img
                            src="${imagen}"
                            alt="${item.nombre || 'Producto'}"
                            style="
                                width:70px;
                                height:70px;
                                object-fit:cover;
                                border-radius:8px;
                            "
                            onerror="
                                this.src='https://via.placeholder.com/100x100/fbcfe8/db2777?text=Baby'
                            "
                        >

                    </td>


                    <td>

                        <strong>
                            ${item.nombre || ''}
                        </strong>

                    </td>


                    <td>
                        ${item.codigo || item.id || ''}
                    </td>


                    <td>
                        ${item.color || 'Único'}
                    </td>


                    <td>
                        ${item.talla || 'Única'}
                    </td>


                    <td>

                        <input
                            type="number"
                            min="1"
                            max="100"
                            value="${cantidad}"
                            style="
                                width:65px;
                                padding:6px;
                                text-align:center;
                            "
                            onchange="
                                actualizarCantidad(
                                    ${index},
                                    this.value
                                )
                            "
                        >

                    </td>


                    <td>
                        $${precio.toFixed(2)}
                    </td>


                    <td>

                        <strong>
                            $${subtotal.toFixed(2)}
                        </strong>

                    </td>


                    <td>

                        <button
                            onclick="
                                eliminarProducto(${index})
                            "
                            class="btn-delete"
                        >
                            🗑️
                        </button>

                    </td>

                </tr>

            `;

        }).join('');


    // --------------------------------------------------------
    // ACTUALIZAR TOTALES
    // --------------------------------------------------------

    if (totalPrendasElemento) {

        totalPrendasElemento.textContent =
            totalPrendas;

    }


    if (totalPrecioElemento) {

        totalPrecioElemento.textContent =
            `$${totalGeneral.toFixed(2)}`;

    }
}


// ============================================================
// WHATSAPP
// ============================================================

function enviarWhatsApp() {

    const carrito = getCart();


    if (carrito.length === 0) {

        alert(
            'Tu carrito está vacío.'
        );

        return;
    }


    const telefono =
        '593984391581';


    let mensaje =
        '🛍️ *PEDIDO - BABY BOUTIQUE ECUADOR*%0A%0A';


    let totalPrendas = 0;
    let totalGeneral = 0;


    carrito.forEach((item, index) => {

        const cantidad =
            Number(item.cantidad) || 0;


        const precio =
            getPrecioPorTramo(
                item,
                cantidad
            );


        const subtotal =
            precio * cantidad;


        totalPrendas += cantidad;

        totalGeneral += subtotal;


        mensaje +=
            `*${index + 1}. ${item.nombre || ''}*%0A`;

        mensaje +=
            `Código: ${item.codigo || item.id || ''}%0A`;

        mensaje +=
            `Color: ${item.color || 'Único'}%0A`;

        mensaje +=
            `Talla: ${item.talla || 'Única'}%0A`;

        mensaje +=
            `Cantidad: ${cantidad}%0A`;

        mensaje +=
            `Precio: $${precio.toFixed(2)} c/u%0A`;

        mensaje +=
            `Subtotal: $${subtotal.toFixed(2)}%0A%0A`;

    });


    mensaje +=
        `*TOTAL DE PRENDAS: ${totalPrendas}*%0A`;

    mensaje +=
        `*TOTAL A PAGAR: $${totalGeneral.toFixed(2)}*%0A%0A`;

    mensaje +=
        'Hola, deseo realizar este pedido.';


    const url =
        `https://wa.me/${telefono}?text=${mensaje}`;


    window.open(
        url,
        '_blank'
    );
}


// ============================================================
// NOTIFICACIÓN
// ============================================================

function mostrarNotificacion(mensaje) {

    const existente =
        document.getElementById(
            'cart-notification'
        );


    if (existente) {
        existente.remove();
    }


    const notificacion =
        document.createElement('div');


    notificacion.id =
        'cart-notification';


    notificacion.textContent =
        mensaje;


    notificacion.style.cssText = `

        position:fixed;
        top:20px;
        right:20px;
        z-index:9999;

        background:#db2777;
        color:white;

        padding:14px 20px;

        border-radius:8px;

        box-shadow:
            0 4px 15px rgba(0,0,0,0.2);

        font-family:Poppins,sans-serif;

        font-size:14px;

    `;


    document.body.appendChild(
        notificacion
    );


    setTimeout(() => {

        notificacion.remove();

    }, 2500);
}


// ============================================================
// SINCRONIZAR TODO
// ============================================================

function sincronizarTodo() {

    actualizarContador();

    actualizarBannerEnvio();

    mostrarCarrito();
}


// ============================================================
// INICIAR
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        sincronizarTodo();

    }
);


// ============================================================
// ACTUALIZAR AL VOLVER A LA PÁGINA
// ============================================================

window.addEventListener(
    'pageshow',
    () => {

        sincronizarTodo();

    }
);


// ============================================================
// ACTUALIZAR SI CAMBIA EL LOCALSTORAGE
// ============================================================

window.addEventListener(
    'storage',
    event => {

        if (
            event.key === CART_STORAGE_KEY
        ) {

            sincronizarTodo();

        }

    }
);
