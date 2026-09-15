/* ==========================================================================
   Baby Boutique Ecuador - Productos
   Catálogo, filtros, precios y agregado al carrito
   ========================================================================== */

let productos = [];
let categoriaActiva = 'Todos';


// ============================================================
// UN ÚNICO CARRITO PARA TODO EL SITIO
// ============================================================

const CART_STORAGE_KEY = 'carrito';


// ============================================================
// OBTENER CARRITO
// ============================================================

function obtenerCarritoCliente() {
    try {
        const carrito = localStorage.getItem(CART_STORAGE_KEY);

        if (!carrito) {
            return [];
        }

        const datos = JSON.parse(carrito);

        return Array.isArray(datos) ? datos : [];

    } catch (e) {

        console.error('Error al leer carrito:', e);

        return [];
    }
}


// ============================================================
// GUARDAR CARRITO
// ============================================================

function guardarCarritoCliente(carrito) {

    try {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(carrito)
        );

        if (typeof actualizarContador === 'function') {
            actualizarContador();
        }

        if (typeof actualizarBannerEnvio === 'function') {
            actualizarBannerEnvio();
        }

    } catch (e) {

        console.error('Error al guardar carrito:', e);

    }
}


// ============================================================
// CARGAR PRODUCTOS
// ============================================================

async function cargarProductos() {

    const contenedorCatalogo =
        document.getElementById('products-container') ||
        document.getElementById('lista-productos');

    const contenedorDetalle =
        document.getElementById('detalle-producto');

    // Si esta página no tiene catálogo ni detalle,
    // no hacemos nada.
    if (!contenedorCatalogo && !contenedorDetalle) {
        return;
    }


    // ========================================================
    // INTENTAR CARGAR productos.json
    // ========================================================

    try {

        const respuesta = await fetch('./data/productos.json', {
            cache: 'no-cache'
        });

        if (!respuesta.ok) {
            throw new Error(
                `Error HTTP ${respuesta.status} al cargar productos.json`
            );
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
            throw new Error(
                'productos.json no contiene una lista válida de productos'
            );
        }

        productos = datos;


    } catch (error) {

        console.error(
            'No se pudo cargar ./data/productos.json:',
            error
        );

        // ====================================================
        // DATOS DE RESPALDO
        // ====================================================

        productos = getProductosRespaldo();

    }


    // ========================================================
    // MOSTRAR CATÁLOGO
    // ========================================================

    if (contenedorCatalogo) {

        mostrarProductos(productos);

        inicializarFiltrosCategorias();

    }


    // ========================================================
    // MOSTRAR DETALLE
    // ========================================================

    if (contenedorDetalle) {

        if (typeof mostrarDetalleProducto === 'function') {
            mostrarDetalleProducto();
        }

    }
}


// ============================================================
// FILTROS DE CATEGORÍAS
// ============================================================

function inicializarFiltrosCategorias() {

    const botones =
        document.querySelectorAll('.cat-btn');

    if (!botones.length) {
        return;
    }


    botones.forEach(btn => {

        btn.addEventListener('click', e => {

            botones.forEach(b => {
                b.classList.remove('active');
            });


            e.currentTarget.classList.add('active');


            const catSeleccionada =
                e.currentTarget.getAttribute('data-category') ||
                'Todos';


            categoriaActiva =
                catSeleccionada;


            if (catSeleccionada === 'Todos') {

                mostrarProductos(productos);

            } else {

                const filtrados =
                    productos.filter(p => {

                        if (!p.categoria) {
                            return false;
                        }

                        return (
                            String(p.categoria).toLowerCase() ===
                            String(catSeleccionada).toLowerCase()
                        );

                    });


                mostrarProductos(filtrados);
            }

        });

    });

}


// ============================================================
// MOSTRAR PRODUCTOS
// ============================================================

