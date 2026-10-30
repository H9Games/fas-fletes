"use strict";

// FAS FLETES V3
const $ = id => document.getElementById(id);

const dinero = n => new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN"
}).format(n);

const iniciales = [
  {
    id: "tornado",
    nombre: "Chevrolet Tornado Van",
    combustible: "Gasolina",
    rendimiento: 13,
    capacidad: 0,
    precio: 24,
    desgaste: 2,
    cargoPeso: 0,
    fijo: 0,
    seguroAnual: 0,
    viajesAnuales: 100
  },
  {
    id: "nissan",
    nombre: "Nissan Pick-Up 2004",
    combustible: "Gasolina",
    rendimiento: 8,
    capacidad: 0,
    precio: 24,
    desgaste: 2,
    cargoPeso: 0,
    fijo: 0,
    seguroAnual: 0,
    viajesAnuales: 100
  }
];

const CLAVE_UNIDADES = "fasUnidadesV3";
const CLAVE_CONFIG = "fasConfigV3";

function leer(clave, respaldo) {
  try {
    const dato = localStorage.getItem(clave);
    return dato === null ? respaldo : JSON.parse(dato);
  } catch {
    return respaldo;
  }
}

let unidades = leer(CLAVE_UNIDADES, iniciales);
if (!Array.isArray(unidades)) unidades = iniciales;

let editando = null;
let ultimaCotizacion = null;

const config = leer(CLAVE_CONFIG, {
  costoChofer: 0,
  margen: 45
});

$("costoChofer").value = config.costoChofer ?? 0;
$("margen").value = config.margen ?? 45;

function numero(id, minimo = 0) {
  const texto = $(id).value.trim();
  const n = Number(texto);

  if (texto === "" || !Number.isFinite(n) || n < minimo) {
    throw new Error("Revisa el campo: " + id);
  }
  return n;
}

function guardarUnidades() {
  localStorage.setItem(
    CLAVE_UNIDADES,
    JSON.stringify(unidades)
  );
}

function invalidar() {
  ultimaCotizacion = null;
  $("resultado").classList.add("oculto");
}

function unidadActual() {
  return unidades.find(u => u.id === $("unidad").value);
}

function actualizarInfo() {
  const u = unidadActual();

  if (!u) {
    $("infoUnidad").textContent = "Agrega una unidad.";
    $("infoPeso").textContent = "";
    return;
  }

  $("infoUnidad").textContent =
    `${u.rendimiento} km/L · ` +
    `Capacidad: ${u.capacidad || "Pendiente"} kg`;

  const peso = Number($("peso").value) || 0;

  if (!u.capacidad) {
    $("infoPeso").textContent =
      "Configura la capacidad de carga antes de cotizar.";
  } else if (peso > u.capacidad) {
    $("infoPeso").textContent =
      "⚠️ Esta carga supera la capacidad registrada.";
  } else {
    $("infoPeso").textContent =
      `Capacidad disponible: ${u.capacidad - peso} kg`;
  }
}

function actualizarSelector() {
  const anterior = $("unidad").value;
  $("unidad").replaceChildren();

  unidades.forEach(u => {
    const option = document.createElement("option");
    option.value = u.id;
    option.textContent = u.nombre;
    $("unidad").appendChild(option);
  });

  if (unidades.some(u => u.id === anterior)) {
    $("unidad").value = anterior;
  }

  actualizarInfo();
  invalidar();
}

function mostrarUnidades() {
  const lista = $("listaUnidades");
  lista.replaceChildren();

  unidades.forEach(u => {
    const card = document.createElement("div");
    card.className = "unidad-card";

    const titulo = document.createElement("strong");
    titulo.textContent = u.nombre;

    const detalles = document.createElement("p");
    detalles.textContent =
      `${u.rendimiento} km/L · ` +
      `${u.capacidad || "Sin definir"} kg · ` +
      `Seguro anual: ${dinero(u.seguroAnual || 0)}`;

    const acciones = document.createElement("div");
    acciones.className = "acciones-unidad";

    const editar = document.createElement("button");
    editar.textContent = "Editar";
    editar.onclick = () => editarUnidad(u.id);

    const eliminar = document.createElement("button");
    eliminar.textContent = "Eliminar";
    eliminar.className = "eliminar";
    eliminar.onclick = () => eliminarUnidad(u.id);

    acciones.append(editar, eliminar);
    card.append(titulo, detalles, acciones);
    lista.appendChild(card);
  });
}

