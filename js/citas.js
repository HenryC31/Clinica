async function cargarMisCitas() {
    const container = document.getElementById('lista-citas');
    const btnAgendar = document.querySelector('.btn-agendar-nueva');
    if (!container) return;

    const { data: sessionData } = await db.auth.getSession();
    
    if (!sessionData.session) {
        container.innerHTML = '<p class="empty-state">Inicia sesión para ver tus citas.</p>';
        if(btnAgendar) {
            btnAgendar.textContent = "Iniciar Sesión";
            btnAgendar.onclick = () => window.location.href = 'login.html';
        }
        return;
    }

    if(btnAgendar) {
        btnAgendar.textContent = "Agendar una cita";
        btnAgendar.onclick = () => window.location.href = 'agendar.html';
    }

    const idPaciente = sessionData.session.user.id;
    const { data: misCitas } = await db.from('citas').select('*, medicos(nombre, especialidad)')
        .eq('id_paciente', idPaciente).order('fecha', { ascending: true });

    if (misCitas && misCitas.length > 0) {
        container.innerHTML = misCitas.map(c => `
            <div class="cita-card">
                <div style="text-align: left;">
                    <strong>${c.fecha} - ${c.hora}</strong><br>
                    <span style="font-size: 13px; color: #666;">Dr. ${c.medicos.nombre} (${c.medicos.especialidad})</span>
                </div>
                <span style="color: #3bb3b6; font-weight: bold;">${c.estado}</span>
            </div>`).join('');
    } else {
        container.innerHTML = '<p class="empty-state">¡Aún no tienes citas agendadas!</p>';
    }
}

document.addEventListener('DOMContentLoaded', cargarMisCitas);