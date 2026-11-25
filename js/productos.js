/* ==========================================================================
   Baby Boutique Ecuador - js/productos.js
   ========================================================================== */

let listaProductos = [];
const CARRITO_STORAGE_KEY = 'bb_ecuador_carrito_cliente';
const EXTENSIONES_SOPORTADAS = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'];

// ==========================================================================
// 0. DETECTOR AUTOMÁTICO DE FORMATOS DE IMAGEN (JPG, JPEG, PNG, WEBP)
// ==========================================================================
function manejarErrorImagen(imgElement) {
    const srcOriginal = imgElement.getAttribute('data-original-src') || imgElement.src;
    if (!imgElement.getAttribute('data-original-src')) {
        imgElement.setAttribute('data-original-src', srcOriginal);
    }

    let intentoActual = parseInt(imgElement.getAttribute('data-ext-attempt') || '0');
    const baseSinExt = srcOriginal.replace(/\.[^/.]+$/, "");

    if (intentoActual < EXTENSIONES_SOPORTADAS.length) {
        const nuevaExt = EXTENSIONES_SOPORTADAS[intentoActual];
        imgElement.setAttribute('data-ext-attempt', (intentoActual + 1).toString());
        const nuevaRuta = baseSinExt + nuevaExt;

        if (imgElement.src.endsWith(nuevaRuta)) {
            manejarErrorImagen(imgElement);
            return;
        }
        imgElement.src = nuevaRuta;
    } else {
        imgElement.onerror = null;
        imgElement.src = 'assets/placeholder.jpg';
    }
}

// ==========================================================================
// 1. GESTIÓN DE CARRITO AISLADO POR CLIENTE (LOCALSTORAGE)
// ==========================================================================
function obtenerCarritoCliente() {
    try {
        const guardado = localStorage.getItem(CARRITO_STORAGE_KEY);
        return guardado ? JSON.parse(guardado) : [];
    } catch (e) {
        console.error("Error al leer carrito:", e);
        return [];
    }
}

function guardarCarritoCliente(carritoActual) {
    try {
        localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carritoActual));
    } catch (e) {
        console.error("Error al guardar carrito:", e);
    }
}

function obtenerPrecioPorVolumen(prod, cantidad) {
    const base = Number(prod.precio || 0);
    const media = Number(prod.precioMediaDocena || base);
    const docena = Number(prod.precioDocena || base);

    if (cantidad >= 12) return docena;
    if (cantidad >= 6) return media;
    return base;
}

// ==========================================================================
// 2. CARGAR PRODUCTOS DESDE EL ARCHIVO JSON
// ==========================================================================
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

// ==========================================================================
// 3. RENDERIZAR LAS TARJETAS DE PRODUCTOS
// ==========================================================================
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
        if (prod.imagen_principal) {
            rutaImagen = prod.imagen_principal;
        } else if (prod.colores && prod.colores.length > 0 && prod.colores[0].imagen) {
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
                <img id="img-${idUnico}" 
                     src="${rutaImagen}" 
                     alt="${prod.nombre}" 
                     data-original-src="${rutaImagen}" 
                     data-ext-attempt="0" 
                     onerror="manejarErrorImagen(this)">
                <span class="field-label" style="font-weight:bold; color:#9ca3af; font-size:0.75rem;">CÓDIGO: ${prod.codigo || prod.id}</span>
                <h3 style="font-size:1.05rem; color:#1f2937; margin:5px 0 4px;">${prod.nombre}</h3>
                ${prod.tela ? `<p style="font-size:0.8rem; color:#6b7280; margin:0 0 8px;">Tela: <strong>${prod.tela}</strong></p>` : ''}
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
                    ${prod.precioMediaDocena ? `<p style="font-size:0.75rem; color:#be185d; margin:2px 0 0;">Media Docena (6+): $${Number(prod.precioMediaDocena).toFixed(2)} c/u</p>` : ''}
                    ${prod.precioDocena ? `<p style="font-size:0.75rem; color:#be185d; margin:0;">Docena (12+): $${Number(prod.precioDocena).toFixed(2)} c/u</p>` : ''}
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
                    if (imgElem) {
                        imgElem.setAttribute('data-original-src', nuevaImg);
                        imgElem.setAttribute('data-ext-attempt', '0');
                        imgElem.onerror = function() { manejarErrorImagen(this); };
                        imgElem.src = nuevaImg;
                    }
                }
            });
        }
    });
}

// ==========================================================================
// 4. AÑADIR PRODUCTO AL CARRITO
// ==========================================================================
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

    let carrito = obtenerCarritoCliente();

    const item = {
        id: prod.id || prod.codigo,
        codigo: prod.codigo || prod.id,
        nombre: prod.nombre,
        precio: Number(prod.precio || 0),
        precioMediaDocena: Number(prod.precioMediaDocena || prod.precio || 0),
        precioDocena: Number(prod.precioDocena || prod.precio || 0),
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

    guardarCarritoCliente(carrito);

    if (inputCant) inputCant.value = 0;

    actualizarCarritoUI();
    alert(`¡Se añadieron ${cantidad} unidad(es) de "${prod.nombre}" al carrito!`);
}

