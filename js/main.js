const supabaseUrl = 'https://iulzunkiitwtfgunrksp.supabase.co';
const supabaseKey = 'sb_publishable_qcBnyugEpcb-nYEm7iIVDA_f1W-POlh'; 
const db = supabase.createClient(supabaseUrl, supabaseKey);

// 1. CARGAR COMPONENTES
async function cargarComponentes() {
    const headerContainer = document.querySelector('#header-placeholder');
    if (!headerContainer) return;

    // Usamos una ruta absoluta respecto a la raíz del servidor de Vercel
    const ruta = '/app/components/header.html';

    try {
        const resp = await fetch(ruta);
        if (resp.ok) {
            headerContainer.innerHTML = await resp.text();
            actualizarMenu(); // Lógica para el botón de login/perfil
        }
    } catch (error) {
        console.error('Error cargando el header:', error);
    }
}

// 2. CONTROL DE SESIÓN
async function actualizarMenu() {
    const { data: { session } } = await db.auth.getSession();
    const authSection = document.querySelector('#auth-section');
    
    if (session && authSection) {
        // Obtenemos datos del paciente para la foto/nombre
        const { data: paciente } = await db.from('pacientes').select('*').eq('id', session.user.id).single();
        
        const fotoUrl = paciente?.url_foto || `https://ui-avatars.com/api/?name=${paciente?.nombre}&background=3bb3b6&color=fff`;

        authSection.innerHTML = `
            <div class="user-menu-container" style="position: relative; display: inline-block;">
                <img src="${fotoUrl}" id="user-avatar" class="avatar-nav" style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2px solid #3bb3b6;">
                <div id="user-dropdown" class="dropdown-content" style="display: none; position: absolute; right: 0; background: white; box-shadow: 0 8px 16px rgba(0,0,0,0.1); border-radius: 8px; z-index: 100; min-width: 150px; padding: 10px;">
                    <a href="/pages/perfil.html" style="display: block; padding: 8px; color: #333; text-decoration: none;">Editar Perfil</a>
                    <hr>
                    <a href="#" id="btn-logout" style="display: block; padding: 8px; color: red; text-decoration: none;">Cerrar Sesión</a>
                </div>
            </div>
        `;

        // Lógica para abrir/cerrar dropdown
        document.getElementById('user-avatar').onclick = () => {
            const dd = document.getElementById('user-dropdown');
            dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
        };

        document.getElementById('btn-logout').onclick = async () => {
            await db.auth.signOut();
            window.location.href = "index.html";
        };
    }
}

// 3. REGISTRO (CON VALIDACIONES Y SWEETALERT)
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
    }).then(() => { window.location.href = "index.html"; });
}

// 4. LOGIN DINÁMICO (CON SWEETALERT)
async function iniciarSesion() {
    const curpInput = document.getElementById('login-curp');
    const passInput = document.getElementById('login-pass');

    if (!curpInput || !passInput) return;

    const curp = curpInput.value.trim().toUpperCase();
    const pass = passInput.value;
    const email = curp + "@clinica.com"; // Reconstruimos el correo falso

    // Intentamos entrar
    const { data, error } = await db.auth.signInWithPassword({
        email: email,
        password: pass
    });

    if (error) { 
        Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'La CURP o la contraseña no coinciden.',
            confirmButtonColor: '#3bb3b6'
        });
        return; 
    }
    
    // Si todo sale bien
    Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Entrando al sistema...',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        window.location.href = "citas.html";
    });
}

// 5. OBTENER MÉDICOS
async function cargarMedicos() {
    const container = document.getElementById('lista-medicos');
    if (!container) return;

    const { data: medicos, error } = await db.from('medicos').select('*');
    
    if (medicos) {
        container.innerHTML = medicos.map(m => {
            const foto = m.url_foto ? m.url_foto : `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nombre)}&background=e0f2f1&color=3bb3b6&size=128`;
            const sobreMi = m.sobre_mi ? `<p style="font-size: 13px; color: #555; font-style: italic; margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">"${m.sobre_mi}"</p>` : '';

            return `
            <div class="card-medico">
                <img src="${foto}" alt="${m.nombre}" class="foto-medico">
                <h3>${m.nombre}</h3>
                <p class="especialidad">${m.especialidad}</p>
                <p class="descripcion">${m.descripcion}</p>
                ${sobreMi}
            </div>`;
        }).join('');
    }
}

