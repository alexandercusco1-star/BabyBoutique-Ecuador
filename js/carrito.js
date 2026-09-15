/* ==========================================================================
   Baby Boutique Ecuador - Módulo de Carrito de Compras
   Archivo: js/carrito.js
   ========================================================================== */

const CART_STORAGE_KEY = 'carrito';


// ==========================================================================
// OBTENER CARRITO
// ==========================================================================

function getCart() {
    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY);

        if (!cart) {
            return [];
        }

        const datos = JSON.parse(cart);

        return Array.isArray(datos) ? datos : [];

    } catch (e) {
        console.error('Error al leer carrito:', e);
        return [];
    }
}


// ==========================================================================
// GUARDAR CARRITO
// ==========================================================================

function saveCart(cart) {

    try {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );

        sincronizarTodo();

    } catch (e) {

        console.error(
            'Error al guardar carrito:',
            e
        );
    }
}


// ==========================================================================
// CONTADOR DEL CARRITO
// ==========================================================================
//
// IMPORTANTE:
// Este número representa productos/líneas diferentes.
//
// Ejemplo:
// Body = 6
// Enterizo = 6
// Pantalón = 6
//
// Total prendas = 18
// Contador carrito = 3
//
// ==========================================================================

function actualizarContador() {

    const cart = getCart();

    const productosDiferentes = cart.length;

    const elementosContador = document.querySelectorAll(
        '#contadorCarrito, ' +
        '#contador-carrito, ' +
        '#cart-count, ' +
        '#cartCount, ' +
        '.cart-badge, ' +
        '.cart-count, ' +
        '.cart-icon-btn span'
    );

    elementosContador.forEach(el => {

        el.textContent = productosDiferentes;

    });

    console.log(
        '🛒 Productos diferentes en carrito:',
        productosDiferentes
    );
}


// ==========================================================================
// PRECIO SEGÚN CANTIDAD
// ==========================================================================

function getPrecioPorTramo(producto, cantidadTotal) {

    if (!producto) {
        return 0;
    }

    const precioUnidad =
        Number(producto.precio) || 0;

    const precioMedia =
        Number(producto.precioMediaDocena) ||
        precioUnidad;

    const precioDocena =
        Number(producto.precioDocena) ||
        precioUnidad;


    if (cantidadTotal >= 12) {

        return precioDocena;

    }


    if (cantidadTotal >= 6) {

        return precioMedia;

    }


    return precioUnidad;
}


// ==========================================================================
// CALCULAR TOTAL DE PRENDAS DEL CARRITO
// ==========================================================================

function obtenerTotalPrendas(cart) {

    return cart.reduce(
        (total, item) => {

            return total +
                (parseInt(item.cantidad) || 0);

        },
        0
    );
}


// ==========================================================================
// AGREGAR AL CARRITO
// ==========================================================================
//
// Esta función queda disponible para cualquier página que la necesite.
// El catálogo utiliza agregarProductoAlCarrito().
//
// ==========================================================================

function agregarAlCarrito(producto) {

    if (!producto || !producto.id) {
        return;
    }


    let cart = getCart();


    const cantidadAAgregar =
        parseInt(producto.cantidad) || 1;


    const indexExistente =
        cart.findIndex(item =>
            item.id === producto.id &&
            item.color === producto.color &&
            item.talla === producto.talla
        );


    if (indexExistente !== -1) {

        cart[indexExistente].cantidad +=
            cantidadAAgregar;

    } else {

        cart.push({
            ...producto,
            cantidad: cantidadAAgregar
        });

    }


    saveCart(cart);


    mostrarNotificacion(
        `¡${producto.nombre || 'Producto'} añadido al carrito!`
    );
}


// ==========================================================================
// ELIMINAR PRODUCTO
// ==========================================================================

function eliminarProducto(index) {

    let cart = getCart();


    if (
        index >= 0 &&
        index < cart.length
    ) {

        cart.splice(index, 1);

        saveCart(cart);
    }
}


