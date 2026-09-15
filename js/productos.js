/* ==========================================================================
   Baby Boutique Ecuador - Productos
   Catálogo, filtros, precios y agregado al carrito
   ========================================================================== */

let productos = [];
let categoriaActiva = 'Todos';


// ============================================================
// CARRITO
// ============================================================

const CARRITO_STORAGE_KEY = 'carrito';


// ============================================================
// OBTENER CARRITO
// ============================================================

function obtenerCarritoCliente() {

    try {

        const carrito =
            localStorage.getItem(CARRITO_STORAGE_KEY);

        return carrito
            ? JSON.parse(carrito)
            : [];

    } catch (error) {

        console.error(
            'Error al leer carrito:',
            error
        );

        return [];
    }
}


// ============================================================
// GUARDAR CARRITO
// ============================================================

function guardarCarritoCliente(carrito) {

    try {

        localStorage.setItem(
            CARRITO_STORAGE_KEY,
            JSON.stringify(carrito)
        );

        if (
            typeof actualizarContador ===
            'function'
        ) {
            actualizarContador();
        }

        if (
            typeof actualizarBannerEnvio ===
            'function'
        ) {
            actualizarBannerEnvio();
        }

    } catch (error) {

        console.error(
            'Error al guardar carrito:',
            error
        );

    }
}


// ============================================================
// CARGAR PRODUCTOS
// ============================================================

async function cargarProductos() {

    const contenedorCatalogo =
        document.getElementById(
            'products-container'
        ) ||
        document.getElementById(
            'lista-productos'
        );


    const contenedorDetalle =
        document.getElementById(
            'detalle-producto'
        );


    if (
        !contenedorCatalogo &&
        !contenedorDetalle
    ) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                './data/productos.json'
            );


        if (!respuesta.ok) {

            throw new Error(
                'No se pudo cargar productos.json'
            );

        }


        productos =
            await respuesta.json();


    } catch (error) {

        console.warn(
            'Cargando datos de respaldo para visualización local:',
            error
        );

        productos =
            getProductosRespaldo();

    }


    if (contenedorCatalogo) {

        mostrarProductos(productos);

        inicializarFiltrosCategorias();

    }


    if (contenedorDetalle) {

        if (
            typeof mostrarDetalleProducto ===
            'function'
        ) {

            mostrarDetalleProducto();

        }

    }

}


// ============================================================
// FILTROS DE CATEGORÍAS
// ============================================================

function inicializarFiltrosCategorias() {

    const botones =
        document.querySelectorAll(
            '.cat-btn'
        );


    if (!botones.length) {
        return;
    }


    botones.forEach(btn => {

        btn.addEventListener(
            'click',
            e => {

                botones.forEach(b => {

                    b.classList.remove(
                        'active'
                    );

                });


                e.currentTarget.classList.add(
                    'active'
                );


                const catSeleccionada =
                    e.currentTarget.getAttribute(
                        'data-category'
                    ) ||
                    'Todos';


                categoriaActiva =
                    catSeleccionada;


                if (
                    catSeleccionada ===
                    'Todos'
                ) {

                    mostrarProductos(
                        productos
                    );

                } else {

                    const filtrados =
                        productos.filter(
                            p =>
                                p.categoria &&
                                p.categoria
                                    .toLowerCase() ===
                                catSeleccionada
                                    .toLowerCase()
                        );


                    mostrarProductos(
                        filtrados
                    );

                }

            }
        );

    });

}


// ============================================================
// MOSTRAR PRODUCTOS
// ============================================================

function mostrarProductos(lista) {

    const contenedor =
        document.getElementById(
            'products-container'
        ) ||
        document.getElementById(
            'lista-productos'
        );


    if (!contenedor) {
        return;
    }


    if (
        !Array.isArray(lista) ||
        lista.length === 0
    ) {

        contenedor.innerHTML = `

            <div
                style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:40px;
                    color:#6b7280;
                "
            >

                No se encontraron productos
                en la categoría
                "${categoriaActiva}".

            </div>

        `;

        return;
    }


    contenedor.innerHTML =
        lista.map(prod => {

            const colorInicial =
                prod.colores &&
                prod.colores.length > 0

                    ? prod.colores[0]

                    : {
                        nombre: 'Único',
                        imagen:
                            prod.imagen || ''
                    };


            const imagenInicial =
                colorInicial.imagen ||
                prod.imagen ||
                'https://via.placeholder.com/300x300/fbcfe8/db2777?text=Baby+Boutique';


            const listaTallas =
                prod.tallas ||
                [
                    '0 a 3 meses',
                    '3 a 6 meses',
                    '6 a 9 meses',
                    '9 a 12 meses'
                ];


            return `

                <div
                    class="product-card"
                    id="card-${prod.id}"
                >

                    <div>


                        <!-- IMAGEN -->

                        <div
                            class="product-image-container"
                        >

                            <span
                                class="product-badge"
                            >
                                ${prod.categoria || 'Boutique'}
                            </span>


                            <img
                                src="${imagenInicial}"
                                id="img-${prod.id}"
                                alt="${prod.nombre}"
                                onerror="
                                    this.src='https://via.placeholder.com/300x300/fbcfe8/db2777?text=Baby+Boutique'
                                "
                            >

                        </div>


                        <!-- CÓDIGO -->

                        <div
                            class="product-code"
                        >

                            CÓDIGO:
                            ${prod.codigo || prod.id}

                        </div>


                        <!-- NOMBRE -->

                        <h3
                            class="product-title"
                        >

                            ${prod.nombre}

                        </h3>


                        <!-- OPCIONES -->

                        <div
                            class="product-options"
                        >


                            ${
                                prod.colores &&
                                prod.colores.length > 0

                                    ? `

                                    <div
                                        class="option-group"
                                    >

                                        <label
                                            class="option-label"
                                        >

                                            Color:

                                            <span
                                                id="color-label-${prod.id}"
                                                style="
                                                    font-weight:bold;
                                                    color:#1f2937;
                                                "
                                            >

                                                ${colorInicial.nombre}

                                            </span>

                                        </label>


                                        <div
                                            class="color-picker"
                                        >

                                            ${
                                                prod.colores
                                                    .map(
                                                        (c, i) => `

                                                    <span
                                                        class="color-dot ${
                                                            i === 0
                                                                ? 'active'
                                                                : ''
                                                        }"
                                                        style="
                                                            background-color:${
                                                                c.hex ||
                                                                '#f472b6'
                                                            };
                                                        "
                                                        title="${c.nombre}"
                                                        onclick="
                                                            cambiarColorProducto(
                                                                '${prod.id}',
                                                                '${c.nombre}',
                                                                '${c.imagen}',
                                                                this
                                                            )
                                                        "
                                                    ></span>

                                                `
                                                    )
                                                    .join('')
                                            }

                                        </div>

                                    </div>

                                `

                                    : ''
                            }


                            <!-- TALLA -->

                            <div
                                class="option-group"
                            >

                                <label
                                    class="option-label"
                                >
                                    Talla:
                                </label>


                                <select
                                    class="
