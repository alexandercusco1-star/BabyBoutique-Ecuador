/* ==========================================================================
   Baby Boutique - productos.js
   Carga desde data/productos.json y envía a WhatsApp con 14.99% de descuento
   ========================================================================== */

let listaProductos = [];
const PORCENTAJE_DESCUENTO = 14.99;
const NUMERO_WHATSAPP = "593999999999"; // Cambia este número por el tuyo (sin signo +)

// 1. Cargar el JSON de productos
function obtenerProductos() {
    fetch("data/productos.json")
        .then(function(res) {
            return res.json();
        })
        .then(function(datos) {
            listaProductos = datos;
            renderizarProductos(listaProductos);
        })
        .catch(function(error) {
            console.error("Error al cargar data/productos.json:", error);
        });
}

// 2. Renderizar productos en pantalla
function renderizarProductos(productos) {
    const contenedor = document.getElementById("grid-productos") || document.getElementById("products-container");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!productos || productos.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 30px;">No se encontraron productos en esta categoría.</p>';
        return;
    }

    productos.forEach(function(prod) {
        const idUnico = prod.id || prod.codigo;
        const tarjeta = document.createElement("div");
        tarjeta.className = "product-card";
        tarjeta.style.cssText = "border: 1px solid #eee; border-radius: 12px; padding: 15px; background: #fff; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);";

        // Imagen
        const enlaceImg = document.createElement("a");
        enlaceImg.href = "producto.html?id=" + idUnico;

        const img = document.createElement("img");
        img.id = "img-" + idUnico;
        img.src = (prod.colores && prod.colores.length > 0 && prod.colores[0].imagen) ? prod.colores[0].imagen : "assets/placeholder.jpg";
        img.alt = prod.nombre;
        img.style.cssText = "width: 100%; height: 200px; object-fit: cover; border-radius: 8px;";
        img.onerror = function() { this.src = "assets/placeholder.jpg"; };
        enlaceImg.appendChild(img);
        tarjeta.appendChild(enlaceImg);

        // Código
        const codigoSpan = document.createElement("span");
        codigoSpan.textContent = "CÓDIGO: " + (prod.codigo || idUnico);
        codigoSpan.style.cssText = "display: block; font-size: 0.75rem; color: #9ca3af; margin-top: 10px; font-weight: bold;";
        tarjeta.appendChild(codigoSpan);

        // Nombre
        const titulo = document.createElement("h3");
        titulo.textContent = prod.nombre;
        titulo.style.cssText = "font-size: 1rem; color: #1f2937; margin: 5px 0 10px 0;";
        tarjeta.appendChild(titulo);

        // Selector Color
        if (prod.colores && prod.colores.length > 0) {
            const lblColor = document.createElement("label");
            lblColor.textContent = "Color:";
            lblColor.style.cssText = "display: block; font-size: 0.8rem; color: #4b5563;";
            tarjeta.appendChild(lblColor);

            const selectColor = document.createElement("select");
            selectColor.id = "color-" + idUnico;
            selectColor.style.cssText = "width: 100%; padding: 6px; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 8px;";

            prod.colores.forEach(function(c) {
                const opt = document.createElement("option");
                opt.value = c.nombre;
                opt.textContent = c.nombre;
                opt.setAttribute("data-img", c.imagen);
                selectColor.appendChild(opt);
            });

            selectColor.addEventListener("change", function() {
                const optSel = selectColor.options[selectColor.selectedIndex];
                const nuevaRuta = optSel.getAttribute("data-img");
                if (nuevaRuta) img.src = nuevaRuta;
            });

            tarjeta.appendChild(selectColor);
        }

        // Selector Talla
        const lblTalla = document.createElement("label");
        lblTalla.textContent = "Talla:";
        lblTalla.style.cssText = "display: block; font-size: 0.8rem; color: #4b5563;";
        tarjeta.appendChild(lblTalla);

        const selectTalla = document.createElement("select");
        selectTalla.id = "talla-" + idUnico;
        selectTalla.style.cssText = "width: 100%; padding: 6px; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 8px;";

        const listaTallas = (prod.tallas && prod.tallas.length > 0) ? prod.tallas : ["Talla Única"];
        listaTallas.forEach(function(t) {
            const opt = document.createElement("option");
            opt.value = t;
            opt.textContent = t;
            selectTalla.appendChild(opt);
        });
        tarjeta.appendChild(selectTalla);

        // Cantidad
        const lblCantidad = document.createElement("label");
        lblCantidad.textContent = "Cantidad:";
        lblCantidad.style.cssText = "display: block; font-size: 0.8rem; color: #4b5563;";
        tarjeta.appendChild(lblCantidad);

        const inputCantidad = document.createElement("input");
        inputCantidad.type = "number";
        inputCantidad.id = "cantidad-" + idUnico;
        inputCantidad.value = "1";
        inputCantidad.min = "1";
        inputCantidad.style.cssText = "width: 100%; padding: 6px; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 12px;";
        tarjeta.appendChild(inputCantidad);

        // Precio
        const cajaPrecio = document.createElement("div");
        cajaPrecio.style.cssText = "text-align: center; background: #fff1f2; padding: 8px; border-radius: 8px; margin-bottom: 12px;";

        const txtPrecio = document.createElement("span");
        txtPrecio.textContent = "$" + Number(prod.precio || 0).toFixed(2);
        txtPrecio.style.cssText = "font-size: 1.2rem; font-weight: bold; color: #db2777;";
        cajaPrecio.appendChild(txtPrecio);

        tarjeta.appendChild(cajaPrecio);

        // Botón WhatsApp con Descuento
        const btnAgregar = document.createElement("button");
        btnAgregar.textContent = "📲 Pedir con 14.99% Desc.";
        btnAgregar.style.cssText = "width: 100%; background: #db2777; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;";
        btnAgregar.addEventListener("click", function() {
            enviarPedidoIndividualWhatsApp(idUnico);
        });
        tarjeta.appendChild(btnAgregar);

        contenedor.appendChild(tarjeta);
    });
}

