/* ==========================================================================
   Baby Boutique Ecuador - Catálogo de Productos y Categorías
   ========================================================================== */

const listaProductos = [
    {
        id: "001",
        codigo: "001",
        nombre: "Body para Bebé Algodón Premium",
        categoria: "bodies",
        colores: ["Rosado", "Fucsia", "Blanco"],
        tallas: ["0 a 3 meses (Talla 0)", "3 a 6 meses (Talla 1)", "6 a 9 meses (Talla 2)", "9 a 12 meses (Talla 3)"],
        precio: 4.50,
        precioMediaDocena: 3.50,
        precioDocena: 3.00,
        imagen: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "002",
        codigo: "002",
        nombre: "Enterizo Felpa Osito",
        categoria: "enterizos",
        colores: ["Blanco", "Celeste", "Beige"],
        tallas: ["0 a 3 meses (Talla 0)", "3 a 6 meses (Talla 1)", "6 a 9 meses (Talla 2)", "9 a 12 meses (Talla 3)"],
        precio: 8.00,
        precioMediaDocena: 7.00,
        precioDocena: 6.00,
        imagen: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "003",
        codigo: "003",
        nombre: "Conjunto Algodón 2 Piezas",
        categoria: "conjuntos",
        colores: ["Azul", "Gris"],
        tallas: ["0 a 3 meses (Talla 0)", "3 a 6 meses (Talla 1)", "6 a 9 meses (Talla 2)", "9 a 12 meses (Talla 3)"],
        precio: 10.00,
        precioMediaDocena: 8.50,
        precioDocena: 7.50,
        imagen: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "004",
        codigo: "004",
        nombre: "Pack Medias Antideslizantes",
        categoria: "medias",
        colores: ["Variados"],
        tallas: ["0 a 3 meses (Talla 0)", "3 a 6 meses (Talla 1)"],
        precio: 3.00,
        precioMediaDocena: 2.50,
        precioDocena: 2.00,
        imagen: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "005",
        codigo: "005",
        nombre: "Toalla con Capucha Oso",
        categoria: "toallas",
        colores: ["Rosa", "Amarillo"],
        tallas: ["Única"],
        precio: 12.00,
        precioMediaDocena: 10.00,
        precioDocena: 9.00,
        imagen: "https://images.unsplash.com/photo-1616844868137-7ffaf43c2d80?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "006",
        codigo: "006",
        nombre: "Gorrito y Guantes Térmicos",
        categoria: "accesorios",
        colores: ["Blanco", "Verde Menta"],
        tallas: ["0 a 3 meses (Talla 0)"],
        precio: 5.00,
        precioMediaDocena: 4.00,
        precioDocena: 3.50,
        imagen: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=80"
    }
];

function renderizarProductos(productosAMostrar = listaProductos) {
    const contenedor = document.getElementById('products-container') || document.getElementById('grid-productos');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (productosAMostrar.length === 0) {
        contenedor.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 40px; font-size: 1.1rem;">No se encontraron productos disponibles en esta categoría.</p>`;
        return;
    }

    productosAMostrar.forEach(prod => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'product-card';
        tarjeta.style.cssText = "border: 1px solid #eee; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);";

        tarjeta.innerHTML = `
            <a href="producto.html?id=${prod.id}" style="text-decoration: none; color: inherit; display: block; overflow: hidden; height: 220px; background: #f9fafb;">
                <img src="${prod.imagen}" alt="${prod.nombre}" style="width:100%; height:100%; object-fit:cover; transition: transform 0.3s;" onerror="this.src='https://via.placeholder.com/300x300?text=Sin+Imagen'">
            </a>
            <div class="producto-info" style="padding: 15px;">
                <span style="font-size: 0.75rem; color: #9ca3af; font-weight: 600;">CÓDIGO: ${prod.codigo}</span>
                <a href="producto.html?id=${prod.id}" style="text-decoration: none;">
                    <h3 style="font-size: 1rem; color: #1f2937; margin: 5px 0 10px 0; height: 42px; overflow: hidden;">${prod.nombre}</h3>
                </a>
                
                <label style="display:block; font-size: 0.8rem; color: #4b5563;">Color:</label>
                <select id="color-${prod.id}" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 8px;">
                    ${prod.colores.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>

                <label style="display:block; font-size: 0.8rem; color: #4b5563;">Talla:</label>
                <select id="talla-${prod.id}" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 8px;">
                    ${prod.tallas.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>

                <label style="display:block; font-size: 0.8rem; color: #4b5563;">Cantidad:</label>
                <input type="number" id="cantidad-${prod.id}" min="0" value="0" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 12px;">

                <div style="text-align: center; background: #fff1f2; padding: 10px; border-radius: 8px; margin-bottom: 12px;">
                    <span style="font-size: 1.2rem; font-weight: bold; color: #db2777;">$${prod.precio.toFixed(2)}</span>
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

    const cantidad = cantidadInput ? parseInt(cantidadInput.value) || 0 : 0;

    if (cantidad <= 0) {
        alert("Por favor indica al menos 1 prenda en la cantidad.");
        return;
    }

    const productoAAgregar = {
        id: prod.id,
        codigo: prod.codigo,
        nombre: prod.nombre,
        precio: prod.precio,
        precioMediaDocena: prod.precioMediaDocena,
        precioDocena: prod.precioDocena,
        imagen: prod.imagen,
        color: colorSelect ? colorSelect.value : prod.colores[0],
        talla: tallaSelect ? tallaSelect.value : prod.tallas[0],
        cantidad: cantidad
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

            const categoria = e.currentTarget.getAttribute('data-category').trim().toLowerCase();

            if (categoria === 'todos') {
                renderizarProductos(listaProductos);
            } else {
                const filtrados = listaProductos.filter(p => p.categoria.trim().toLowerCase() === categoria);
                renderizarProductos(filtrados);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderizarProductos();
    inicializarFiltros();
});
