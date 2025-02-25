document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("product-container")) {
        cargarProductosMenu();
        cargarOrden();
    }
    if (document.getElementById("product-list")) {
        cargarProductos();
    }
});

// Cargar productos en la página del menú
function cargarProductosMenu() {
    let container = document.getElementById("product-container");
    let productos = JSON.parse(localStorage.getItem("productos")) || [];

    container.innerHTML = productos.length === 0 ? "<p>No hay productos disponibles.</p>" : "";

    productos.forEach((producto, index) => {
        let item = document.createElement("div");
        item.className = "menu-item";
        item.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" style="width:100px; height:100px;">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <strong>$${producto.precio}</strong><br>
            <button onclick="agregarAlPedido(${index})">Agregar a la Orden</button>
        `;
        container.appendChild(item);
    });
}

// Agregar producto a la orden
function agregarAlPedido(index) {
    let productos = JSON.parse(localStorage.getItem("productos")) || [];
    let orden = JSON.parse(localStorage.getItem("orden")) || [];

    let producto = productos[index];
    let existe = orden.find(item => item.nombre === producto.nombre);

    if (existe) {
        existe.cantidad += 1;
    } else {
        orden.push({ ...producto, cantidad: 1 });
    }

    localStorage.setItem("orden", JSON.stringify(orden));
    cargarOrden();
}

// Cargar la orden en la tabla de pedidos
function cargarOrden() {
    let listaOrden = document.getElementById("order-list");
    let subtotalElem = document.getElementById("subtotal");
    let orden = JSON.parse(localStorage.getItem("orden")) || [];
    let subtotal = 0;

    listaOrden.innerHTML = "";

    orden.forEach((producto, index) => {
        let total = producto.precio * producto.cantidad;
        subtotal += total;

        let fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${producto.nombre}</td>
            <td>$${producto.precio}</td>
            <td>
                <button onclick="cambiarCantidad(${index}, -1)">-</button>
                ${producto.cantidad}
                <button onclick="cambiarCantidad(${index}, 1)">+</button>
            </td>
            <td>$${total.toFixed(2)}</td>
            <td><button onclick="eliminarDeOrden(${index})">Eliminar</button></td>
        `;
        listaOrden.appendChild(fila);
    });

    subtotalElem.textContent = subtotal.toFixed(2);
}

// Cambiar la cantidad de un producto en la orden
function cambiarCantidad(index, cambio) {
    let orden = JSON.parse(localStorage.getItem("orden")) || [];

    if (orden[index].cantidad + cambio > 0) {
        orden[index].cantidad += cambio;
    } else {
        orden.splice(index, 1);
    }

    localStorage.setItem("orden", JSON.stringify(orden));
    cargarOrden();
}

// Eliminar producto de la orden
function eliminarDeOrden(index) {
    let orden = JSON.parse(localStorage.getItem("orden")) || [];

    orden.splice(index, 1);
    localStorage.setItem("orden", JSON.stringify(orden));
    cargarOrden();
}

// Cargar productos en la tabla de administración
function cargarProductos() {
    let listaProductos = document.getElementById("product-list");
    let productos = JSON.parse(localStorage.getItem("productos")) || [];

    listaProductos.innerHTML = "";

    productos.forEach((producto, index) => {
        let fila = document.createElement("tr");
        fila.innerHTML = `
            <td><img src="${producto.imagen}" alt="${producto.nombre}" id="img-${index}" style="width:50px; height:50px;"></td>
            <td><input type="text" value="${producto.nombre}" id="name-${index}"></td>
            <td><input type="number" value="${producto.precio}" id="price-${index}"></td>
            <td><textarea id="desc-${index}">${producto.descripcion}</textarea></td>
            <td>
                <input type="file" id="img-upload-${index}" accept="image/*" onchange="previewImage(${index})">
                <button onclick="guardarEdicion(${index})">Guardar</button>
                <button onclick="eliminarProducto(${index})">Eliminar</button>
            </td>
        `;
        listaProductos.appendChild(fila);
    });
}

// Previsualizar nueva imagen
function previewImage(index) {
    let file = document.getElementById(`img-upload-${index}`).files[0];
    let reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById(`img-${index}`).src = e.target.result;
    };
    if (file) reader.readAsDataURL(file);
}

// Guardar cambios en la edición del producto
function guardarEdicion(index) {
    let productos = JSON.parse(localStorage.getItem("productos")) || [];

    productos[index].nombre = document.getElementById(`name-${index}`).value;
    productos[index].precio = parseFloat(document.getElementById(`price-${index}`).value);
    productos[index].descripcion = document.getElementById(`desc-${index}`).value;

    let imgInput = document.getElementById(`img-upload-${index}`);
    if (imgInput.files.length > 0) {
        let reader = new FileReader();
        reader.onload = function (e) {
            productos[index].imagen = e.target.result;
            localStorage.setItem("productos", JSON.stringify(productos));
            cargarProductos();
            cargarProductosMenu();
        };
        reader.readAsDataURL(imgInput.files[0]);
    } else {
        localStorage.setItem("productos", JSON.stringify(productos));
        cargarProductos();
        cargarProductosMenu();
    }
}

// Agregar producto nuevo
function agregarProducto() {
    let nombre = document.getElementById("new-name").value;
    let precio = parseFloat(document.getElementById("new-price").value);
    let descripcion = document.getElementById("new-description").value;
    let imagenInput = document.getElementById("new-image");

    if (!nombre || !precio || !descripcion || !imagenInput.files.length) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    let reader = new FileReader();
    reader.onload = function (e) {
        let productos = JSON.parse(localStorage.getItem("productos")) || [];
        productos.push({ nombre, precio, descripcion, imagen: e.target.result });
        localStorage.setItem("productos", JSON.stringify(productos));
        cargarProductos();
        cargarProductosMenu();
        document.getElementById("new-name").value = "";
        document.getElementById("new-price").value = "";
        document.getElementById("new-description").value = "";
        document.getElementById("new-image").value = "";
    };
    reader.readAsDataURL(imagenInput.files[0]);
}

// Eliminar producto
function eliminarProducto(index) {
    let productos = JSON.parse(localStorage.getItem("productos")) || [];
    if (confirm("¿Seguro que deseas eliminar este producto?")) {
        productos.splice(index, 1);
        localStorage.setItem("productos", JSON.stringify(productos));
        cargarProductos();
        cargarProductosMenu();
    }
}

// Función para hacer el pedido
function hacerPedido() {
    let orden = JSON.parse(localStorage.getItem("orden")) || [];
    let mensaje = "¡Hola! Quiero realizar un pedido de los siguientes productos:\n\n";

    if (orden.length === 0) {
        alert("No hay productos en la orden.");
        return;
    }

    // Agregar productos al mensaje
    orden.forEach((producto) => {
        mensaje += `${producto.nombre} x${producto.cantidad} - $${(producto.precio * producto.cantidad).toFixed(2)}\n`;
    });

    // Calcular el subtotal
    let subtotal = orden.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);

    mensaje += `\nSubtotal: $${subtotal.toFixed(2)}\n\n`;

    // Agregar dirección si la hay
    let direccion = document.getElementById("direccion").value;
    if (direccion) {
        mensaje += `Dirección de entrega: ${direccion}\n`;
    }

    // Enlace de WhatsApp
    let enlace = `https://wa.me/523329654769?text=${encodeURIComponent(mensaje)}`;
    window.open(enlace, "_blank");

    // Limpiar la orden después de hacer el pedido
    localStorage.setItem("orden", JSON.stringify([]));
    cargarOrden(); // Actualizar la vista de la orden
}