// 3. Enviar a WhatsApp con el mensaje estructurado y código de 24 horas
function enviarPedidoIndividualWhatsApp(idProducto) {
    const prod = listaProductos.find(function(p) { return (p.id === idProducto || p.codigo === idProducto); });
    if (!prod) return;

    const cantInput = document.getElementById("cantidad-" + idProducto);
    const cantidad = cantInput ? parseInt(cantInput.value) || 1 : 1;

    const colorSelect = document.getElementById("color-" + idProducto);
    const tallaSelect = document.getElementById("talla-" + idProducto);

    const colorElegido = colorSelect ? colorSelect.value : "Único";
    const tallaElegida = tallaSelect ? tallaSelect.value : "Única";

    // Cálculos
    const subtotal = prod.precio * cantidad;
    const montoDescuento = subtotal * (PORCENTAJE_DESCUENTO / 100);
    const totalConDescuento = subtotal - montoDescuento;

    // Generar código de validación (24 horas)
    const hoy = new Date();
    const fechaStr = hoy.toISOString().slice(0, 10).replace(/-/g, "");
    const numAleatorio = Math.floor(1000 + Math.random() * 9000);
    const codigoDescuento = "WEB1499-" + fechaStr + "-" + numAleatorio;

    // Construcción del mensaje
    let msj = "¡Hola! Quiero realizar un pedido desde la página web:\n\n";
    msj += "🛍️ *Producto:* " + prod.nombre + "\n";
    msj += "📌 *Código:* " + (prod.codigo || idProducto) + "\n";
    msj += "🎨 *Color:* " + colorElegido + "\n";
    msj += "📏 *Talla:* " + tallaElegida + "\n";
    msj += "🔢 *Cantidad:* " + cantidad + "\n\n";
    msj += "💵 *Subtotal:* $" + subtotal.toFixed(2) + "\n";
    msj += "🏷️ *Descuento Web (14.99%):* -$" + montoDescuento.toFixed(2) + "\n";
    msj += "✅ *Total a Pagar:* $" + totalConDescuento.toFixed(2) + "\n\n";
    msj += "🔑 *CÓDIGO DE DESCUENTO (24h):* `" + codigoDescuento + "`\n";
    msj += "_(Generado automáticamente desde la web)_";

    const url = "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(msj);
    window.open(url, "_blank");
}

// 4. Iniciar al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    obtenerProductos();
});