// ==========================================================================
// ACTUALIZAR CANTIDAD
// ==========================================================================

function actualizarCantidad(index, nuevaCantidad) {

    let cart = getCart();


    if (
        index < 0 ||
        index >= cart.length
    ) {
        return;
    }


    const cantidad =
        parseInt(nuevaCantidad);


    if (
        isNaN(cantidad) ||
        cantidad <= 0
    ) {

        eliminarProducto(index);

        return;
    }


    cart[index].cantidad = cantidad;

    saveCart(cart);
}


// ==========================================================================
// VACIAR CARRITO
// ==========================================================================

function vaciarCarrito() {

    if (
        !confirm(
            '¿Estás seguro de que deseas vaciar el carrito?'
        )
    ) {
        return;
    }


    localStorage.removeItem(
        CART_STORAGE_KEY
    );


    sincronizarTodo();


    mostrarNotificacion(
        '🛒 El carrito ha sido vaciado.'
    );
}


// ==========================================================================
// BANNER DE ENVÍO GRATIS
// ==========================================================================

function actualizarBannerEnvio() {

    const cart = getCart();

    const totalPrendas =
        obtenerTotalPrendas(cart);


    const textoBanner =
        document.getElementById(
            'shipping-text'
        );


    const barraProgreso =
        document.getElementById(
            'shipping-fill'
        );


    if (
        !textoBanner ||
        !barraProgreso
    ) {
        return;
    }


    const META_ENVIO_GRATIS = 12;


    if (totalPrendas === 0) {

        textoBanner.innerHTML =
            '🚚 ¡Agrega <strong>12 prendas</strong> para obtener <strong>ENVÍO GRATIS</strong> en Ecuador!';

        barraProgreso.style.width = '0%';

        return;
    }


    if (
        totalPrendas >=
        META_ENVIO_GRATIS
    ) {

        textoBanner.innerHTML =
            '🎉 <strong>¡Tu pedido tiene envío GRATIS!</strong>';

        barraProgreso.style.width =
            '100%';

        return;
    }


    const faltantes =
        META_ENVIO_GRATIS -
        totalPrendas;


    const porcentaje =
        Math.round(
            (
                totalPrendas /
                META_ENVIO_GRATIS
            ) * 100
        );


    textoBanner.innerHTML =
        `🚚 Te faltan <strong>${faltantes} ${faltantes === 1 ? 'prenda' : 'prendas'}</strong> para obtener <strong>ENVÍO GRATIS</strong>`;


    barraProgreso.style.width =
        `${porcentaje}%`;
}


// ==========================================================================
// MOSTRAR CARRITO
// ==========================================================================

