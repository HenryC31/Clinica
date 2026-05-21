async function registrarPaciente() {
    const nombre = document.getElementById('reg-nombre').value.trim();
    const apellido = document.getElementById('reg-apellido').value.trim();
    const curp = document.getElementById('reg-curp').value.trim().toUpperCase();
    const celular = document.getElementById('reg-celular').value.trim();
    const password = document.getElementById('reg-password').value;

    if(!nombre || !apellido || !curp || !password) {
        Swal.fire({ icon: 'error', title: 'Campos incompletos', text: 'Por favor, llena los campos obligatorios.' });
        return;
    }

    const curpRegex = /^[A-Z0-9]{18}$/;
    if (!curpRegex.test(curp)) {
        Swal.fire({ icon: 'warning', title: 'CURP Inválida', text: 'La CURP debe tener 18 caracteres.' });
        return;
    }

    const fakeEmail = curp + "@clinica.com";

    const { data: authData, error: authError } = await db.auth.signUp({
        email: fakeEmail,
        password: password
    });

    if (authError) {
        Swal.fire({ icon: 'error', title: 'Error', text: authError.message });
        return;
    }

    const userId = authData.user.id;
    const { error: dbError } = await db.from('pacientes').insert([
        { id: userId, nombre: nombre, apellido: apellido, curp: curp, celular: celular }
    ]);

    if (dbError) {
        Swal.fire({ icon: 'error', title: 'Error', text: dbError.message });
        return;
    }

    Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'Ya puedes iniciar sesión.',
        confirmButtonColor: '#3bb3b6'
    }).then(() => { window.location.href = "../pages/login.html"; });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnRegistrar = document.getElementById('btn-registrar');
    if (btnRegistrar) btnRegistrar.onclick = registrarPaciente;
});