// 1. CARGAR MÉDICOS AL INICIAR LA PÁGINA
document.addEventListener('DOMContentLoaded', async () => {  
    // El cadenero: Checamos sesión
    const { data: sessionData } = await db.auth.getSession();
    
    if (!sessionData.session) {
        Swal.fire({
            icon: 'info',
            title: 'Sesión requerida',
            text: 'Para agendar una cita, primero necesitas iniciar sesión.',
            confirmButtonColor: '#3bb3b6'
        }).then(() => {
            window.location.href = "login.html"; 
        });
        return; 
    }

    // Si hay sesión, cargamos los médicos en el <select>
    const select = document.getElementById('agenda-medico');  
    if(!select) return;  
    
    const { data, error } = await db.from('medicos').select('*');  
    
    if(data) {  
        select.innerHTML = '<option value="">Selecciona un médico</option>' +   
            data.map(m => `<option value="${m.id}">Dr. ${m.nombre} - ${m.especialidad}</option>`).join('');  
    } else if (error) {
        console.error("Error al cargar médicos: ", error.message);
    }
});

// 2. FUNCIÓN PARA AGENDAR LA CITA (Se ejecuta al darle clic al botón)
async function agendarCita() {
    const idMedico = document.getElementById('agenda-medico').value;
    const fecha = document.getElementById('agenda-fecha').value;
    const hora = document.getElementById('agenda-hora').value;

    const { data: sessionData } = await db.auth.getSession();
    if (!sessionData.session) {
        window.location.href = "login.html";
        return;
    }

    if (!idMedico || !fecha || !hora) {
        Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Por favor, completa el formulario.' });
        return;
    }

    // Validar que el doctor no tenga cita a esa hora
    const { data: citasExistentes } = await db.from('citas')
        .select('id').eq('id_medico', idMedico).eq('fecha', fecha).eq('hora', hora);

    if (citasExistentes && citasExistentes.length > 0) {
        Swal.fire({ icon: 'error', title: 'Horario ocupado', text: 'Este médico ya tiene una cita a esa hora.' });
        return;
    }

    // Insertar la cita
    const idPaciente = sessionData.session.user.id;
    const { error } = await db.from('citas').insert([{ 
        id_paciente: idPaciente, 
        id_medico: idMedico, 
        fecha: fecha, 
        hora: hora,
        estado: 'Pendiente' // Aseguramos que entre como Pendiente
    }]);

    if (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } else {
        Swal.fire({ icon: 'success', title: '¡Listo!', text: 'Tu cita ha sido agendada.', confirmButtonColor: '#3bb3b6' })
            .then(() => { 
                const mensaje = `Hola, acabo de agendar una cita para el día ${fecha} a las ${hora}.`;
                window.location.href = `mailto:contacto@clinicagury.com?subject=Confirmacion de Cita&body=${encodeURIComponent(mensaje)}`;
                setTimeout(() => window.location.href = "citas.html", 500); 
            });
    }
}