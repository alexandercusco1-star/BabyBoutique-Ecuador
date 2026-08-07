/* ==========================================================================
   Baby Boutique Ecuador - Módulo de Carrito de Compras
   Manejo de LocalStorage, Contador de Productos Diferentes, WhatsApp
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

// 1. OBLIGATORIO: Contador de PRODUCTOS DIFERENTES (No la suma de cantidades)
function actualizarContador() {
    const cart = getCart();
    const elementosContador = document.querySelectorAll('#contadorCarrito, #contador-carrito, .cart-badge');
    
    // Cuenta únicamente la cantidad de ítems/productos diferentes en el array
    const productosDiferentes = cart.length;
    
    elementosContador.forEach(el => {
        if (el) el.textContent = productosDiferentes;
    });
}

// Determinar el precio según el volumen de compra (Unidad, Media Docena, Docena)
function getPrecioPorTramo(producto, cantidadTotal) {
    if (!producto) return 0;
    
    // Soporte para estructura del JSON o datos planos
    const precioUnidad = producto.precio || (producto.precios ? producto.precios.unidad : 0);
    const precioMedia = producto.precioMediaDocena || (producto.precios ? producto.precios.media_docena : precioUnidad);
    const precioDocena = producto.precioDocena || (producto.precios ? producto.precios.docena : precioUnidad);

    if (cantidadTotal >= 12) {
        return precioDocena;
    } else if (cantidadTotal >= 6) {
        return precioMedia;
    }
    return precioUnidad;
}

// Agregar producto al carrito
function agregarAlCarrito(producto) {
    let cart = getCart();
    
    // Buscar si ya existe la combinación exacta de ID, color y talla
    const indexExistente = cart.findIndex(item => 
        item.id === producto.id && 
        item.color === producto.color && 
        item.talla === producto.talla
    );

    if (indexExistente > -1) {
        cart[indexExistente].cantidad += producto.cantidad;
    } else {
        cart.push(producto);
    }

    saveCart(cart);
    mostrarNotificacion(`¡${producto.nombre} añadido al carrito!`);
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

// Modificar cantidad desde botones +/- en la tabla del carrito
function actualizarCantidad(index, nuevaCantidad) {
    let cart = getCart();
    if (index >= 0 && index < cart.length) {
        if (nuevaCantidad <= 0) {
            eliminarProducto(index);
            return;
        }
        cart[index].cantidad = parseInt(nuevaCantidad);
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

// 7. OBLIGATORIO: Banner Dinámico de Envío Gratis (12 prendas)
function actualizarBannerEnvio() {
    const cart = getCart();
    const totalPrendas = cart.reduce((sum, item) => sum + item.cantidad, 0);
    
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

// 4. OBLIGATORIO: Generador Automático de Pedido por WhatsApp
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
        const precioUnitario = getPrecioPorTramo(item, item.cantidad);
        const subtotal = precioUnitario * item.cantidad;
        totalPrendas += item.cantidad;
        totalPagar += subtotal;

        mensaje += `${idx + 1}. *${item.nombre}*\n`;
        mensaje += `   • Código: ${item.codigo || item.id}\n`;
        mensaje += `   • Color: ${item.color} | Talla: ${item.talla}\n`;
        mensaje += `   • Cantidad: ${item.cantidad} u.\n`;
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

    const telefono = "593984391581"; // Número oficial 0984391581
    const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
}

// Notificación emergente ligera
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

// Inicializar contadores al cargar el script
document.addEventListener('DOMContentLoaded', () => {
    actualizarContador();
    actualizarBannerEnvio();
});
