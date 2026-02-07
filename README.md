# 🏭 TodoTejidos Manager - Documentación de Funcionalidades

Este documento detalla todas las capacidades y flujos de trabajo del sistema de gestión de producción y logística.

---

## 1. 🛠️ Módulo de Administración (`/admin`)
El centro de control para la gerencia. Desde aquí se gestionan los insumos del sistema (pedidos y configuraciones).

### Gestión de Pedidos
-   **Importación Masiva**: Carga de pedidos desde Excel (`.xlsx`). El sistema lee automáticamente OCs, Clientes, Productos y Cantidades.
-   **Registro Manual**: Formulario para crear pedidos individuales urgentes o especiales.
-   **Explorador de Pedidos**: Tabla con filtros potentes:
    -   Buscador en tiempo real (OC, Cliente, Producto).
    -   Filtros por Estado (Pendiente, Terminado, Enviado).
    -   Filtro de Prioridad (⭐) para ver solo lo urgente.
-   **Edición Rápida**: Modificar detalles de un pedido existente.
-   **Acciones Masivas**: Seleccionar múltiples pedidos para borrarlos o cambiar su estado en lote.
-   **Exportación de Reportes**: Descargar Excel con el historial de pedidos filtrados.

### Configuración del Sistema
-   **Gestión de Equipo (Operarios)**: Altas, bajas y modificación de roles (Tapiceros, Auxiliares, etc.) y asignación de PINs de acceso.
-   **Catálogos**: Base de datos de Clientes y Productos para autocompletado.
-   **Exportación de Configuración**: Descarga masiva de la lista de operarios, clientes y productos en Excel.

---

## 2. 🏭 Módulo de Planta (`/planta`)
Herramienta para el jefe de producción y gestión del trabajo diario.

### Planificación y Asignación
-   **Importación del Plan (Matriz)**: Carga masiva de asignaciones desde Excel.
    -   Formato: Productos en filas, Operarios en columnas.
    -   **Asignación Inteligente (FIFO)**: El sistema busca automáticamente los pedidos *pendientes* más antiguos que coincidan con el producto y se los asigna al operario.
-   **Asignación Manual**: Interfaz táctil para asignar pedidos individuales a un operario específico.
-   **Exportación del Plan**: Genera un Excel con la matriz de producción del día (ideal para imprimir o reportes).

### Control de Progreso
-   **Vista de Operario**: Cada tarjeta de operario muestra su carga de trabajo.
    -   **Barra de Progreso**: Control visual de unidades completadas vs. objetivo.
    -   **Botones +/-**: Actualización rápida de unidades fabricadas.
-   **Estados Automáticos**: Cuando un pedido llega a su total, se marca automáticamente como `TERMINADO` y desaparece de la lista de pendientes global.

### Historial
-   **Calendario de Producción**: Visualización de fechas pasadas con actividad registrada.
-   **Consulta Histórica**: Navegación a cualquier día anterior para ver qué se produjo y quién lo hizo.
-   **Reportes Históricos**: Posibilidad de exportar el Excel de producción de cualquier fecha pasada.

---

## 3. 🚚 Módulo de Logística / Despacho (`/despacho`)
Diseñado para uso móvil en la zona de despachos.

### Escáner e Identificación
-   **Lector QR/Barras**: Uso de la cámara del dispositivo para leer OCs o Guías de Transporte.
-   **Identificación Inteligente**:
    -   Si escaneas una **OC**: El sistema busca el pedido y lo pre-selecciona.
    -   Si escaneas una **Guía**: El sistema la asocia al pedido seleccionado.

### Proceso de Despacho
-   **Despacho Individual**: Selección de pedido + Asignación de Transportadora + Número de Guía -> Marcar como `ENVIADO`.
-   **Despacho Masivo (Lotes)**:
    1.  Selecciona múltiples pedidos.
    2.  Escanea guía tras guía en secuencia rápida.
    3.  El sistema asigna y cierra los pedidos uno tras uno automáticamente.
-   **Validación**: Feedback visual y vibración para confirmar acciones exitosas o errores.

---

## 4. 🤓 Detalles Técnicos
-   **Base de Datos**: Supabase (PostgreSQL en tiempo real).
-   **Interfaz**: React + Tailwind CSS (Diseño "Mobile-First" limpio y táctil).
-   **Archivos**: Procesamiento de Excel 100% en el navegador (sin subir archivos al servidor para procesar), garantizando velocidad y seguridad.
