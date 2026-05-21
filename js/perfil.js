async function cargarDatosPerfil() {
    const { data: { session } } = await db.auth.getSession();
    if (!session) return;

    const { data: paciente } = await db.from('pacientes').select('*').eq('id', session.user.id).single();

    if (paciente) {
        if(document.getElementById('perf-edad')) document.getElementById('perf-edad').value = paciente.edad || '';
        if(document.getElementById('perf-enfermedades')) document.getElementById('perf-enfermedades').value = paciente.enfermedades || '';
        if(document.getElementById('perf-foto')) document.getElementById('perf-foto').value = paciente.url_foto || '';
        if(document.getElementById('perf-tel')) document.getElementById('perf-tel').value = paciente.celular || '';
    }
}

async function guardarPerfil() {
    const { data: { session } } = await db.auth.getSession();
    
    const edad = document.getElementById('perf-edad').value;
    const enfermedades = document.getElementById('perf-enfermedades').value;
    const url_foto = document.getElementById('perf-foto').value.trim();
    const celular = document.getElementById('perf-tel').value.trim();

    if (celular && !/^\d+$/.test(celular)) {
        Swal.fire('Error', 'El teléfono solo debe contener números', 'warning');
        return;
    }

    const updates = {
        edad: edad || null,
        enfermedades: enfermedades || null,
        url_foto: url_foto || null, 
        celular: celular || null
    };

    const { error } = await db.from('pacientes').update(updates).eq('id', session.user.id);

    if (error) {
        Swal.fire('Error', error.message, 'error');
    } else {
        Swal.fire('¡Éxito!', 'Perfil actualizado correctamente', 'success');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosPerfil();
    const btnGuardar = document.getElementById('btn-guardar-perfil');
    if (btnGuardar) btnGuardar.onclick = guardarPerfil;
});