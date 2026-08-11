/* ==========================================================================
   Baby Boutique Ecuador - Lógica de Productos, Filtros y Precios Dinámicos
   Archivo: js/productos.js
   ========================================================================== */

let productos = [];
let categoriaActiva = 'Todos';

// CLAVE DE ALMACENAMIENTO PRIVADA POR DISPOSITIVO/NAVEGADOR
const CARRITO_STORAGE_KEY = 'bb_ecuador_carrito_cliente';

// Funciones Auxiliares para Carrito 100% Independiente por Usuario
function obtenerCarritoCliente() {
    try {
        const carrito = localStorage.getItem(CARRITO_STORAGE_KEY);
        return carrito ? JSON.parse(carrito) : [];
    } catch (e) {
        console.error("Error al leer el carrito local:", e);
        return [];
    }
}

function guardarCarritoCliente(carrito) {
    try {
        localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
    } catch (e) {
        console.error("Error al guardar el carrito local:", e);
    }
}

// Cargar productos desde data/productos.json con respaldo de seguridad
async function cargarProductos() {
    try {
        const respuesta = await fetch("data/productos.json");
        if (!respuesta.ok) throw new Error("No se pudo cargar productos.json");
        productos = await respuesta.json();
    } catch (error) {
        console.warn("Cargando datos de respaldo para visualización local:", error);
        productos = getProductosRespaldo();
    }

    // Identificar en qué página nos encontramos
    const contenedorCatalogo = document.getElementById("products-container") || document.getElementById("lista-productos");
    const contenedorDetalle = document.getElementById("detalle-producto");
    const contenedorTablaCarrito = document.getElementById("cart-items-container");

    if (contenedorCatalogo) {
        mostrarProductos(productos);
        inicializarFiltrosCategorias();
    }

    if (contenedorDetalle) {
        mostrarDetalleProducto();
    }

    if (contenedorTablaCarrito) {
        mostrarCarrito();
    }
}

// Configurar los botones de filtro por categoría
function inicializarFiltrosCategorias() {
    const botones = document.querySelectorAll('.cat-btn');
    if (!botones.length) return;

    botones.forEach(btn => {
        btn.addEventListener('click', (e) => {
            botones.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const catSeleccionada = e.target.getAttribute('data-category') || 'Todos';
            categoriaActiva = catSeleccionada;

            if (catSeleccionada === 'Todos') {
                mostrarProductos(productos);
            } else {
                const filtrados = productos.filter(p => 
                    p.categoria && p.categoria.toLowerCase() === catSeleccionada.toLowerCase()
                );
                mostrarProductos(filtrados);
            }
        });
    });
}