function mostrarCarrito() {

    const cart = getCart();


    const contenedorTabla =
        document.getElementById(
            'cart-items-container'
        );


    const totalPrendasElement =
        document.getElementById(
            'cart-total-items'
        );


    const totalPrecioElement =
        document.getElementById(
            'cart-total-price'
        );


    let totalPrendas = 0;

    let totalPagar = 0;


    // ----------------------------------------------------------------------
    // SI NO ESTAMOS EN carrito.html
    // ----------------------------------------------------------------------

    if (!contenedorTabla) {

        actualizarContador();

        actualizarBannerEnvio();

        return;
    }


    // ----------------------------------------------------------------------
    // CARRITO VACÍO
    // ----------------------------------------------------------------------

    if (cart.length === 0) {

        contenedorTabla.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    style="
                        text-align:center;
                        padding:40px;
                        color:#6b7280;
                    "
                >
                    🛒 Tu carrito está vacío.

                    <br><br>

                    <a
                        href="productos.html"
                        style="
                            color:#db2777;
                            font-weight:600;
                            text-decoration:none;
                        "
                    >
                        Ver catálogo
                    </a>
                </td>
            </tr>
        `;


        if (totalPrendasElement) {
            totalPrendasElement.textContent =
                '0';
        }


        if (totalPrecioElement) {
            totalPrecioElement.textContent =
                '$0.00';
        }


        actualizarContador();

        actualizarBannerEnvio();

        return;
    }


    // ----------------------------------------------------------------------
    // TOTAL GENERAL DE PRENDAS
    // ----------------------------------------------------------------------

    totalPrendas =
        obtenerTotalPrendas(cart);


    // ----------------------------------------------------------------------
    // RENDERIZAR PRODUCTOS
    // ----------------------------------------------------------------------

    contenedorTabla.innerHTML =
        cart.map((item, index) => {


            const cantidad =
                parseInt(item.cantidad) || 1;


            // El precio depende de la cantidad
            // de prendas de ESTA línea.
            const precioUnitario =
                getPrecioPorTramo(
                    item,
                    cantidad
                );


            const subtotal =
                precioUnitario *
                cantidad;


            totalPagar += subtotal;


            return `
                <tr>

                    <td>

                        <img
                            src="${item.imagen || 'https://via.placeholder.com/65x65/fbcfe8/db2777'}"
                            class="cart-thumb"
                            alt="${item.nombre || 'Producto'}"
                            style="
                                width:65px;
                                height:65px;
                                object-fit:cover;
                                border-radius:8px;
                            "
                            onerror="
                                this.src='https://via.placeholder.com/65x65/fbcfe8/db2777'
                            "
                        >

                    </td>


                    <td>

                        <strong>
                            ${item.nombre || 'Producto'}
                        </strong>

                    </td>


                    <td>

                        <code>
                            ${item.codigo || item.id || '-'}
                        </code>

                    </td>


                    <td>
                        ${item.color || '-'}
                    </td>


                    <td>
                        ${item.talla || '-'}
                    </td>


                    <td>

                        <div
                            class="qty-control"
                            style="
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                gap:8px;
                            "
                        >

                            <button
                                class="qty-btn"
                                onclick="
                                    actualizarCantidad(
                                        ${index},
                                        ${cantidad - 1}
                                    )
                                "
                            >
                                -
                            </button>


                            <span
                                class="qty-val"
                                style="
                                    min-width:25px;
                                    text-align:center;
                                    font-weight:600;
                                "
                            >
                                ${cantidad}
                            </span>


                            <button
                                class="qty-btn"
                                onclick="
                                    actualizarCantidad(
                                        ${index},
                                        ${cantidad + 1}
                                    )
                                "
                            >
                                +
                            </button>

                        </div>

                    </td>


                    <td>
                        $${precioUnitario.toFixed(2)}
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
                            style="
                                background:none;
                                border:none;
                                cursor:pointer;
                            "
                        >
                            🗑️
                        </button>

                    </td>

                </tr>
            `;

        }).join('');


    // ----------------------------------------------------------------------
    // ACTUALIZAR RESUMEN
    // ----------------------------------------------------------------------

    if (totalPrendasElement) {

        totalPrendasElement.textContent =
            totalPrendas;
    }


    if (totalPrecioElement) {

        totalPrecioElement.textContent =
            `$${totalPagar.toFixed(2)}`;
    }


    // ----------------------------------------------------------------------
    // ACTUALIZAR CABECERA Y ENVÍO
    // ----------------------------------------------------------------------

    actualizarContador();

    actualizarBannerEnvio();
}


// ==========================================================================
// ENVIAR PEDIDO POR WHATSAPP
// ==========================================================================

function enviarWhatsApp() {

    const cart = getCart();


    if (cart.length === 0) {

        alert(
            'Tu carrito está vacío. Agrega productos antes de enviar el pedido.'
        );

        return;
    }


    const codigoPedido =
        'BB-' +
        Math.floor(
            10000 +
            Math.random() * 90000
        );


    const ahora =
        new Date();


    const fecha =
        ahora.toLocaleDateString(
            'es-EC'
        );


    const hora =
        ahora.toLocaleTimeString(
            'es-EC',
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );


    const totalPrendas =
        obtenerTotalPrendas(cart);


    let totalPagar = 0;


    let mensaje =
        '🛍️ *NUEVO PEDIDO - BABY BOUTIQUE ECUADOR* 🛍️\n';


    mensaje +=
        '━━━━━━━━━━━━━━━━━━━━━\n';


    mensaje +=
        `📌 *Código de Pedido:* #${codigoPedido}\n`;


    mensaje +=
        `📅 *Fecha:* ${fecha} - ${hora}\n`;


    mensaje +=
        '━━━━━━━━━━━━━━━━━━━━━\n\n';


    mensaje +=
        '📦 *DETALLE DE PRODUCTOS:*\n\n';


    cart.forEach((item, index) => {

        const cantidad =
            parseInt(item.cantidad) || 1;


        const precioUnitario =
            getPrecioPorTramo(
                item,
                cantidad
            );


        const subtotal =
            precioUnitario *
            cantidad;


        totalPagar += subtotal;


        mensaje +=
            `${index + 1}. *${item.nombre || 'Producto'}*\n`;


        mensaje +=
            `   • Código: ${item.codigo || item.id || '-'}\n`;


        mensaje +=
            `   • Color: ${item.color || 'N/A'}\n`;


        mensaje +=
            `   • Talla: ${item.talla || 'N/A'}\n`;


        mensaje +=
            `   • Cantidad: ${cantidad} u.\n`;


        mensaje +=
            `   • Precio U.: $${precioUnitario.toFixed(2)}\n`;


        mensaje +=
            `   • Subtotal: *$${subtotal.toFixed(2)}*\n\n`;

    });


    const envioGratis =
        totalPrendas >= 12;


    mensaje +=
        '━━━━━━━━━━━━━━━━━━━━━\n';


    mensaje +=
        `👕 *Total Prendas:* ${totalPrendas}\n`;


    mensaje +=
        `🚚 *Envío:* ${
            envioGratis
                ? '✅ *GRATIS*'
                : '📦 Por calcular'
        }\n`;


    mensaje +=
        `💰 *TOTAL A PAGAR:* *$${totalPagar.toFixed(2)}*\n`;


    mensaje +=
        '━━━━━━━━━━━━━━━━━━━━━\n\n';


    mensaje +=
        'Por favor me confirman la disponibilidad de los artículos para realizar el pago.';


    // Número de WhatsApp
    const telefono =
        '593984391581';


    const url =
        `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;


    window.open(
        url,
        '_blank'
    );
}


// ==========================================================================
// NOTIFICACIÓN
// ==========================================================================

function mostrarNotificacion(mensaje) {

    let toast =
        document.getElementById(
            'toast-notification'
        );


    if (!toast) {

        toast =
            document.createElement(
                'div'
            );


        toast.id =
            'toast-notification';


        toast.style.cssText = `
            position:fixed;
            bottom:20px;
            right:20px;
            left:20px;
            max-width:400px;
            margin:auto;
            background:#db2777;
            color:white;
            padding:14px 20px;
            border-radius:25px;
            box-shadow:0 4px 15px rgba(0,0,0,0.2);
            z-index:9999;
            font-weight:600;
            text-align:center;
            transition:opacity 0.3s;
        `;


        document.body.appendChild(
            toast
        );
    }


    toast.textContent =
        mensaje;


    toast.style.opacity =
        '1';


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(() => {

            toast.style.opacity =
                '0';

        }, 2500);
}


// ==========================================================================
// SINCRONIZACIÓN GENERAL
// ==========================================================================

function sincronizarTodo() {

    actualizarContador();

    actualizarBannerEnvio();

    mostrarCarrito();
}


// ==========================================================================
// EVENTOS
// ==========================================================================

document.addEventListener(
    'DOMContentLoaded',
    sincronizarTodo
);


window.addEventListener(
    'pageshow',
    sincronizarTodo
);


window.addEventListener(
    'storage',
    sincronizarTodo
);
