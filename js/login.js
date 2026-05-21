async function iniciarSesion() {
    const curpInput = document.getElementById('login-curp');
    const passInput = document.getElementById('login-pass');
    if (!curpInput || !passInput) return;

    const curp = curpInput.value.trim().toUpperCase();
    const pass = passInput.value;
    const email = curp + "@clinica.com"; 

    // Iniciamos sesión
    const { data, error } = await db.auth.signInWithPassword({ email: email, password: pass });

    if (error) { 
        Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'La CURP o la contraseña no coinciden.', confirmButtonColor: '#3bb3b6' });
        return; 
    }
    
    // VERIFICACIÓN DE ROL
    const idUsuario = data.session.user.id;
    const { data: esMedico } = await db.from('medicos').select('id').eq('id', idUsuario).single();

    Swal.fire({ icon: 'success', title: '¡Bienvenido!', text: 'Entrando al sistema...', timer: 1500, showConfirmButton: false })
    .then(() => { 
        // 3. Redirección condicional
        if (esMedico) {
            window.location.href = "dashboard-medico.html"; // Vista Doctor
        } else {
            window.location.href = "citas.html";            // Vista Paciente
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) btnLogin.onclick = iniciarSesion;
});