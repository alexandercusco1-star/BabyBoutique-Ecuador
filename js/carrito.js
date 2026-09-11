/* ==========================================================================
   Baby Boutique Ecuador - Módulo de Carrito de Compras (Corregido)
   ========================================================================== */

const CART_STORAGE_KEY = 'carrito';

// Obtener carrito desde localStorage
function getCart() {
    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error("Error al leer localStorage:", e);
        return [];
    }
}

// Guardar carrito en localStorage
function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        actualizarContador();
        actualizarBannerEnvio();
    } catch (e) {
        console.error("Error al guardar en localStorage:", e);
    }
}

// Suma la cantidad TOTAL de prendas reales (no solo la longitud del array)
function actualizarContador() {
    const cart = getCart();
    const elementosContador = document.querySelectorAll('#contadorCarrito, #contador-carrito, .cart-badge');
    
    // Suma real de todas las unidades seleccionadas
    const totalPrendas = cart.reduce((sum, item) => sum + (parseInt(item.cantidad) || 0), 0);
    
    elementosContador.forEach(el => {
        if (el) el.textContent = totalPrendas;
    });
}

// Determinar el precio según el volumen de compra
function getPrecioPorTramo(producto, cantidadTotal) {
    if (!producto) return 0;
    
    const precioUnidad = Number(producto.precio || (producto.precios ? producto.precios.unidad : 0)) || 0;
    const precioMedia = Number(producto.precioMediaDocena || (producto.precios ? producto.precios.media_docena : precioUnidad)) || precioUnidad;
    const precioDocena = Number(producto.precioDocena || (producto.precios ? producto.precios.docena : precioUnidad)) || precioUnidad;

    if (cantidadTotal >= 12) {
        return precioDocena;
    } else if (cantidadTotal >= 6) {
        return precioMedia;
    }
    return precioUnidad;
}

// Agregar producto al carrito
function agregarAlCarrito(producto) {
    if (!producto || !producto.id) return;
    
    let cart = getCart();
    
    const indexExistente = cart.findIndex(item => 
        item.id === producto.id && 
        item.color === producto.color && 
        item.talla === producto.talla
    );

    const cantidadAAgregar = parseInt(producto.cantidad) || 1;

    if (indexExistente > -1) {
        cart[indexExistente].cantidad += cantidadAAgregar;
    } else {
        producto.cantidad = cantidadAAgregar;
        cart.push(producto);
    }

    saveCart(cart);
    mostrarNotificacion(`¡${producto.nombre || 'Producto'} añadido al carrito!`);
}

// Eliminar producto por su índice
function eliminarProducto(index) {
    let cart = getCart();
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart(cart);
        if (typeof mostrarCarrito === 'function') {
            mostrarCarrito();
        }
    }
}

// Modificar cantidad desde el carrito
function actualizarCantidad(index, nuevaCantidad) {
    let cart = getCart();
    if (index >= 0 && index < cart.length) {
        const cantidadNum = parseInt(nuevaCantidad);
        if (isNaN(cantidadNum) || cantidadNum <= 0) {
            eliminarProducto(index);
            return;
        }
        cart[index].cantidad = cantidadNum;
        saveCart(cart);
        if (typeof mostrarCarrito === 'function') {
            mostrarCarrito();
        }
    }
}

// Vaciar carrito por completo
function vaciarCarrito() {
    if (confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
        localStorage.removeItem(CART_STORAGE_KEY);
        actualizarContador();
        actualizarBannerEnvio();
        if (typeof mostrarCarrito === 'function') {
            mostrarCarrito();
        }
    }
}

// Banner Dinámico de Envío Gratis
function actualizarBannerEnvio() {
    const cart = getCart();
    const totalPrendas = cart.reduce((sum, item) => sum + (parseInt(item.cantidad) || 0), 0);
    
    const textoBanner = document.getElementById('shipping-text');
    const barraProgreso = document.getElementById('shipping-fill');

    if (!textoBanner || !barraProgreso) return;

    const META_ENVIO_GRATIS = 12;

    if (totalPrendas === 0) {
        textoBanner.innerHTML = "🚚 ¡Agrega <strong>12 prendas</strong> para obtener <strong>ENVÍO GRATIS</strong> en Ecuador!";
        barraProgreso.style.width = "0%";
    } else if (totalPrendas >= META_ENVIO_GRATIS) {
        textoBanner.innerHTML = "🎉 <strong>¡Tu pedido tiene envío GRATIS!</strong>";
        barraProgreso.style.width = "100%";
    } else {
        const faltantes = META_ENVIO_GRATIS - totalPrendas;
        const porcentaje = Math.min(100, Math.round((totalPrendas / META_ENVIO_GRATIS) * 100));
        textoBanner.innerHTML = `🚚 Te faltan <strong>${faltantes} ${faltantes === 1 ? 'prenda' : 'prendas'}</strong> para obtener <strong>ENVÍO GRATIS</strong>`;
        barraProgreso.style.width = `${porcentaje}%`;
    }
}

// Generador Automático de Pedido por WhatsApp
function enviarWhatsApp() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de enviar el pedido.");
        return;
    }

    const codigoPedido = 'BB-' + Math.floor(10000 + Math.random() * 90000);
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-EC');
    const hora = ahora.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

    let totalPrendas = 0;
    let totalPagar = 0;

    let mensaje = `🛍️ *NUEVO PEDIDO - BABY BOUTIQUE ECUADOR* 🛍️\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `📌 *Código de Pedido:* #${codigoPedido}\n`;
    mensaje += `📅 *Fecha:* ${fecha} - ${hora}\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    mensaje += `📦 *DETALLE DE PRODUCTOS:* \n\n`;

    cart.forEach((item, idx) => {
        const cantidadItem = parseInt(item.cantidad) || 1;
        const precioUnitario = getPrecioPorTramo(item, cantidadItem);
        const subtotal = precioUnitario * cantidadItem;
        
        totalPrendas += cantidadItem;
        totalPagar += subtotal;

        mensaje += `${idx + 1}. *${item.nombre || 'Producto'}*\n`;
        mensaje += `   • Código: ${item.codigo || item.id}\n`;
        mensaje += `   • Color: ${item.color || 'N/A'} | Talla: ${item.talla || 'N/A'}\n`;
        mensaje += `   • Cantidad: ${cantidadItem} u.\n`;
        mensaje += `   • Precio U.: $${precioUnitario.toFixed(2)}\n`;
        mensaje += `   • Subtotal: *$${subtotal.toFixed(2)}*\n\n`;
    });

    const envioGratis = totalPrendas >= 12;

    mensaje += `━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `👕 *Total Prendas:* ${totalPrendas}\n`;
    mensaje += `🚚 *Envío:* ${envioGratis ? '✅ *GRATIS*' : '📦 Por calcular'}\n`;
    mensaje += `💰 *TOTAL A PAGAR:* *$${totalPagar.toFixed(2)}*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    mensaje += `Por favor me confirman la disponibilidad de los artículos para realizar el pago.`;

    const telefono = "593984391581";
    const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
}

// Notificación emergente
function mostrarNotificacion(mensaje) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #db2777;
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            font-weight: 600;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 2500);
}

// Sincronización en vivo entre pestañas y al cargar navegación móvil
function sincronizarTodo() {
    actualizarContador();
    actualizarBannerEnvio();
}

document.addEventListener('DOMContentLoaded', sincronizarTodo);
window.addEventListener('pageshow', sincronizarTodo); // Se ejecuta al volver atrás en navegadores móviles
window.addEventListener('storage', sincronizarTodo);  // Sincroniza si abre la web en dos pestañas