function mostrarProductos(lista) {

    const contenedor =
        document.getElementById('products-container') ||
        document.getElementById('lista-productos');


    if (!contenedor) {
        return;
    }


    if (!Array.isArray(lista) || lista.length === 0) {

        contenedor.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:40px;
                color:#6b7280;
            ">
                No se encontraron productos en la categoría
                "${categoriaActiva}".
            </div>
        `;

        return;
    }


    contenedor.innerHTML = lista.map(prod => {

        const idProducto =
            prod.id || prod.codigo || `producto-${Math.random()}`;


        // ====================================================
        // COLOR INICIAL
        // ====================================================

        const colorInicial =
            Array.isArray(prod.colores) &&
            prod.colores.length > 0
                ? prod.colores[0]
                : {
                    nombre: 'Único',
                    imagen: prod.imagen || ''
                };


        // ====================================================
        // IMAGEN INICIAL
        // ====================================================

        const imagenInicial =
            colorInicial.imagen ||
            prod.imagen ||
            'https://via.placeholder.com/300x300/fbcfe8/db2777?text=Baby+Boutique';


        // ====================================================
        // TALLAS
        // ====================================================

        const listaTallas =
            Array.isArray(prod.tallas) &&
            prod.tallas.length > 0
                ? prod.tallas
                : [
                    '0 a 3 meses',
                    '3 a 6 meses',
                    '6 a 9 meses',
                    '9 a 12 meses'
                ];


        // ====================================================
        // COLORES
        // ====================================================

        let coloresHTML = '';


        if (
            Array.isArray(prod.colores) &&
            prod.colores.length > 0
        ) {

            coloresHTML = `

                <div class="option-group">

                    <label class="option-label">

                        Color:

                        <span
                            id="color-label-${idProducto}"
                            style="
                                font-weight:bold;
                                color:#1f2937;
                            "
                        >
                            ${colorInicial.nombre || 'Único'}
                        </span>

                    </label>


                    <div class="color-picker">

                        ${prod.colores.map((c, i) => `

                            <span
                                class="color-dot ${i === 0 ? 'active' : ''}"
                                style="
                                    background-color:${c.hex || '#f472b6'};
                                "
                                title="${c.nombre || 'Color'}"
                                onclick="
                                    cambiarColorProducto(
                                        '${idProducto}',
                                        '${String(c.nombre || 'Único').replace(/'/g, "\\'")}',
                                        '${String(c.imagen || '').replace(/'/g, "\\'")}',
                                        this
                                    )
                                "
                            ></span>

                        `).join('')}

                    </div>

                </div>

            `;

        }


        // ====================================================
        // TALLAS HTML
        // ====================================================

        const tallasHTML =
            listaTallas.map(t => {

                if (typeof t === 'object') {

                    const valor =
                        t.edad ||
                        t.nombre ||
                        t.numero ||
                        'Única';


                    const texto =
                        t.numero
                            ? `Talla ${t.numero} - ${t.edad || t.nombre || ''}`
                            : valor;


                    return `
                        <option value="${valor}">
                            ${texto}
                        </option>
                    `;

                }


                return `
                    <option value="${t}">
                        ${t}
                    </option>
                `;

            }).join('');


        // ====================================================
        // TARJETA DEL PRODUCTO
        // ====================================================

        return `

            <div
                class="product-card"
                id="card-${idProducto}"
            >

                <div>

                    <!-- IMAGEN -->

                    <div class="product-image-container">

                        <span class="product-badge">
                            ${prod.categoria || 'Boutique'}
                        </span>

                        <img
                            src="${imagenInicial}"
                            id="img-${idProducto}"
                            alt="${prod.nombre || 'Producto Baby Boutique'}"
                            onerror="
                                this.src='https://via.placeholder.com/300x300/fbcfe8/db2777?text=Baby+Boutique'
                            "
                        >

                    </div>


                    <!-- CÓDIGO -->

                    <div class="product-code">

                        CÓDIGO:
                        ${prod.codigo || prod.id || ''}

                    </div>


                    <!-- NOMBRE -->

                    <h3 class="product-title">

                        ${prod.nombre || 'Producto'}

                    </h3>


                    <!-- OPCIONES -->

                    <div class="product-options">

                        ${coloresHTML}


                        <!-- TALLA -->

                        <div class="option-group">

                            <label class="option-label">
                                Talla:
                            </label>


                            <select
                                class="size-select"
                                id="size-${idProducto}"
                            >

                                ${tallasHTML}

                            </select>

                        </div>


                        <!-- CANTIDAD -->

                        <div class="option-group">

                            <label class="option-label">

                                Cantidad
                                (Precio por volumen):

                            </label>


                            <input
                                type="number"
                                class="qty-select"
                                id="qty-${idProducto}"
                                value="0"
                                min="0"
                                max="100"
                                onchange="
                                    actualizarPrecioEnTarjeta('${idProducto}')
                                "
                                onkeyup="
                                    actualizarPrecioEnTarjeta('${idProducto}')
                                "
                            >

                        </div>

                    </div>


                    <!-- PRECIO -->

                    <div class="price-box">

                        <div
                            class="price-main"
                            id="price-${idProducto}"
                        >
                            $0.00
                        </div>


                        <div
                            class="price-tier-info"
                            id="tier-info-${idProducto}"
                        >
                            Selecciona 1 o más prendas
                        </div>

                    </div>

                </div>


                <!-- BOTÓN -->

                <button
                    class="add-to-cart-btn"
                    onclick="
                        agregarProductoAlCarrito('${idProducto}')
                    "
                >

                    🛒 Añadir al Carrito

                </button>

            </div>

        `;

    }).join('');


    // ========================================================
    // ACTUALIZAR PRECIOS
    // ========================================================

    lista.forEach(p => {

        const id =
            p.id ||
            p.codigo;

        actualizarPrecioEnTarjeta(id);

    });

}


// ============================================================
// CAMBIAR COLOR
// ============================================================

function cambiarColorProducto(
    idProducto,
    nombreColor,
    urlImagen,
    elementoDot
) {

    const tarjeta =
        document.getElementById(
            `card-${idProducto}`
        );


    if (!tarjeta) {
        return;
    }


    const img =
        document.getElementById(
            `img-${idProducto}`
        );


    const etiquetaColor =
        document.getElementById(
            `color-label-${idProducto}`
        );


    if (img && urlImagen) {

        img.src = urlImagen;

    }


    if (etiquetaColor) {

        etiquetaColor.textContent =
            nombreColor;

    }


    const dots =
        tarjeta.querySelectorAll(
            '.color-dot'
        );


    dots.forEach(d => {

        d.classList.remove('active');

    });


    if (elementoDot) {

        elementoDot.classList.add('active');

    }

}


// ============================================================
// PRECIO DINÁMICO EN TARJETA
// ============================================================

function actualizarPrecioEnTarjeta(idProducto) {

    const prod =
        productos.find(
            p =>
                p.id == idProducto ||
                p.codigo == idProducto
        );


    if (!prod) {
        return;
    }


    const inputQty =
        document.getElementById(
            `qty-${idProducto}`
        );


    const displayPrecio =
        document.getElementById(
            `price-${idProducto}`
        );


    const displayInfo =
        document.getElementById(
            `tier-info-${idProducto}`
        );


    const cantidad =
        parseInt(inputQty?.value) || 0;


    if (cantidad <= 0) {

        if (displayPrecio) {

            displayPrecio.textContent =
                '$0.00';

        }


        if (displayInfo) {

            displayInfo.textContent =
                'Selecciona 1 o más prendas';

        }


        return;
    }


    const precioUnidad =
        Number(prod.precio) || 0;


    const precioMedia =
        Number(prod.precioMediaDocena) ||
        precioUnidad;


    const precioDocena =
        Number(prod.precioDocena) ||
        precioUnidad;


    let precioAplicado =
        precioUnidad;


    let textoEscala =
        'Precio Unitario (1 a 5 prendas)';


    if (cantidad >= 12) {

        precioAplicado =
            precioDocena;


        textoEscala =
            `⚡ Precio Docena: $${precioDocena.toFixed(2)} c/u`;

    } else if (cantidad >= 6) {

        precioAplicado =
            precioMedia;


        textoEscala =
            `⭐ Precio Media Docena: $${precioMedia.toFixed(2)} c/u`;

    }


    const subtotal =
        precioAplicado * cantidad;


    if (displayPrecio) {

        displayPrecio.textContent =
            `$${subtotal.toFixed(2)}`;

    }


    if (displayInfo) {

        displayInfo.textContent =
            textoEscala;

    }

}


// ============================================================
// AGREGAR PRODUCTO AL CARRITO
// ============================================================

function agregarProductoAlCarrito(idProducto) {

    const inputQty =
        document.getElementById(
            `qty-${idProducto}`
        );


    const cantidad =
        parseInt(inputQty?.value) || 0;


    if (cantidad <= 0) {

        alert(
            'Por favor selecciona al menos 1 prenda antes de agregar al carrito.'
        );

        return;
    }


    const prod =
        productos.find(
            p =>
                p.id == idProducto ||
                p.codigo == idProducto
        );


    if (!prod) {

        console.error(
            'Producto no encontrado:',
            idProducto
        );

        return;
    }


    const labelColor =
        document.getElementById(
            `color-label-${idProducto}`
        );


    const selectSize =
        document.getElementById(
            `size-${idProducto}`
        );


    const imgElem =
        document.getElementById(
            `img-${idProducto}`
        );


    const colorSeleccionado =
        labelColor
            ? labelColor.textContent.trim()
            : (
                prod.colores &&
                prod.colores[0]
                    ? prod.colores[0].nombre
                    : 'Único'
            );


    const tallaSeleccionada =
        selectSize
            ? selectSize.value
            : 'Única';


    const imagenActual =
        imgElem
            ? imgElem.src
            : prod.imagen || '';


    const itemParaCarrito = {

        id:
            prod.id || prod.codigo,

        codigo:
            prod.codigo || prod.id,

        nombre:
            prod.nombre,

        categoria:
            prod.categoria,

        precio:
            Number(prod.precio) || 0,

        precioMediaDocena:
            Number(prod.precioMediaDocena) ||
            Number(prod.precio) ||
            0,

        precioDocena:
            Number(prod.precioDocena) ||
            Number(prod.precio) ||
            0,

        color:
            colorSeleccionado,

        talla:
            tallaSeleccionada,

        cantidad:
            cantidad,

        imagen:
            imagenActual

    };


    let cart =
        obtenerCarritoCliente();


    const indexExistente =
        cart.findIndex(item =>

            item.id === itemParaCarrito.id &&

            item.color === itemParaCarrito.color &&

            item.talla === itemParaCarrito.talla

        );


    if (indexExistente !== -1) {

        cart[indexExistente].cantidad += cantidad;

    } else {

        cart.push(itemParaCarrito);

    }


    guardarCarritoCliente(cart);


    if (
        typeof actualizarContador ===
        'function'
    ) {

        actualizarContador();

    }


    alert(
        `¡Se agregaron ${cantidad} unidad(es) de "${prod.nombre}" al carrito!`
    );

}


// ============================================================
// DATOS DE RESPALDO
// ============================================================

function getProductosRespaldo() {

    return [

        {
            id: 'BODY-001',
            codigo: '001',
            nombre: 'Body para Bebé Algodón Premium',
            categoria: 'Bodies',

            precio: 4.00,
            precioMediaDocena: 3.50,
            precioDocena: 3.00,

            colores: [

                {
                    nombre: 'Rosado',
                    hex: '#f472b6',
                    imagen:
                        'assets/productos/body001/rosado.jpg'
                },

                {
                    nombre: 'Fucsia',
                    hex: '#db2777',
                    imagen:
                        'assets/productos/body001/fucsia.jpg'
                }

            ]

        },


        {
            id: 'ENT-002',
            codigo: '002',
            nombre: 'Enterizo Térmico Cómodo',
            categoria: 'Enterizos',

            precio: 9.00,
            precioMediaDocena: 8.50,
            precioDocena: 8.00,

            colores: [

                {
                    nombre: 'Blanco',
                    hex: '#ffffff',
                    imagen:
                        'assets/productos/enterizo001/blanco.jpg'
                }

            ]

        }

    ];

}


// ============================================================
// INICIAR
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    cargarProductos
);
