/* ==========================================================================
   Baby Boutique Ecuador - js/productos.js
   ========================================================================== */

let listaProductos = [];
let carrito = [];

// 1. CARGAR PRODUCTOS DESDE EL ARCHIVO JSON
function obtenerProductos() {
    fetch("data/productos.json")
        .then(function(res) {
            if (!res.ok) {
                throw new Error("No se pudo cargar data/productos.json");
            }
            return res.json();
        })
        .then(function(datos) {
            listaProductos = datos;
            renderizarProductos(listaProductos);
        })
        .catch(function(error) {
            console.error("Error al cargar la base de datos:", error);
        });
}

// 2. RENDERIZAR LAS TARJETAS DE PRODUCTOS
function renderizarProductos(productos) {
    const contenedor = document.getElementById("grid-productos") || document.getElementById("products-container");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!productos || productos.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 40px; font-size: 1.1rem;">No se encontraron productos en esta categoría.</p>';
        return;
    }

    productos.forEach(function(prod) {
        const idUnico = prod.id || prod.codigo;
        const tarjeta = document.createElement("div");
        tarjeta.className = "product-card";

        let rutaImagen = "assets/placeholder.jpg";
        if (prod.colores && prod.colores.length > 0 && prod.colores[0].imagen) {
            rutaImagen = prod.colores[0].imagen;
        } else if (prod.imagen) {
            rutaImagen = prod.imagen;
        } else if (Array.isArray(prod.imagenes) && prod.imagenes.length > 0) {
            rutaImagen = prod.imagenes[0];
        }

        const tallasDefecto = ["0 a 3 meses", "3 a 6 meses", "6 a 9 meses", "9 a 12 meses"];
        const listaTallas = (prod.tallas && prod.tallas.length > 0) ? prod.tallas : tallasDefecto;

        let htmlTarjeta = `
            <div>
                <img id="img-${idUnico}" src="${rutaImagen}" alt="${prod.nombre}" onerror="this.src='assets/placeholder.jpg'">
                <span class="field-label" style="font-weight:bold; color:#9ca3af; font-size:0.75rem;">CÓDIGO: ${prod.codigo || prod.id}</span>
                <h3 style="font-size:1.05rem; color:#1f2937; margin:5px 0 10px;">${prod.nombre}</h3>
        `;

        if (prod.colores && prod.colores.length > 0) {
            htmlTarjeta += `
                <label class="field-label">Color:</label>
                <select id="color-${idUnico}" class="select-input">
            `;
            prod.colores.forEach(function(c) {
                const nombreColor = typeof c === 'object' ? c.nombre : c;
                const imgColor = typeof c === 'object' && c.imagen ? c.imagen : '';
                htmlTarjeta += `<option value="${nombreColor}" data-img="${imgColor}">${nombreColor}</option>`;
            });
            htmlTarjeta += `</select>`;
        }

        htmlTarjeta += `
            <label class="field-label">Talla:</label>
            <select id="talla-${idUnico}" class="select-input">
        `;
        listaTallas.forEach(function(t) {
            const valTalla = typeof t === 'object' ? `${t.edad || ''} (Talla ${t.numero || ''})` : t;
            htmlTarjeta += `<option value="${valTalla}">${valTalla}</option>`;
        });
        htmlTarjeta += `</select>`;

        htmlTarjeta += `
            <label class="field-label">Cantidad:</label>
            <input type="number" id="cantidad-${idUnico}" class="number-input" min="0" value="0">
            </div>
            <div>
                <div style="text-align: center; background: #fce7f3; padding: 8px; border-radius: 8px; margin: 10px 0;">
                    <span style="font-size: 1.2rem; font-weight: bold; color: #db2777;">$${Number(prod.precio || 0).toFixed(2)}</span>
                    ${prod.precioMediaDocena ? `<p style="font-size:0.75rem; color:#be185d; margin:0;">Media Docena: $${Number(prod.precioMediaDocena).toFixed(2)} c/u</p>` : ''}
                </div>
                <button class="btn-add-cart" onclick="agregarAlCarrito('${idUnico}')">
                    🛒 Añadir al Carrito
                </button>
            </div>
        `;

        tarjeta.innerHTML = htmlTarjeta;
        contenedor.appendChild(tarjeta);

        const selectColor = tarjeta.querySelector(`#color-${idUnico}`);
        if (selectColor) {
            selectColor.addEventListener("change", function(e) {
                const opt = e.target.options[e.target.selectedIndex];
                const nuevaImg = opt.getAttribute("data-img");
                if (nuevaImg) {
                    const imgElem = tarjeta.querySelector(`#img-${idUnico}`);
                    if (imgElem) imgElem.src = nuevaImg;
                }
            });
        }
    });
}

