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

// 2. RENDERIZAR LAS TARJETAS EN LA GRILLA
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

        // Obtener ruta de imagen
        let rutaImagen = "assets/placeholder.jpg";
        if (prod.colores && prod.colores.length > 0 && prod.colores[0].imagen) {
            rutaImagen = prod.colores[0].imagen;
        } else if (prod.imagen) {
            rutaImagen = prod.imagen;
        } else if (Array.isArray(prod.imagenes) && prod.imagenes.length > 0) {
            rutaImagen = prod.imagenes[0];
        }

        // Tallas por defecto
        const tallasDefecto = ["0 a 3 meses", "3 a 6 meses", "6 a 9 meses", "9 a 12 meses"];
        const listaTallas = (prod.tallas && prod.tallas.length > 0) ? prod.tallas : tallasDefecto;

        // Construir tarjeta
        let htmlTarjeta = `
            <div>
                <img id="img-${idUnico}" src="${rutaImagen}" alt="${prod.nombre}" onerror="this.src='assets/placeholder.jpg'">
                <span class="field-label" style="font-weight:bold; color:#9ca3af; font-size:0.75rem;">CÓDIGO: ${prod.codigo || prod.id}</span>
                <h3 style="font-size:1.05rem; color:#1f2937; margin:5px 0 10px;">${prod.nombre}</h3>
        `;

        // Selector de Colores
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

        // Selector de Tallas
        htmlTarjeta += `
            <label class="field-label">Talla:</label>
            <select id="talla-${idUnico}" class="select-input">
        `;
        listaTallas.forEach(function(t) {
            const valTalla = typeof t === 'object' ? `${t.edad || ''} (Talla ${t.numero || ''})` : t;
            htmlTarjeta += `<option value="${valTalla}">${valTalla}</option>`;
        });
        htmlTarjeta += `</select>`;

        // Input Cantidad
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

        // Listener cambio de color -> cambia imagen
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

// 3. SOLUCIÓN PROBLEMA 2: AÑADIR Y MARCAR EN EL CARRITO
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

    // Si ya existe en el carrito con el mismo color y talla, se suma la cantidad
    const indexExistente = carrito.findIndex(function(c) {
        return c.id === item.id && c.color === item.color && c.talla === item.talla;
    });

    if (indexExistente !== -1) {
        carrito[indexExistente].cantidad += cantidad;
    } else {
        carrito.push(item);
    }

    if (inputCant) inputCant.value = 0;

    // Actualizar el contador del botón del carrito en el HTML
    actualizarCarritoUI();
    alert(`¡Se añadieron ${cantidad} unidad(es) de "${prod.nombre}" al carrito!`);
}

// ACTUALIZAR CONTADOR Y MODAL DEL CARRITO
function actualizarCarritoUI() {
    const contador = document.getElementById("cart-counter") || document.getElementById("cart-count");
    const listaModal = document.getElementById("cart-items-container");
    const totalElem = document.getElementById("cart-total-price");

    // Suma total de prendas agregadas
    const totalPrendas = carrito.reduce(function(sum, item) { 
        return sum + item.cantidad; 
    }, 0);

    // Actualiza el número que sale arriba en el icono del carrito
    if (contador) {
        contador.textContent = totalPrendas;
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
                <p style="font-size:0.8rem; margin:0;">${item.cantidad} x $${Number(item.precio).toFixed(2)} = <strong>$${subtotal.toFixed(2)}</strong></p>
            </div>
            <button onclick="eliminarDelCarrito(${index})" style="background:none; border:none; color:red; cursor:pointer;">🗑️</button>
        `;
        listaModal.appendChild(div);
    });

    if (totalElem) totalElem.textContent = `$${totalDinero.toFixed(2)}`;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarritoUI();
}

// 4. SOLUCIÓN PROBLEMA 1: FILTRO DE CATEGORÍAS FLEXIBLE
function inicializarFiltros() {
    const botones = document.querySelectorAll(".cat-btn, .btn-categoria");
    botones.forEach(function(btn) {
        btn.addEventListener("click", function(e) {
            botones.forEach(function(b) { b.classList.remove("active"); });
            e.currentTarget.classList.add("active");

            let categoriaBuscada = (e.currentTarget.getAttribute("data-category") || e.currentTarget.textContent || "").trim().toLowerCase();

            // Si es "todos", mostrar todo
            if (categoriaBuscada.includes("todo")) {
                renderizarProductos(listaProductos);
                return;
            }

            // Normalización para coincidir plurales/singulares ("bodys", "body", "bodies", etc.)
            const filtrados = listaProductos.filter(function(p) {
                const catProducto = (p.categoria || "").trim().toLowerCase();
                const nombreProducto = (p.nombre || "").trim().toLowerCase();

                // Busca coincidencia en el campo categoria o en el título del producto
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

// INICIALIZACIÓN AUTOMÁTICA
document.addEventListener("DOMContentLoaded", function() {
    obtenerProductos();
    inicializarFiltros();
});
