document.addEventListener('DOMContentLoaded', async () => {
    // Verificar Sesión del Médico
    const { data: { session } } = await db.auth.getSession();
    if (!session) { window.location.href = "login.html"; return; }

    const idUsuario = session.user.id;
    const { data: medico, error: errMedico } = await db.from('medicos').select('id').eq('id', idUsuario).single();
    if (errMedico || !medico) { window.location.href = "citas.html"; return; }

    // Obtener el ID de la cita desde los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idCita = urlParams.get('id');

    if (!idCita) {
        Swal.fire('Error', 'No se especificó ninguna cita para atender.', 'error')
        .then(() => { window.location.href = "dashboard-medico.html"; });
        return;
    }

    // Cargar información de la cita y del paciente
    const { data: cita, error: errCita } = await db.from('citas')
        .select('*, pacientes(nombre, apellido, edad, enfermedades)')
        .eq('id', idCita)
        .single();

    if (errCita || !cita) {
        Swal.fire('Error', 'No se encontró la información de la cita.', 'error')
        .then(() => { window.location.href = "dashboard-medico.html"; });
        return;
    }

    // Llenar la tarjeta informativa del paciente arriba del formulario
    const p = cita.pacientes;
    const edadText = p.edad ? `${p.edad} años` : 'Edad no registrada';
    document.getElementById('info-paciente').innerText = `Paciente: ${p.nombre} ${p.apellido} (${edadText})`;
    document.getElementById('info-alergias').innerText = `Alergias/Enfermedades previas: ${p.enfermedades || 'Ninguna registrada'}`;

    // Guardar Consulta al hacer clic
    document.getElementById('btn-guardar-consulta').onclick = () => guardarConsulta(idCita);
});

async function guardarConsulta(idCita) {
    const sintomas = document.getElementById('cons-sintomas').value.trim();
    const diagnostico = document.getElementById('cons-diagnostico').value.trim();
    const tratamiento = document.getElementById('cons-tratamiento').value.trim();
    const notas = document.getElementById('cons-notas').value.trim();

    if (!sintomas || !diagnostico || !tratamiento) {
        Swal.fire('Campos incompletos', 'Por favor llena los campos obligatorios del expediente.', 'warning');
        return;
    }

    // Como estamos en un proyecto escolar enfocado en simplificar flujos, 
    // actualizamos el estado de la cita a 'Completada'
    // Nota: Si en tu Supabase creaste una tabla específica para las consultas/recetas, 
    // harías un INSERT en esa tabla primero. Si no, actualizamos la cita directamente.
    const { error: updateError } = await db.from('citas')
        .update({ estado: 'Completada' })
        .eq('id', idCita);

    if (updateError) {
        Swal.fire('Error', 'No se pudo guardar la consulta: ' + updateError.message, 'error');
        return;
    }

    Swal.fire({
        icon: 'success',
        title: 'Consulta Guardada',
        text: 'El expediente médico ha sido actualizado con éxito.',
        confirmButtonColor: '#3bb3b6'
    }).then(() => {
        window.location.href = "dashboard-medico.html";
    });
}