// 3. AÑADIR PRODUCTO AL CARRITO
function agregarAlCarrito(idProducto) {
    const prod = listaProductos.find(function(p) { 
        return p.id == idProducto || p.codigo == idProducto; 
    });
    if (!prod) return;

    const inputCant = document.getElementById("cantidad-" + idProducto);
    const selectColor = document.getElementById("color-" + idProducto);
    const selectTalla = document.getElementById("talla-" + idProducto);
    const imgElem = document.getElementById("img-" + idProducto);

    const cantidad = inputCant ? parseInt(inputCant.value) || 0 : 0;

    if (cantidad <= 0) {
        alert("Por favor selecciona una cantidad mayor a 0.");
        return;
    }

    const item = {
        id: prod.id || prod.codigo,
        codigo: prod.codigo || prod.id,
        nombre: prod.nombre,
        precio: prod.precio,
        imagen: imgElem ? imgElem.src : "assets/placeholder.jpg",
        color: selectColor ? selectColor.value : "Único",
        talla: selectTalla ? selectTalla.value : "Única",
        cantidad: cantidad
    };

    const indexExistente = carrito.findIndex(function(c) {
        return c.id === item.id && c.color === item.color && c.talla === item.talla;
    });

    if (indexExistente !== -1) {
        carrito[indexExistente].cantidad += cantidad;
    } else {
        carrito.push(item);
    }

    if (inputCant) inputCant.value = 0;

    actualizarCarritoUI();
    alert(`¡Se añadieron ${cantidad} unidad(es) de "${prod.nombre}" al carrito!`);
}

// 4. CORRECCIÓN PROBLEMA 1: CONTADOR DE ITEMS Y DIBUJO DEL RESUMEN
function actualizarCarritoUI() {
    const contador = document.getElementById("cart-counter") || document.getElementById("cart-count");
    const listaModal = document.getElementById("cart-items-container");
    const totalElem = document.getElementById("cart-total-price");

    // SOLUCIÓN 1: Muestra el número de tipos de productos/variantes agregados, no la cantidad total de prendas.
    if (contador) {
        contador.textContent = carrito.length;
    }

    if (!listaModal) return;

    if (carrito.length === 0) {
        listaModal.innerHTML = '<p style="text-align: center; color: #9ca3af; margin-top: 20px;">El carrito está vacío.</p>';
        if (totalElem) totalElem.textContent = "$0.00";
        return;
    }

    listaModal.innerHTML = "";
    let totalDinero = 0;

    carrito.forEach(function(item, index) {
        const subtotal = item.precio * item.cantidad;
        totalDinero += subtotal;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.style.cssText = "display:flex; gap:10px; align-items:center; padding:10px 0; border-bottom:1px solid #eee;";
        div.innerHTML = `
            <img src="${item.imagen}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;">
            <div style="flex-grow:1;">
                <h4 style="font-size:0.9rem; margin:0;">${item.nombre}</h4>
                <p style="font-size:0.75rem; color:#6b7280; margin:0;">Color: ${item.color} | Talla: ${item.talla}</p>
                <p style="font-size:0.8rem; margin:0;">${item.cantidad} unidades x $${Number(item.precio).toFixed(2)} = <strong>$${subtotal.toFixed(2)}</strong></p>
            </div>
            <button onclick="eliminarDelCarrito(${index})" style="background:none; border:none; color:red; cursor:pointer; font-size:1.1rem;" title="Eliminar">🗑️</button>
        `;
        listaModal.appendChild(div);
    });

    if (totalElem) totalElem.textContent = `$${totalDinero.toFixed(2)}`;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarritoUI();
}

