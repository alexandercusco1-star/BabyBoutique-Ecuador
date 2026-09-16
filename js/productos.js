let listaProductos = [];

// Cargar productos desde el JSON
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
            console.error("Error al cargar JSON:", error);
        });
}

// Renderizar las tarjetas
function renderizarProductos(productos) {
    const contenedor = document.getElementById("products-container") || document.getElementById("grid-productos");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!productos || productos.length === 0) {
        const mensajeVacio = document.createElement("p");
        mensajeVacio.textContent = "No se encontraron productos en esta categoría.";
        mensajeVacio.style.cssText = "grid-column: 1/-1; text-align: center; padding: 30px; color: #6b7280;";
        contenedor.appendChild(mensajeVacio);
        return;
    }

    productos.forEach(function(prod) {
        const idUnico = prod.id || prod.codigo;
        const tarjeta = document.createElement("div");
        tarjeta.className = "product-card";
        tarjeta.style.cssText = "border: 1px solid #eee; border-radius: 12px; padding: 15px; background: #fff;";

        // Imagen
        const enlaceImg = document.createElement("a");
        enlaceImg.href = "producto.html?id=" + idUnico;

        const img = document.createElement("img");
        img.id = "img-" + idUnico;
        img.src = (prod.colores && prod.colores.length > 0) ? prod.colores[0].imagen : "assets/placeholder.jpg";
        img.alt = prod.nombre;
        img.style.cssText = "width: 100%; height: 200px; object-fit: cover; border-radius: 8px;";
        img.onerror = function() { this.src = "assets/placeholder.jpg"; };
        enlaceImg.appendChild(img);
        tarjeta.appendChild(enlaceImg);

        // Código
        const codigoSpan = document.createElement("span");
        codigoSpan.textContent = "CÓDIGO: " + prod.codigo;
        codigoSpan.style.cssText = "display: block; font-size: 0.75rem; color: #9ca3af; margin-top: 10px; font-weight: bold;";
        tarjeta.appendChild(codigoSpan);

        // Título
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
                const optSeleccionada = selectColor.options[selectColor.selectedIndex];
                const nuevaRuta = optSeleccionada.getAttribute("data-img");
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
        inputCantidad.value = "0";
        inputCantidad.min = "0";
        inputCantidad.style.cssText = "width: 100%; padding: 6px; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 12px;";
        tarjeta.appendChild(inputCantidad);

        // Precio
        const cajaPrecio = document.createElement("div");
        cajaPrecio.style.cssText = "text-align: center; background: #fff1f2; padding: 8px; border-radius: 8px; margin-bottom: 12px;";

        const txtPrecio = document.createElement("span");
        txtPrecio.textContent = "$" + Number(prod.precio).toFixed(2);
        txtPrecio.style.cssText = "font-size: 1.2rem; font-weight: bold; color: #db2777;";
        cajaPrecio.appendChild(txtPrecio);

        if (prod.precioMediaDocena) {
            const txtMayor = document.createElement("p");
            txtMayor.textContent = "Media Docena: $" + Number(prod.precioMediaDocena).toFixed(2);
            txtMayor.style.cssText = "font-size: 0.75rem; color: #e11d48; margin: 0;";
            cajaPrecio.appendChild(txtMayor);
        }
        tarjeta.appendChild(cajaPrecio);

        // Botón Añadir
        const btnAgregar = document.createElement("button");
        btnAgregar.textContent = "🛒 Añadir al Carrito";
        btnAgregar.style.cssText = "width: 100%; background: #db2777; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;";
        btnAgregar.addEventListener("click", function() {
            prepararAgregar(idUnico);
        });
        tarjeta.appendChild(btnAgregar);

        contenedor.appendChild(tarjeta);
    });
}

// Preparar producto para agregar al carrito
function prepararAgregar(idProducto) {
    const prod = listaProductos.find(function(p) { return (p.id === idProducto || p.codigo === idProducto); });
    if (!prod) return;

    const inputCant = document.getElementById("cantidad-" + idProducto);
    const cantidad = inputCant ? parseInt(inputCant.value) || 0 : 0;

    if (cantidad <= 0) {
        alert("Selecciona al menos 1 unidad.");
        return;
    }

    const selectColor = document.getElementById("color-" + idProducto);
    const selectTalla = document.getElementById("talla-" + idProducto);
    const imgElem = document.getElementById("img-" + idProducto);

    const item = {
        id: prod.id,
        codigo: prod.codigo,
        nombre: prod.nombre,
        precio: prod.precio,
        imagen: imgElem ? imgElem.src : "",
        color: selectColor ? selectColor.value : "Único",
        talla: selectTalla ? selectTalla.value : "Única",
        cantidad: cantidad
    };

    if (typeof agregarAlCarrito === "function") {
        agregarAlCarrito(item);
    }
}

// Filtros por Categoría
function inicializarFiltros() {
    const botones = document.querySelectorAll(".cat-btn");
    botones.forEach(function(btn) {
        btn.addEventListener("click", function(e) {
            botones.forEach(function(b) { b.classList.remove("active"); });
            e.currentTarget.classList.add("active");

            const cat = e.currentTarget.getAttribute("data-category").trim().toLowerCase();

            if (cat === "todos" || cat === "todas") {
                renderizarProductos(listaProductos);
            } else {
                const filtrados = listaProductos.filter(function(p) {
                    return (p.categoria || "").trim().toLowerCase() === cat;
                });
                renderizarProductos(filtrados);
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", function() {
    obtenerProductos();
    inicializarFiltros();
});
