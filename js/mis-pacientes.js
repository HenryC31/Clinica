document.addEventListener('DOMContentLoaded', async () => {
    // Verificar Sesión y Rol
    const { data: { session } } = await db.auth.getSession();
    if (!session) { window.location.href = "login.html"; return; }

    const idUsuario = session.user.id;
    const { data: medico, error: errMedico } = await db.from('medicos').select('id').eq('id', idUsuario).single();
    if (errMedico || !medico) { window.location.href = "citas.html"; return; }

    // Cargar los pacientes
    cargarPacientesDelMedico(idUsuario);
});

async function cargarPacientesDelMedico(idMedico) {
    const contenedor = document.getElementById('grid-pacientes');

    // Buscamos todas las citas de este médico y nos traemos los datos del paciente
    const { data: citas, error } = await db.from('citas')
        .select(`
            pacientes (id, nombre, apellido, celular, edad, enfermedades, url_foto)
        `)
        .eq('id_medico', idMedico);

    if (error) {
        contenedor.innerHTML = '<p>Error al cargar los pacientes.</p>';
        return;
    }

    // Filtrar pacientes duplicados (si un paciente tiene 2 citas, solo mostramos 1 tarjeta)
    const pacientesUnicos = [];
    const idsVistos = new Set();

    citas.forEach(cita => {
        const p = cita.pacientes;
        if (p && !idsVistos.has(p.id)) {
            idsVistos.add(p.id);
            pacientesUnicos.push(p);
        }
    });

    renderizarPacientes(pacientesUnicos, contenedor);
}

function renderizarPacientes(pacientes, contenedor) {
    if (pacientes.length === 0) {
        contenedor.innerHTML = '<div class="empty-state">Aún no tienes pacientes registrados en tu historial.</div>';
        return;
    }

    contenedor.innerHTML = pacientes.map(p => {
        const foto = p.url_foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nombre + ' ' + p.apellido)}&background=e0f2f1&color=3bb3b6&size=128`;
        const edadText = p.edad ? `${p.edad} años` : 'Edad no registrada';
        const telText = p.celular ? p.celular : 'Sin número';
        const enfermedades = p.enfermedades ? p.enfermedades : 'Ninguna registrada';

        return `
        <div class="paciente-card">
            <img src="${foto}" alt="${p.nombre}" class="paciente-foto">
            <h3>${p.nombre} ${p.apellido}</h3>
            <div class="paciente-info">
                <p><i class="fa-solid fa-cake-candles"></i> ${edadText}</p>
                <p><i class="fa-solid fa-phone"></i> ${telText}</p>
            </div>
            <div class="paciente-expediente">
                <strong>Alergias/Enfermedades:</strong>
                <p>${enfermedades}</p>
            </div>
        </div>
        `;
    }).join('');
}

// Mantenemos la alerta por ahora solo para el botón de Reportes
window.moduloEnConstruccion = function(nombreModulo) {
    Swal.fire({ icon: 'info', title: 'Módulo en desarrollo', text: `La sección de "${nombreModulo}" será la siguiente fase a programar.`, confirmButtonColor: '#3bb3b6' });
};