// 5. CORRECCIÓN PROBLEMA 2: ABRIR EL CARRITO Y VER RESUMEN
function toggleCarritoModal() {
    let modal = document.getElementById("cart-modal");
    
    // Si la estructura del modal no existe en el HTML, se genera automáticamente de manera dinámica
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "cart-modal";
        modal.className = "cart-modal";
        modal.style.cssText = "display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:2000; justify-content:flex-end;";

        modal.innerHTML = `
            <div class="cart-content" style="background:#fff; width:100%; max-width:400px; height:100%; padding:20px; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
                <div class="cart-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:10px;">
                    <h3 style="margin:0; color:#db2777;">Tu Carrito</h3>
                    <button class="close-cart" onclick="toggleCarritoModal()" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
                </div>
                <div id="cart-items-container" class="cart-items-list" style="overflow-y:auto; flex-grow:1; margin:15px 0;">
                    <p style="text-align: center; color: #9ca3af; margin-top: 20px;">El carrito está vacío.</p>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem; margin-bottom:10px;">
                        <span>Total:</span>
                        <span id="cart-total-price">$0.00</span>
                    </div>
                    <button class="btn-pedir-whatsapp" onclick="enviarPedidoWhatsApp()" style="width:100%; background-color:#25d366; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; font-size:1rem; cursor:pointer;">
                        📱 Confirmar Pedido por WhatsApp
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    if (modal.style.display === "flex") {
        modal.style.display = "none";
    } else {
        actualizarCarritoUI();
        modal.style.display = "flex";
    }
}

// CONECTAR CLICK AL BOTÓN "MI CARRITO" DE LA CABECERA
function inicializarBotonCarrito() {
    const btnCarrito = document.querySelector(".cart-icon-container, [onclick*='toggleCarritoModal']");
    if (btnCarrito) {
        btnCarrito.onclick = toggleCarritoModal;
    }
}

// ENVIAR RESUMEN POR WHATSAPP
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    let mensaje = "¡Hola Baby Boutique! Quisiera realizar el siguiente pedido:\n\n";
    let total = 0;

    carrito.forEach((item, i) => {
        const sub = item.precio * item.cantidad;
        total += sub;
        mensaje += `${i + 1}. *${item.nombre}* (Cód: ${item.codigo})\n`;
        mensaje += `   - Color: ${item.color} | Talla: ${item.talla}\n`;
        mensaje += `   - Cantidad: ${item.cantidad} unidades | Subtotal: $${sub.toFixed(2)}\n\n`;
    });

    mensaje += `*Total a Pagar:* $${total.toFixed(2)}`;
    window.open("https://wa.me/593987654321?text=" + encodeURIComponent(mensaje), "_blank");
}

// FILTRADO DE CATEGORÍAS
function inicializarFiltros() {
    const botones = document.querySelectorAll(".cat-btn, .btn-categoria");
    botones.forEach(function(btn) {
        btn.addEventListener("click", function(e) {
            botones.forEach(function(b) { b.classList.remove("active"); });
            e.currentTarget.classList.add("active");

            let categoriaBuscada = (e.currentTarget.getAttribute("data-category") || e.currentTarget.textContent || "").trim().toLowerCase();

            if (categoriaBuscada.includes("todo")) {
                renderizarProductos(listaProductos);
                return;
            }

            const filtrados = listaProductos.filter(function(p) {
                const catProducto = (p.categoria || "").trim().toLowerCase();
                const nombreProducto = (p.nombre || "").trim().toLowerCase();

                return catProducto.includes(categoriaBuscada) || 
                       categoriaBuscada.includes(catProducto) ||
                       (categoriaBuscada.includes("body") && (catProducto.includes("body") || nombreProducto.includes("body"))) ||
                       (categoriaBuscada.includes("terno") && (catProducto.includes("terno") || nombreProducto.includes("terno"))) ||
                       (categoriaBuscada.includes("pijama") && (catProducto.includes("pijama") || nombreProducto.includes("pijama"))) ||
                       (categoriaBuscada.includes("vestido") && (catProducto.includes("vestido") || nombreProducto.includes("vestido"))) ||
                       (categoriaBuscada.includes("conjunto") && (catProducto.includes("conjunto") || nombreProducto.includes("conjunto"))) ||
                       (categoriaBuscada.includes("accesorio") && (catProducto.includes("accesorio") || nombreProducto.includes("accesorio")));
            });

            renderizarProductos(filtrados);
        });
    });
}

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", function() {
    obtenerProductos();
    inicializarFiltros();
    inicializarBotonCarrito();
});
