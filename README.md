Gury Clínica - Sistema de Gestión Médica
------------------------------------------
¡Bienvenido al repositorio de Gury Clínica! Este es un sistema web integral de gestión y agendamiento de citas médicas diseñado con una arquitectura moderna, ligera y totalmente desacoplada. Desarrollado como proyecto final para la asignatura de Ingeniería de Software II en la Universidad Autónoma de Baja California Sur (UABCS).

Descripción del Proyecto
------------------------------------------
Gury Clínica optimiza la interacción entre pacientes y especialistas médicos a través de una plataforma ágil que elimina la necesidad de servidores de backend tradicionales, delegando toda la persistencia, el procesamiento relacional y la seguridad de identidades a un backend asíncrono en la nube.

La aplicación implementa flujos dinámicos que validan la disponibilidad de horarios en tiempo real, previniendo colisiones de citas, y ofrece tableros de control especializados para los dos actores del sistema: Pacientes y Médicos.

Credenciales de Acceso para Evaluación (Vista del Médico)
------------------------------------------
Para facilitar la revisión y evaluación por parte de los docentes sin necesidad de registrar datos desde cero, se ha configurado una cuenta de especialista médico con datos de prueba globales:

CURP de Acceso: MEDICO990731HDFLMN01

Contraseña: hola123

Nota sobre el sistema de Login: El sistema utiliza una máscara de autenticación basada en la CURP del usuario (añadiendo de forma interna un sufijo @clinica.com) para interactuar de manera transparente con el proveedor de identidades de Supabase Auth sin requerir correos electrónicos reales de los usuarios finales.

Arquitectura y Tecnologías Utilizadas
------------------------------------------
De acuerdo con el manual de estándares técnicos del proyecto, la estructura de código se mantiene puramente nativa para asegurar portabilidad y un rendimiento óptimo:

Frontend Estático: HTML5 semántico y CSS3 estructurado bajo la metodología estricta BEM (Block, Element, Modifier).

Lógica de Cliente: Vanilla JavaScript (ES6+) modularizado en controladores específicos por página (login.js, dashboard-medico.js, agendar.js, etc.) para evitar código espagueti.

Backend as a Service (BaaS): Supabase, potenciando la autenticación JWT y persistencia relacional directamente sobre una base de datos PostgreSQL.

Componentes de Terceros: SweetAlert2 (para alertas dinámicas) y FontAwesome (para el renderizado unificado de iconos).

Estructura del Proyecto
------------------------------------------
El código fuente se encuentra organizado de forma modular siguiendo principios de arquitectura limpia:

assets/ - Recursos estáticos (Logos, iconos, portadas).

css/ - Hojas de estilo unificadas y globales (global.css, login.css, etc.).

js/ - Controladores y lógica modular JavaScript.

supabase-config.js - Inicialización del cliente global de Supabase.

main.js - Lógica transcluyente (Header dinámico y sesiones).

login.js - Interceptor de credenciales y ruteo por roles.

dashboard-medico.js - Motor de renderizado de la agenda de especialistas.

pages/ - Vistas físicas HTML del ecosistema web.

login.html

registro.html

citas.html (Dashboard del Paciente)

dashboard-medico.html (Dashboard del Médico)

Inicialización Local
------------------------------------------
Al utilizar módulos nativos de JavaScript e interactuar asíncronamente con APIs en la nube, las políticas de seguridad de los navegadores modernos impiden abrir los archivos directamente desde el explorador de archivos de tu computadora. Se requiere un servidor web local para su correcto funcionamiento.

Pasos para iniciar en Visual Studio Code:

Asegúrate de tener instalada la extensión Live Server (de Ritwick Dey).

Abre la carpeta raíz del proyecto en tu espacio de trabajo.

Selecciona el archivo pages/login.html o el índice principal.

Haz clic en el botón "Go Live" ubicado en la esquina inferior derecha de la barra de estado de VS Code.

El navegador se abrirá de manera automática en la dirección local (por ejemplo, http://127.0.0.1:5500/) con la función de recarga en caliente activa.

------------------------------------------

Desarrollado por Henry Castro Bustillos - Estudiante de Ingeniería en Desarrollo de Software (UABCS).