// 6. AGENDAR CITA (CON SWEETALERT Y VALIDACIÓN)
async function agendarCita() {
    const idMedico = document.getElementById('agenda-medico').value;
    const fecha = document.getElementById('agenda-fecha').value;
    const hora = document.getElementById('agenda-hora').value;

    const { data: sessionData } = await db.auth.getSession();
    if (!sessionData.session) {
        Swal.fire({ icon: 'info', title: 'Sesión requerida', text: 'Inicia sesión para agendar.' })
            .then(() => { window.location.href = "login.html"; });
        return;
    }

    if (!idMedico || !fecha || !hora) {
        Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Por favor, completa el formulario.' });
        return;
    }

    const { data: citasExistentes } = await db.from('citas')
        .select('id').eq('id_medico', idMedico).eq('fecha', fecha).eq('hora', hora);

    if (citasExistentes && citasExistentes.length > 0) {
        Swal.fire({ icon: 'error', title: 'Horario ocupado', text: 'Este médico ya tiene una cita a esa hora.' });
        return;
    }

    const idPaciente = sessionData.session.user.id;
    const { error } = await db.from('citas').insert([{ id_paciente: idPaciente, id_medico: idMedico, fecha: fecha, hora: hora }]);

    if (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } else {
        Swal.fire({ icon: 'success', title: '¡Listo!', text: 'Tu cita ha sido agendada.', confirmButtonColor: '#3bb3b6' })
            .then(() => { window.location.href = "citas.html"; });
    }
    const mensaje = `Hola, acabo de agendar una cita para el día ${fecha} a las ${hora}.`;
    window.location.href = `mailto:contacto@clinicagury.com?subject=Confirmacion de Cita&body=${encodeURIComponent(mensaje)}`;
}

// 7. CARGAR MIS CITAS
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

async function guardarPerfil() {
    const { data: { session } } = await db.auth.getSession();
    
    const edad = document.getElementById('perf-edad').value;
    const enfermedades = document.getElementById('perf-enfermedades').value;
    const url_foto = document.getElementById('perf-foto').value.trim();
    const celular = document.getElementById('perf-tel').value.trim();
    const email_contacto = document.getElementById('perf-email')?.value.trim(); // Nuevo campo

    // Validación de teléfono (solo números)
    if (celular && !/^\d+$/.test(celular)) {
        Swal.fire('Error', 'El teléfono solo debe contener números', 'warning');
        return;
    }

    // Si la foto está vacía, no mandamos la propiedad o la mandamos como null
    const updates = {
        edad: edad || null,
        enfermedades: enfermedades || null,
        url_foto: url_foto || null, 
        celular: celular || null,
        email: email_contacto || null
    };

    const { error } = await db.from('pacientes').update(updates).eq('id', session.user.id);

    if (error) {
        Swal.fire('Error', error.message, 'error');
    } else {
        Swal.fire('¡Éxito!', 'Perfil actualizado correctamente', 'success');
    }
}

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

// Y la agregamos al inicio
document.addEventListener('DOMContentLoaded', () => {
    cargarComponentes();
    if (window.location.pathname.includes('perfil.html')) cargarDatosPerfil();
});

// Inicialización global
document.addEventListener('DOMContentLoaded', () => {
    cargarComponentes();
    cargarMedicos();
    if (document.getElementById('lista-citas')) cargarMisCitas();
    const btnRegistrar = document.getElementById('btn-registrar');
    if (btnRegistrar) {
        btnRegistrar.onclick = registrarPaciente;
    }

    // Conectar el botón de login si existe en la página
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        btnLogin.onclick = iniciarSesion;
    }
});