// ==========================================================================
// 5. CONTADOR DE ITEMS Y DIBUJO DEL RESUMEN DEL CARRITO
// ==========================================================================
function actualizarCarritoUI() {
    const carrito = obtenerCarritoCliente();
    const contador = document.getElementById("cart-counter") || document.getElementById("cart-count");
    const listaModal = document.getElementById("cart-items-container");
    const totalElem = document.getElementById("cart-total-price");

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
        const precioUnitario = obtenerPrecioPorVolumen(item, item.cantidad);
        const subtotal = precioUnitario * item.cantidad;
        totalDinero += subtotal;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.style.cssText = "display:flex; gap:10px; align-items:center; padding:10px 0; border-bottom:1px solid #eee;";
        div.innerHTML = `
            <img src="${item.imagen}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;" data-original-src="${item.imagen}" data-ext-attempt="0" onerror="manejarErrorImagen(this)">
            <div style="flex-grow:1;">
                <h4 style="font-size:0.9rem; margin:0;">${item.nombre}</h4>
                <p style="font-size:0.75rem; color:#6b7280; margin:0;">Color: ${item.color} | Talla: ${item.talla}</p>
                <p style="font-size:0.8rem; margin:0;">${item.cantidad} unidades x $${precioUnitario.toFixed(2)} = <strong>$${subtotal.toFixed(2)}</strong></p>
            </div>
            <button onclick="eliminarDelCarrito(${index})" style="background:none; border:none; color:red; cursor:pointer; font-size:1.1rem;" title="Eliminar">🗑️</button>
        `;
        listaModal.appendChild(div);
    });

    if (totalElem) totalElem.textContent = `$${totalDinero.toFixed(2)}`;
}

function eliminarDelCarrito(index) {
    let carrito = obtenerCarritoCliente();
    carrito.splice(index, 1);
    guardarCarritoCliente(carrito);
    actualizarCarritoUI();
}

// ==========================================================================
// 6. ABRIR Y CERRAR EL MODAL DEL CARRITO
// ==========================================================================
function toggleCarritoModal() {
    let modal = document.getElementById("cart-modal");
    
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

function inicializarBotonCarrito() {
    const btnCarrito = document.querySelector(".cart-icon-container, [onclick*='toggleCarritoModal']");
    if (btnCarrito) {
        btnCarrito.onclick = toggleCarritoModal;
    }
}

// ==========================================================================
// 7. ENVIAR RESUMEN POR WHATSAPP AL VENDEDOR Y RESPALDO A TU CORREO
// ==========================================================================
function enviarPedidoWhatsApp() {
    const carrito = obtenerCarritoCliente();

    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    let mensaje = "¡Hola Baby Boutique! Quisiera realizar el siguiente pedido:\n\n";
    let detalleCorreo = "";
    let total = 0;

    carrito.forEach((item, i) => {
        const precioUnitario = obtenerPrecioPorVolumen(item, item.cantidad);
        const sub = precioUnitario * item.cantidad;
        total += sub;

        mensaje += `${i + 1}. *${item.nombre}* (Cód: ${item.codigo})\n`;
        mensaje += `   - Color: ${item.color} | Talla: ${item.talla}\n`;
        mensaje += `   - Cantidad: ${item.cantidad} unidades | Subtotal: $${sub.toFixed(2)}\n\n`;

        detalleCorreo += `${i + 1}. ${item.nombre} (Cód: ${item.codigo}) | Color: ${item.color} | Talla: ${item.talla} | Cant: ${item.cantidad} | Subtotal: $${sub.toFixed(2)}\n`;
    });

    mensaje += `*Total a Pagar:* $${total.toFixed(2)}`;

    // Respaldo automático enviado a tu correo personal alexandercusco1@gmail.com
    const asunto = encodeURIComponent(`NUEVA VENTA REGISTRADA - Total: $${total.toFixed(2)}`);
    const cuerpoEmail = encodeURIComponent(`Hola Alexander,\n\nSe ha generado un nuevo pedido en la tienda web:\n\n${detalleCorreo}\nTOTAL VENTA: $${total.toFixed(2)}\nFecha: ${new Date().toLocaleString()}\n\nEl cliente fue redirigido al WhatsApp del vendedor (0981559211).`);

    try {
        const imgTracking = new Image();
        imgTracking.src = `https://formsubmit.co/ajax/alexandercusco1@gmail.com?subject=${asunto}&message=${cuerpoEmail}`;
    } catch (err) {
        console.warn("Respaldo de correo procesado.");
    }

    // Redirección al WhatsApp de ventas (0981559211)
    window.open("https://wa.me/593981559211?text=" + encodeURIComponent(mensaje), "_blank");
}

// ==========================================================================
// 8. FILTRADO DE CATEGORÍAS
// ==========================================================================
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
                       (categoriaBuscada.includes("conjunto") && (catProducto.includes("conjunto") || nombreProducto.includes("conjunto"))) ||
                       (categoriaBuscada.includes("buso") && (catProducto.includes("buso") || nombreProducto.includes("buso"))) ||
                       (categoriaBuscada.includes("salida") && (catProducto.includes("salida") || nombreProducto.includes("salida"))) ||
                       (categoriaBuscada.includes("toalla") && (catProducto.includes("toalla") || nombreProducto.includes("toalla"))) ||
                       (categoriaBuscada.includes("enterizo") && (catProducto.includes("enterizo") || nombreProducto.includes("enterizo"))) ||
                       (categoriaBuscada.includes("media") && (catProducto.includes("media") || nombreProducto.includes("media"))) ||
                       (categoriaBuscada.includes("accesorio") && (catProducto.includes("accesorio") || nombreProducto.includes("accesorio")));
            });

            renderizarProductos(filtrados);
        });
    });
}

// ==========================================================================
// 9. INICIALIZACIÓN
// ==========================================================================
document.addEventListener("DOMContentLoaded", function() {
    obtenerProductos();
    inicializarFiltros();
    inicializarBotonCarrito();
    actualizarCarritoUI();
});
