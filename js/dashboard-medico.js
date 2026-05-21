document.addEventListener('DOMContentLoaded', async () => {
    // Verificar Sesión
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
        window.location.href = "login.html";
        return;
    }

    const idUsuario = session.user.id;

    // Verificar que sí sea Médico y obtener su nombre
    const { data: medico, error: errMedico } = await db.from('medicos')
        .select('nombre')
        .eq('id', idUsuario)
        .single();
    
    if (errMedico || !medico) {
        // Si trata de entrar un paciente aquí por error, lo regresamos a su vista
        window.location.href = "citas.html";
        return;
    }

    // Ponemos el nombre en el Header
    document.getElementById('nombreMedico').innerText = medico.nombre;

    // Llamamos a la función que ahora carga TODAS las citas
    cargarAgenda(idUsuario);
});

async function cargarAgenda(idMedico) {
    const { data: citas, error } = await db.from('citas')
        .select(`
            id,
            fecha,
            hora,
            estado,
            pacientes (nombre, apellido)
        `)
        .eq('id_medico', idMedico)
        .order('fecha', { ascending: true }) 
        .order('hora', { ascending: true }); 

    if (error) {
        console.error("Error al cargar agenda:", error.message);
        document.getElementById('tablaCitasBody').innerHTML = '<tr><td colspan="5">Error al cargar citas.</td></tr>';
        return;
    }

    renderizarMetricas(citas);
    renderizarTabla(citas);
}

function renderizarMetricas(citas) {
    const total = citas.length;
    const atendidas = citas.filter(c => c.estado === 'Completada').length; 
    const pendientes = total - atendidas;

    document.getElementById('totalCitas').innerText = total;
    document.getElementById('citasAtendidas').innerText = atendidas;
    document.getElementById('citasPendientes').innerText = pendientes;
}

function renderizarTabla(citas) {
    const tbody = document.getElementById('tablaCitasBody');
    
    if (citas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="table-empty" style="text-align:center; padding: 20px;">Tu agenda está completamente libre.</td></tr>';
        return;
    }

    tbody.innerHTML = citas.map(c => {
        const estaCompletada = c.estado === 'Completada';
        const badgeColor = estaCompletada ? 'color: green; font-weight: bold;' : 'color: orange; font-weight: bold;';
        
        return `
        <tr>
            <td style="font-weight: bold;">
                ${c.fecha} <br>
                <span style="font-size: 0.85em; color: gray;">${c.hora}</span>
            </td>
            <td>${c.pacientes.nombre} ${c.pacientes.apellido}</td>
            <td>Consulta General</td>
            <td style="${badgeColor}">${c.estado}</td>
            <td>
                <button 
                    class="btn-atender" 
                    onclick="atenderPaciente('${c.id}')" 
                    ${estaCompletada ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : 'style="background-color: #11caa0; color: white; padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer;"'}
                >
                    <i class="fa-solid fa-stethoscope"></i> Atender
                </button>
            </td>
        </tr>
    `}).join('');
}

window.atenderPaciente = function(idCita) {
    window.location.href = `atender-consulta.html?id=${idCita}`;
};