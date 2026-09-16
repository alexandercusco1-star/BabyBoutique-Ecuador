/* ==========================================================================
   Baby Boutique Ecuador - Vista Individual de Producto
   ========================================================================== */

const detalleProducto = document.getElementById("detalle-producto");
let productoActual = null;
let colorSeleccionado = null;

async function cargarProducto() {
    if (!detalleProducto) return;

    try {
        const parametros = new URLSearchParams(window.location.search);
        const id = parametros.get("id");

        let productos = [];
        try {
            const respuesta = await fetch("data/productos.json");
            if (respuesta.ok) productos = await respuesta.json();
        } catch (e) {
            console.warn("Usando listaProductos local.");
        }

        if (productos.length === 0 && typeof listaProductos !== 'undefined') {
            productos = listaProductos;
        }

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
    }
}

function renderizarDetalle() {
    const prod = productoActual;
    colorSeleccionado = (prod.colores && prod.colores.length > 0) 
        ? (typeof prod.colores[0] === 'string' ? { nombre: prod.colores[0], imagen: prod.imagen } : prod.colores[0])
        : { nombre: 'Único', imagen: prod.imagen || '' };
    
    const imagenInicial = colorSeleccionado.imagen || prod.imagen || './img/placeholder.jpg';
    const listaTallas = prod.tallas || ["0 a 3 meses", "3 a 6 meses", "6 a 9 meses", "9 a 12 meses"];

    detalleProducto.innerHTML = `
        <div class="product-card" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; text-align: left; padding: 25px;">
            <div>
                <div class="product-image-container" style="height: 350px;">
                    <span class="product-badge">${prod.categoria || 'Boutique'}</span>
                    <img src="${imagenInicial}" id="img-detalle" alt="${prod.nombre}" style="width:100%; height:100%; object-fit: contain;" onerror="this.src='./img/placeholder.jpg'">
                </div>
            </div>

            <div>
                <div class="product-code">CÓDIGO: ${prod.codigo || prod.id}</div>
                <h1 style="color: #831843; font-size: 1.8rem; margin: 10px 0;">${prod.nombre}</h1>
                <p style="color: #4b5563; margin-bottom: 20px; line-height: 1.5;">${prod.descripcion || 'Prenda elaborada con los mejores estándares de calidad para la comodidad de tu bebé.'}</p>

                <div class="product-options">
                    ${prod.colores && prod.colores.length > 0 ? `
                    <div class="option-group">
                        <label class="option-label">Color: <strong id="nombre-color-det" style="color: #831843;">${colorSeleccionado.nombre || colorSeleccionado}</strong></label>
                        <select id="color-select-det" class="size-select" style="width:100%; margin-bottom:10px;" onchange="cambiarColorCombo(this.value)">
                            ${prod.colores.map(c => `<option value="${c.nombre || c}">${c.nombre || c}</option>`).join('')}
                        </select>
                    </div>` : ''}

                    <div class="option-group">
                        <label class="option-label">Seleccionar Talla:</label>
                        <select class="size-select" id="talla-detalle" style="width:100%; margin-bottom:10px;">
                            ${listaTallas.map(t => `<option value="${t.edad || t}">${t.edad ? `${t.numero ? 'Talla ' + t.numero + ' - ' : ''}${t.edad}` : t}</option>`).join('')}
                        </select>
                    </div>

                    <div class="option-group">
                        <label class="option-label">Cantidad:</label>
                        <input type="number" class="qty-select" id="cantidad-detalle" value="1" min="1" max="100" style="width:100%; padding:6px;"
                               onchange="actualizarPrecioDetalle()" onkeyup="actualizarPrecioDetalle()">
                    </div>
                </div>

                <div class="price-box" style="margin: 20px 0; background:#fff1f2; padding:15px; border-radius:8px;">
                    <div class="price-main" id="precio-detalle" style="font-size:1.8rem; font-weight:bold; color:#db2777;">$${(prod.precio || 0).toFixed(2)}</div>
                    <div class="price-tier-info" id="info-escala-detalle" style="color:#e11d48; font-size:0.9rem;">Precio Unitario</div>
                </div>

                <button class="add-to-cart-btn" onclick="agregarAlCarritoDetalle()" style="width:100%; background:#db2777; color:white; border:none; font-size: 1.1rem; padding: 14px; border-radius:8px; cursor:pointer;">
                    🛒 Añadir al Carrito
                </button>
            </div>
        </div>
    `;

    actualizarPrecioDetalle();
}

function cambiarColorCombo(nombreColor) {
    colorSeleccionado = nombreColor;
    const labelColor = document.getElementById("nombre-color-det");
    if (labelColor) labelColor.textContent = nombreColor;
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
    const color = typeof colorSeleccionado === 'object' ? colorSeleccionado.nombre : (colorSeleccionado || 'Único');
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
    }
}

document.addEventListener("DOMContentLoaded", cargarProducto);
