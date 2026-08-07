/* ==========================================================================
   Baby Boutique Ecuador - Vista Individual de Producto (producto.html)
   Archivo: js/producto.js
   ========================================================================== */

const detalleProducto = document.getElementById("detalle-producto");
let productoActual = null;
let colorSeleccionado = null;

async function cargarProducto() {
    if (!detalleProducto) return;

    try {
        const respuesta = await fetch("data/productos.json");
        if (!respuesta.ok) throw new Error("Error al obtener productos.json");
        const productos = await respuesta.json();

        const parametros = new URLSearchParams(window.location.search);
        const id = parametros.get("id");

        productoActual = productos.find(p => p.id == id || p.codigo == id);

        if (!productoActual) {
            detalleProducto.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h2 style="color: #831843;">⚠️ Producto no encontrado</h2>
                    <p style="color: #6b7280; margin: 15px 0;">El producto que buscas no existe o fue retirado del catálogo.</p>
                    <a href="productos.html" class="btn-secondary" style="display: inline-block; text-decoration: none;">Volver al Catálogo</a>
                </div>
            `;
            return;
        }

        renderizarDetalle();

    } catch (error) {
        console.error("Error al cargar la información del producto:", error);
        detalleProducto.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h2 style="color: #831843;">Error al cargar el producto</h2>
                <p style="color: #6b7280;">Intenta recargar la página o vuelve a la tienda.</p>
                <a href="productos.html" class="btn-secondary" style="display: inline-block; margin-top: 15px; text-decoration: none;">Volver al Catálogo</a>
            </div>
        `;
    }
}

function renderizarDetalle() {
    const prod = productoActual;
    colorSeleccionado = (prod.colores && prod.colores.length > 0) ? prod.colores[0] : { nombre: 'Único', imagen: prod.imagen || '' };
    
    const imagenInicial = colorSeleccionado.imagen || prod.imagen || 'https://via.placeholder.com/400x400/fbcfe8/db2777?text=Baby+Boutique';
    const listaTallas = prod.tallas || ["0 a 3 meses", "3 a 6 meses", "6 a 9 meses", "9 a 12 meses"];

    detalleProducto.innerHTML = `
        <div class="product-card" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; text-align: left; padding: 25px;">
            <div>
                <div class="product-image-container" style="height: 350px;">
                    <span class="product-badge">${prod.categoria || 'Boutique'}</span>
                    <img src="${imagenInicial}" id="img-detalle" alt="${prod.nombre}" style="object-fit: contain;" onerror="this.src='https://via.placeholder.com/400x400/fbcfe8/db2777?text=Baby+Boutique'">
                </div>
            </div>

            <div>
                <div class="product-code">CÓDIGO: ${prod.codigo || prod.id}</div>
                <h1 style="color: #831843; font-size: 1.8rem; margin: 10px 0;">${prod.nombre}</h1>
                <p style="color: #4b5563; margin-bottom: 20px; line-height: 1.5;">${prod.descripcion || 'Prenda elaborada con los mejores estándares de calidad para la comodidad de tu bebé.'}</p>

                <div class="product-options">
                    <!-- Selección de Color -->
                    ${prod.colores && prod.colores.length > 0 ? `
                    <div class="option-group">
                        <label class="option-label">Color seleccionable: <strong id="nombre-color-det" style="color: #831843;">${colorSeleccionado.nombre}</strong></label>
                        <div class="color-picker">
                            ${prod.colores.map((c, i) => `
                                <span class="color-dot ${i === 0 ? 'active' : ''}" 
                                      style="background-color: ${c.hex || '#f472b6'}; width: 32px; height: 32px;" 
                                      title="${c.nombre}"
                                      onclick="cambiarColorDetalle('${c.nombre}', '${c.imagen}', this)"></span>
                            `).join('')}
                        </div>
                    </div>` : ''}

                    <!-- Selección de Talla -->
                    <div class="option-group">
                        <label class="option-label">Seleccionar Talla:</label>
                        <select class="size-select" id="talla-detalle">
                            ${listaTallas.map(t => `<option value="${t.edad || t}">${t.edad ? `${t.numero ? 'Talla ' + t.numero + ' - ' : ''}${t.edad}` : t}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Cantidad -->
                    <div class="option-group">
                        <label class="option-label">Cantidad:</label>
                        <input type="number" class="qty-select" id="cantidad-detalle" value="1" min="1" max="100" 
                               onchange="actualizarPrecioDetalle()" onkeyup="actualizarPrecioDetalle()">
                    </div>
                </div>

                <!-- Caja de Precio -->
                <div class="price-box" style="margin: 20px 0;">
                    <div class="price-main" id="precio-detalle">$${(prod.precio || 0).toFixed(2)}</div>
                    <div class="price-tier-info" id="info-escala-detalle">Precio Unitario</div>
                </div>

                <button class="add-to-cart-btn" onclick="agregarAlCarritoDetalle()" style="font-size: 1.1rem; padding: 14px;">
                    🛒 Añadir al Carrito
                </button>
            </div>
        </div>
    `;

    actualizarPrecioDetalle();
}

function cambiarColorDetalle(nombreColor, urlImagen, elementoDot) {
    colorSeleccionado = { nombre: nombreColor, imagen: urlImagen };
    
    const imgDetalle = document.getElementById("img-detalle");
    const labelColor = document.getElementById("nombre-color-det");

    if (imgDetalle && urlImagen) imgDetalle.src = urlImagen;
    if (labelColor) labelColor.textContent = nombreColor;

    const dots = document.querySelectorAll("#detalle-producto .color-dot");
    dots.forEach(d => d.classList.remove("active"));
    if (elementoDot) elementoDot.classList.add("active");
}

function actualizarPrecioDetalle() {
    if (!productoActual) return;

    const inputCantidad = document.getElementById("cantidad-detalle");
    const displayPrecio = document.getElementById("precio-detalle");
    const displayInfo = document.getElementById("info-escala-detalle");

    let cantidad = parseInt(inputCantidad ? inputCantidad.value : 1) || 1;
    if (cantidad < 1) cantidad = 1;

    const pUnidad = productoActual.precio || 0;
    const pMedia = productoActual.precioMediaDocena || pUnidad;
    const pDocena = productoActual.precioDocena || pUnidad;

    let precioAplicado = pUnidad;
    let etiqueta = "Precio Unitario (1 a 5 prendas)";

    if (cantidad >= 12) {
        precioAplicado = pDocena;
        etiqueta = `⚡ Precio Docena ($${pDocena.toFixed(2)} c/u)`;
    } else if (cantidad >= 6) {
        precioAplicado = pMedia;
        etiqueta = `⭐ Precio Media Docena ($${pMedia.toFixed(2)} c/u)`;
    }

    const subtotal = precioAplicado * cantidad;

    if (displayPrecio) displayPrecio.textContent = `$${subtotal.toFixed(2)}`;
    if (displayInfo) displayInfo.textContent = etiqueta;
}

function agregarAlCarritoDetalle() {
    if (!productoActual) return;

    const selectTalla = document.getElementById("talla-detalle");
    const inputCantidad = document.getElementById("cantidad-detalle");
    const imgDetalle = document.getElementById("img-detalle");

    const talla = selectTalla ? selectTalla.value : 'Única';
    const cantidad = parseInt(inputCantidad ? inputCantidad.value : 1) || 1;
    const color = colorSeleccionado ? colorSeleccionado.nombre : 'Único';
    const imagen = imgDetalle ? imgDetalle.src : productoActual.imagen;

    const item = {
        id: productoActual.id,
        codigo: productoActual.codigo || productoActual.id,
        nombre: productoActual.nombre,
        categoria: productoActual.categoria,
        precio: productoActual.precio,
        precioMediaDocena: productoActual.precioMediaDocena,
        precioDocena: productoActual.precioDocena,
        color: color,
        talla: talla,
        cantidad: cantidad,
        imagen: imagen
    };

    if (typeof agregarAlCarrito === 'function') {
        agregarAlCarrito(item);
    } else {
        // Fallback básico si carrito.js no estuviera presente
        let cart = JSON.parse(localStorage.getItem("carrito")) || [];
        cart.push(item);
        localStorage.setItem("carrito", JSON.stringify(cart));
        alert("¡Producto añadido al carrito!");
    }
}

// Ejecutar carga al inicializar
document.addEventListener("DOMContentLoaded", cargarProducto);
