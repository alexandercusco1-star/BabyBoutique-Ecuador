/* ==========================================================================
   Baby Boutique Ecuador - Catálogo de Productos
   ========================================================================== */

const listaProductos = [
    {
        id: "001",
        codigo: "001",
        nombre: "Body para Bebé Algodón Premium",
        categoria: "bodies",
        colores: ["Rosado", "Fucsia"],
        tallas: ["0 a 3 meses", "3 a 6 meses", "6 a 12 meses"],
        precio: 4.50,
        precioMediaDocena: 3.50,
        precioDocena: 3.00,
        imagen: "./img/body-rosado.jpg"
    },
    {
        id: "002",
        codigo: "002",
        nombre: "Enterizo Felpa Osito",
        categoria: "enterizos",
        colores: ["Blanco", "Celeste"],
        tallas: ["0 a 3 meses", "3 a 6 meses"],
        precio: 8.00,
        precioMediaDocena: 7.00,
        precioDocena: 6.00,
        imagen: "./img/enterizo-osito.jpg"
    }
];

function renderizarProductos(productosAMostrar = listaProductos) {
    const contenedor = document.getElementById('products-container') || document.getElementById('grid-productos');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (productosAMostrar.length === 0) {
        contenedor.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 40px;">No se encontraron productos en esta categoría.</p>`;
        return;
    }

    productosAMostrar.forEach(prod => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'product-card';
        tarjeta.innerHTML = `
            <a href="producto.html?id=${prod.id}" style="text-decoration: none; color: inherit;">
                <img src="${prod.imagen || './img/placeholder.jpg'}" alt="${prod.nombre}" style="width:100%; height:220px; object-fit:cover; border-radius:8px;">
            </a>
            <div class="producto-info" style="padding: 15px;">
                <span style="font-size: 0.8rem; color: #9ca3af;">CÓDIGO: ${prod.codigo}</span>
                <a href="producto.html?id=${prod.id}" style="text-decoration: none;">
                    <h3 style="font-size: 1.1rem; color: #1f2937; margin: 5px 0;">${prod.nombre}</h3>
                </a>
                
                <label style="display:block; font-size: 0.85rem; margin-top: 10px;">Color:</label>
                <select id="color-${prod.id}" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 8px;">
                    ${prod.colores.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>

                <label style="display:block; font-size: 0.85rem;">Talla:</label>
                <select id="talla-${prod.id}" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 8px;">
                    ${prod.tallas.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>

                <label style="display:block; font-size: 0.85rem;">Cantidad:</label>
                <input type="number" id="cantidad-${prod.id}" min="1" value="1" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 12px;">

                <div style="text-align: center; background: #fff1f2; padding: 10px; border-radius: 8px; margin-bottom: 12px;">
                    <span style="font-size: 1.3rem; font-weight: bold; color: #db2777;">$${prod.precio.toFixed(2)}</span>
                    <p style="font-size: 0.75rem; color: #e11d48; margin: 0;">Media Docena: $${prod.precioMediaDocena.toFixed(2)} c/u</p>
                </div>

                <button onclick="prepararAgregar('${prod.id}')" class="btn-primary" style="width: 100%; background: #db2777; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    🛒 Añadir al Carrito
                </button>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function prepararAgregar(idProducto) {
    const prod = listaProductos.find(p => p.id === idProducto);
    if (!prod) return;

    const colorSelect = document.getElementById(`color-${idProducto}`);
    const tallaSelect = document.getElementById(`talla-${idProducto}`);
    const cantidadInput = document.getElementById(`cantidad-${idProducto}`);

    const productoAAgregar = {
        id: prod.id,
        codigo: prod.codigo,
        nombre: prod.nombre,
        precio: prod.precio,
        precioMediaDocena: prod.precioMediaDocena,
        precioDocena: prod.precioDocena,
        imagen: prod.imagen,
        color: colorSelect ? colorSelect.value : '',
        talla: tallaSelect ? tallaSelect.value : '',
        cantidad: cantidadInput ? parseInt(cantidadInput.value) || 1 : 1
    };

    if (typeof agregarAlCarrito === 'function') {
        agregarAlCarrito(productoAAgregar);
    }
}

function inicializarFiltros() {
    const botones = document.querySelectorAll('.cat-btn');
    botones.forEach(btn => {
        btn.addEventListener('click', (e) => {
            botones.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const categoria = e.currentTarget.getAttribute('data-category').toLowerCase();

            if (categoria === 'todos') {
                renderizarProductos(listaProductos);
            } else {
                const filtrados = listaProductos.filter(p => p.categoria.toLowerCase() === categoria);
                renderizarProductos(filtrados);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderizarProductos();
    inicializarFiltros();
});