function limpiarFormulario() {
  editando = null;
  $("tituloFormulario").textContent = "Agregar unidad";

  $("nombreUnidad").value = "";
  $("combustibleUnidad").value = "Gasolina";
  $("rendimientoUnidad").value = "";
  $("capacidadUnidad").value = "";
  $("precioUnidad").value = 24;
  $("desgasteUnidad").value = 2;
  $("pesoUnidad").value = 0;
  $("fijoUnidad").value = 0;
  $("seguroAnualUnidad").value = 0;
  $("viajesAnualesUnidad").value = 100;
}

function editarUnidad(id) {
  const u = unidades.find(x => x.id === id);
  if (!u) return;

  editando = id;
  $("tituloFormulario").textContent = "Editar unidad";

  $("nombreUnidad").value = u.nombre;
  $("combustibleUnidad").value = u.combustible;
  $("rendimientoUnidad").value = u.rendimiento;
  $("capacidadUnidad").value = u.capacidad || "";
  $("precioUnidad").value = u.precio;
  $("desgasteUnidad").value = u.desgaste;
  $("pesoUnidad").value = u.cargoPeso;
  $("fijoUnidad").value = u.fijo;
  $("seguroAnualUnidad").value = u.seguroAnual || 0;
  $("viajesAnualesUnidad").value = u.viajesAnuales || 100;

  $("tituloFormulario").scrollIntoView({
    behavior: "smooth"
  });
}

function guardarUnidad() {
  try {
    const nombre = $("nombreUnidad").value.trim();
    if (!nombre) throw new Error("Escribe el nombre.");

    const datos = {
      id: editando || (
        crypto.randomUUID?.() || "unidad-" + Date.now()
      ),
      nombre,
      combustible: $("combustibleUnidad").value,
      rendimiento: numero("rendimientoUnidad", 0.1),
      capacidad: numero("capacidadUnidad", 1),
      precio: numero("precioUnidad"),
      desgaste: numero("desgasteUnidad"),
      cargoPeso: numero("pesoUnidad"),
      fijo: numero("fijoUnidad"),
      seguroAnual: numero("seguroAnualUnidad"),
      viajesAnuales: numero("viajesAnualesUnidad", 1)
    };

    if (editando) {
      unidades = unidades.map(u =>
        u.id === editando ? datos : u
      );
    } else {
      unidades.push(datos);
    }

    guardarUnidades();
    limpiarFormulario();
    mostrarUnidades();
    actualizarSelector();

    alert("Unidad guardada correctamente.");
  } catch (error) {
    alert(error.message);
  }
}

function eliminarUnidad(id) {
  if (!confirm("¿Eliminar esta unidad?")) return;

  unidades = unidades.filter(u => u.id !== id);
  guardarUnidades();
  limpiarFormulario();
  mostrarUnidades();
  actualizarSelector();
}

function guardarConfig() {
  try {
    const chofer = numero("costoChofer");
    const margen = numero("margen");

    if (margen >= 100) {
      throw new Error("Margen inválido.");
    }

    localStorage.setItem(CLAVE_CONFIG, JSON.stringify({
      costoChofer: chofer,
      margen
    }));

    invalidar();
    alert("Configuración guardada.");
  } catch (error) {
    alert(error.message);
  }
}