// Renderizar la lista de productos
function mostrarProductos(lista) {
    const contenedor = document.getElementById("products-container") || document.getElementById("lista-productos");
    if (!contenedor) return;

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6b7280;">
                No se encontraron productos en la categoría "${categoriaActiva}".
            </div>`;
        return;
    }

    contenedor.innerHTML = lista.map(prod => {
        const colorInicial = (prod.colores && prod.colores.length > 0) ? prod.colores[0] : { nombre: 'Único', imagen: prod.imagen || '' };
        const imagenInicial = colorInicial.imagen || prod.imagen || 'https://via.placeholder.com/300x300/fbcfe8/db2777?text=Baby+Boutique';
        
        // Obtener tallas formateadas
        const listaTallas = prod.tallas || ["0 a 3 meses", "3 a 6 meses", "6 a 9 meses", "9 a 12 meses"];

        return `
            <div class="product-card" id="card-${prod.id}">
                <div>
                    <div class="product-image-container">
                        <span class="product-badge">${prod.categoria || 'Boutique'}</span>
                        <img src="${imagenInicial}" id="img-${prod.id}" alt="${prod.nombre}" onerror="this.src='https://via.placeholder.com/300x300/fbcfe8/db2777?text=Baby+Boutique'">
                    </div>
                    <div class="product-code">CÓDIGO: ${prod.codigo || prod.id}</div>
                    <h3 class="product-title">${prod.nombre}</h3>
                    
                    <div class="product-options">
                        <!-- Selección de Color -->
                        ${prod.colores && prod.colores.length > 0 ? `
                        <div class="option-group">
                            <label class="option-label">Color: <span id="color-label-${prod.id}" style="font-weight:bold; color:#1f2937;">${colorInicial.nombre}</span></label>
                            <div class="color-picker">
                                ${prod.colores.map((c, i) => `
                                    <span class="color-dot ${i === 0 ? 'active' : ''}" 
                                          style="background-color: ${c.hex || '#f472b6'};" 
                                          title="${c.nombre}"
                                          onclick="cambiarColorProducto('${prod.id}', '${c.nombre}', '${c.imagen}', this)"></span>
                                `).join('')}
                            </div>
                        </div>` : ''}

                        <!-- Selección de Talla -->
                        <div class="option-group">
                            <label class="option-label">Talla:</label>
                            <select class="size-select" id="size-${prod.id}">
                                ${listaTallas.map(t => `<option value="${t.edad || t}">${t.edad ? `${t.numero ? 'Talla ' + t.numero + ' - ' : ''}${t.edad}` : t}</option>`).join('')}
                            </select>
                        </div>

                        <!-- Selector de Cantidad (Comienza en 0) -->
                        <div class="option-group">
                            <label class="option-label">Cantidad (Precio por volumen):</label>
                            <input type="number" class="qty-select" id="qty-${prod.id}" value="0" min="0" max="100" 
                                   onchange="actualizarPrecioEnTarjeta('${prod.id}')" onkeyup="actualizarPrecioEnTarjeta('${prod.id}')">
                        </div>
                    </div>

                    <!-- Visualización de Precio Dinámico -->
                    <div class="price-box">
                        <div class="price-main" id="price-${prod.id}">$0.00</div>
                        <div class="price-tier-info" id="tier-info-${prod.id}">Selecciona 1 o más prendas</div>
                    </div>
                </div>

                <button class="add-to-cart-btn" onclick="agregarProductoAlCarrito('${prod.id}')">
                    🛒 Añadir al Carrito
                </button>
            </div>
        `;
    }).join('');

    // Evaluar estado inicial (0) para cada tarjeta
    lista.forEach(p => actualizarPrecioEnTarjeta(p.id));
}

// Cambiar color de la prenda e imagen principal
function cambiarColorProducto(idProducto, nombreColor, urlImagen, elementoDot) {
    const tarjeta = document.getElementById(`card-${idProducto}`);
    if (!tarjeta) return;

    const img = document.getElementById(`img-${idProducto}`);
    const etiquetaColor = document.getElementById(`color-label-${idProducto}`);

    if (img && urlImagen) img.src = urlImagen;
    if (etiquetaColor) etiquetaColor.textContent = nombreColor;

    const dots = tarjeta.querySelectorAll('.color-dot');
    dots.forEach(d => d.classList.remove('active'));
    if (elementoDot) elementoDot.classList.add('active');
}

// Actualizar el precio dinámico según la cantidad seleccionada
function actualizarPrecioEnTarjeta(idProducto) {
    const prod = productos.find(p => p.id == idProducto || p.codigo == idProducto);
    if (!prod) return;

    const inputQty = document.getElementById(`qty-${idProducto}`);
    const displayPrecio = document.getElementById(`price-${idProducto}`);
    const displayInfo = document.getElementById(`tier-info-${idProducto}`);

    let cantidad = parseInt(inputQty ? inputQty.value : 0) || 0;

    if (cantidad <= 0) {
        if (displayPrecio) displayPrecio.textContent = "$0.00";
        if (displayInfo) displayInfo.textContent = "Selecciona 1 o más prendas";
        return;
    }

    const precioUnidad = prod.precio || 0;
    const precioMedia = prod.precioMediaDocena || precioUnidad;
    const precioDocena = prod.precioDocena || precioUnidad;

    let precioAplicado = precioUnidad;
    let textoEscala = "Precio Unitario (1 a 5 prendas)";

    if (cantidad >= 12) {
        precioAplicado = precioDocena;
        textoEscala = `⚡ Precio Docena: $${precioDocena.toFixed(2)} c/u`;
    } else if (cantidad >= 6) {
        precioAplicado = precioMedia;
        textoEscala = `⭐ Precio Media Docena: $${precioMedia.toFixed(2)} c/u`;
    }

    const subtotal = precioAplicado * cantidad;

    if (displayPrecio) displayPrecio.textContent = `$${subtotal.toFixed(2)}`;
    if (displayInfo) displayInfo.textContent = textoEscala;
}

// Botón de Añadir al Carrito (Aislado al almacenamiento del navegador cliente)
function agregarProductoAlCarrito(idProducto) {
    const inputQty = document.getElementById(`qty-${idProducto}`);
    const cantidad = parseInt(inputQty ? inputQty.value : 0) || 0;

    if (cantidad <= 0) {
        alert("Por favor selecciona al menos 1 prenda antes de agregar al carrito.");
        return;
    }

    const prod = productos.find(p => p.id == idProducto || p.codigo == idProducto);
    if (!prod) return;

    const labelColor = document.getElementById(`color-label-${idProducto}`);
    const selectSize = document.getElementById(`size-${idProducto}`);
    const imgElem = document.getElementById(`img-${idProducto}`);

    const colorSeleccionado = labelColor ? labelColor.textContent : (prod.colores && prod.colores[0] ? prod.colores[0].nombre : 'Único');
    const tallaSeleccionada = selectSize ? selectSize.value : 'Única';
    const imagenActual = imgElem ? imgElem.src : prod.imagen;

    const itemParaCarrito = {
        id: prod.id,
        codigo: prod.codigo || prod.id,
        nombre: prod.nombre,
        categoria: prod.categoria,
        precio: prod.precio,
        precioMediaDocena: prod.precioMediaDocena,
        precioDocena: prod.precioDocena,
        color: colorSeleccionado,
        talla: tallaSeleccionada,
        cantidad: cantidad,
        imagen: imagenActual
    };

    let cart = obtenerCarritoCliente();
    
    // Verificar si ya existe el mismo producto con mismo color y talla
    const indexExistente = cart.findIndex(item => item.id === itemParaCarrito.id && item.color === itemParaCarrito.color && item.talla === itemParaCarrito.talla);
    
    if (indexExistente !== -1) {
        cart[indexExistente].cantidad += cantidad;
    } else {
        cart.push(itemParaCarrito);
    }

    guardarCarritoCliente(cart);
    alert(`¡Se agregaron ${cantidad} unidad(es) de "${prod.nombre}" a tu carrito privado!`);
}

// Calcular precio por unidad según el tramo
function obtenerPrecioTramoUnico(item, cantidad) {
    if (cantidad >= 12) return item.precioDocena || item.precio;
    if (cantidad >= 6) return item.precioMediaDocena || item.precio;
    return item.precio;
}

// Renderizado de la tabla del Carrito (carrito.html)
function mostrarCarrito() {
    const contenedorTabla = document.getElementById("cart-items-container");
    const displayTotal = document.getElementById("cart-total-price");
    const displayCantItems = document.getElementById("cart-total-items");

    if (!contenedorTabla) return;

    const cart = obtenerCarritoCliente();

    if (cart.length === 0) {
        contenedorTabla.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #6b7280;">
                    🛒 Tu carrito está vacío.<br><br>
                    <a href="productos.html" class="btn-secondary" style="display:inline-block; margin-top:10px;">Ir a Ver Productos</a>
                </td>
            </tr>`;
        if (displayTotal) displayTotal.textContent = '$0.00';
        if (displayCantItems) displayCantItems.textContent = '0';
        return;
    }

    let granTotal = 0;
    let prendasTotales = 0;

    contenedorTabla.innerHTML = cart.map((item, index) => {
        const precioUnitario = obtenerPrecioTramoUnico(item, item.cantidad);
        const subtotal = precioUnitario * item.cantidad;
        granTotal += subtotal;
        prendasTotales += item.cantidad;

        return `
            <tr>
                <td><img src="${item.imagen}" class="cart-thumb" alt="${item.nombre}" onerror="this.src='https://via.placeholder.com/65x65/fbcfe8/db2777'"></td>
                <td><strong>${item.nombre}</strong></td>
                <td><code>${item.codigo || item.id}</code></td>
                <td>${item.color}</td>
                <td>${item.talla}</td>
                <td>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="actualizarCantidadCliente(${index}, ${item.cantidad - 1})">-</button>
                        <span class="qty-val">${item.cantidad}</span>
                        <button class="qty-btn" onclick="actualizarCantidadCliente(${index}, ${item.cantidad + 1})">+</button>
                    </div>
                </td>
                <td>$${precioUnitario.toFixed(2)}</td>
                <td><strong>$${subtotal.toFixed(2)}</strong></td>
                <td>
                    <button class="btn-delete" onclick="eliminarProductoCliente(${index})">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');

    if (displayTotal) displayTotal.textContent = `$${granTotal.toFixed(2)}`;
    if (displayCantItems) displayCantItems.textContent = prendasTotales;
}

// Funciones para modificar el carrito de forma totalmente aislada
function actualizarCantidadCliente(index, nuevaCantidad) {
    let cart = obtenerCarritoCliente();
    if (nuevaCantidad <= 0) {
        cart.splice(index, 1);
    } else {
        cart[index].cantidad = nuevaCantidad;
    }
    guardarCarritoCliente(cart);
    mostrarCarrito();
}

function eliminarProductoCliente(index) {
    let cart = obtenerCarritoCliente();
    cart.splice(index, 1);
    guardarCarritoCliente(cart);
    mostrarCarrito();
}

// Datos de respaldo para pruebas locales
function getProductosRespaldo() {
    return [
        {
            "id": "BODY-001", "codigo": "001", "nombre": "Body para Bebé Algodón Premium", "categoria": "Bodies",
            "precio": 4.00, "precioMediaDocena": 3.50, "precioDocena": 3.00,
            "colores": [{ "nombre": "Rosado", "hex": "#f472b6", "imagen": "assets/productos/body001/rosado.jpg" }, { "nombre": "Fucsia", "hex": "#db2777", "imagen": "assets/productos/body001/fucsia.jpg" }]
        },
        {
            "id": "ENT-002", "codigo": "002", "nombre": "Enterizo Térmico Cómodo", "categoria": "Enterizos",
            "precio": 9.00, "precioMediaDocena": 8.50, "precioDocena": 8.00,
            "colores": [{ "nombre": "Blanco", "hex": "#ffffff", "imagen": "assets/productos/enterizo001/blanco.jpg" }]
        }
    ];
}

// Inicializar la carga de productos al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);
