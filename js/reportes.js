document.addEventListener('DOMContentLoaded', async () => {
    // 1. Validar sesión
    const { data: { session } } = await db.auth.getSession();
    if (!session) { window.location.href = "login.html"; return; }

    const idUsuario = session.user.id;
    const { data: medico, error: errMedico } = await db.from('medicos').select('id').eq('id', idUsuario).single();
    if (errMedico || !medico) { window.location.href = "citas.html"; return; }

    // 2. Cargar los datos
    cargarEstadisticas(idUsuario);
});

async function cargarEstadisticas(idMedico) {
    // Nos traemos TODAS las citas de este médico
    const { data: citas, error } = await db.from('citas')
        .select('estado')
        .eq('id_medico', idMedico);

    if (error) {
        console.error("Error al cargar estadísticas:", error.message);
        return;
    }


    const total = citas.length;
    const completadas = citas.filter(c => c.estado === 'Completada').length;
    const pendientes = citas.filter(c => c.estado === 'Pendiente').length;


    document.getElementById('rep-total').innerText = total;
    document.getElementById('rep-completadas').innerText = completadas;
    document.getElementById('rep-pendientes').innerText = pendientes;

    // Dibujamos la gráfica
    renderizarGrafica(completadas, pendientes);
}

function renderizarGrafica(completadas, pendientes) {
    const ctx = document.getElementById('graficaEstados').getContext('2d');
    
    if (window.miGrafica) {
        window.miGrafica.destroy();
    }

    window.miGrafica = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completadas', 'Pendientes'],
            datasets: [{
                data: [completadas, pendientes],
                backgroundColor: [
                    '#11caa0', // Turquesa Gury para Completadas
                    '#f39c12'  // Naranja para Pendientes
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { family: 'Inter', size: 14 } }
                }
            }
        }
    });
}