function calcularCotizacion() {
  try {
    const u = unidadActual();
    if (!u) throw new Error("Registra una unidad.");

    if (!(u.capacidad > 0)) {
      throw new Error(
        "Primero configura la capacidad de esta unidad."
      );
    }

    const peso = numero("peso", 0.1);
    const kmIda = numero("kilometros", 0.1);

    if (peso > u.capacidad) {
      throw new Error(
        "La mercancía supera la capacidad registrada."
      );
    }

    const km = $("regreso").checked ? kmIda * 2 : kmIda;

    const combustible = km / u.rendimiento * u.precio;
    const desgaste = km * u.desgaste;
    const cargoPeso = peso / 100 * u.cargoPeso;

    const seguro = u.seguroAnual / u.viajesAnuales;
    const chofer = numero("costoChofer");
    const descarga = numero("descarga");
    const casetas = numero("casetas");
    const margen = numero("margen");

    const costo =
      combustible +
      desgaste +
      cargoPeso +
      seguro +
      chofer +
      descarga +
      casetas +
      u.fijo;

    const precio = Math.ceil(
      (costo / (1 - margen / 100)) / 10
    ) * 10;

    if (!Number.isFinite(precio)) {
      throw new Error("Error al calcular.");
    }

    ultimaCotizacion = { precio };

    $("precioFinal").textContent = dinero(precio);

    const conceptos = [
      ["Unidad", u.nombre],
      ["Peso", peso + " kg"],
      ["Distancia total", km + " km"],
      ["Combustible", dinero(combustible)],
      ["Desgaste", dinero(desgaste)],
      ["Cargo por peso", dinero(cargoPeso)],
      ["Seguro", dinero(seguro)],
      ["Chofer", dinero(chofer)],
      ["Carga y descarga", dinero(descarga)],
      ["Casetas y otros", dinero(casetas)],
      ["Otros gastos de unidad", dinero(u.fijo)],
      ["Costo total", dinero(costo)],
      ["Ganancia estimada", dinero(precio - costo)]
    ];

    const detalle = $("detalleCostos");
    detalle.replaceChildren();

    conceptos.forEach(([nombre, valor]) => {
      const linea = document.createElement("div");
      linea.textContent = `${nombre}: ${valor}`;
      detalle.appendChild(linea);
    });

    $("resultado").classList.remove("oculto");
    $("resultado").scrollIntoView({
      behavior: "smooth"
    });

  } catch (error) {
    alert(error.message);
  }
}

async function generarImagen() {
  if (!ultimaCotizacion) return;

  const canvas = $("canvasCotizacion");
  const ctx = canvas.getContext("2d");

  canvas.width = 1080;
  canvas.height = 1080;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.fillStyle = "#3478f6";
  ctx.fillRect(0, 0, 1080, 18);

  ctx.textAlign = "center";

  ctx.fillStyle = "#101827";
  ctx.font = "bold 80px Arial";
  ctx.fillText("FAS FLETES", 540, 270);

  ctx.fillStyle = "#64748b";
  ctx.font = "38px Arial";
  ctx.fillText("SU COTIZACIÓN ES", 540, 450);

  const precio = dinero(ultimaCotizacion.precio);
  let tamano = 120;

  ctx.font = `bold ${tamano}px Arial`;

  while (ctx.measureText(precio).width > 950 && tamano > 40) {
    tamano -= 5;
    ctx.font = `bold ${tamano}px Arial`;
  }

  ctx.fillStyle = "#16a34a";
  ctx.fillText(precio, 540, 590);

  ctx.fillStyle = "#101827";
  ctx.font = "bold 34px Arial";
  ctx.fillText("427 122 5673", 540, 900);

  const blob = await new Promise(resolve =>
    canvas.toBlob(resolve, "image/png")
  );

  if (!blob) {
    alert("No se pudo generar la imagen.");
    return;
  }

  const archivo = new File(
    [blob],
    "cotizacion-fas-fletes.png",
    { type: "image/png" }
  );

  if (
    navigator.share &&
    navigator.canShare?.({ files: [archivo] })
  ) {
    try {
      await navigator.share({ files: [archivo] });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = archivo.name;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Eventos
$("guardarUnidad").onclick = guardarUnidad;
$("cancelarUnidad").onclick = limpiarFormulario;
$("guardarConfig").onclick = guardarConfig;
$("cotizar").onclick = calcularCotizacion;
$("generarImagen").onclick = generarImagen;

$("unidad").onchange = () => {
  actualizarInfo();
  invalidar();
};

$("peso").oninput = () => {
  actualizarInfo();
  invalidar();
};

[
  "mercancia", "kilometros", "regreso",
  "descarga", "casetas", "costoChofer", "margen"
].forEach(id => {
  $(id).addEventListener("input", invalidar);
  $(id).addEventListener("change", invalidar);
});

// Iniciar aplicación
mostrarUnidades();
actualizarSelector();