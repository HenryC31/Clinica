// js/main.js
async function cargarComponentes() {
    const headerContainer = document.querySelector('#header-placeholder');
    if (!headerContainer) return;

    const ruta = '/app/components/header.html';

    try {
        const resp = await fetch(ruta);
        if (resp.ok) {
            headerContainer.innerHTML = await resp.text();
            actualizarMenu(); 
        }
    } catch (error) {
        console.error('Error cargando el header:', error);
    }
}

// CARGAR SIDEBAR DEL MÉDICO
async function cargarSidebarMedico() {
    const sidebarContainer = document.querySelector('#sidebar-placeholder');
    if (!sidebarContainer) return;

    try {
        const resp = await fetch('/app/components/sidebar-medico.html');
        if (resp.ok) {
            sidebarContainer.innerHTML = await resp.text();
            
            // Lógica para marcar la pestaña activa según la URL actual
            const path = window.location.pathname;
            if (path.includes('dashboard-medico') || path.includes('atender-consulta')) {
                document.getElementById('link-agenda')?.classList.add('sidebar__link--active');
            } else if (path.includes('mis-pacientes')) {
                document.getElementById('link-pacientes')?.classList.add('sidebar__link--active');
            } else if (path.includes('reportes')) { // <-- ¡AGREGA ESTAS DOS LÍNEAS!
                document.getElementById('link-reportes')?.classList.add('sidebar__link--active');
            }

            // Lógica global del botón Cerrar Sesión
            const btnLogout = document.getElementById('btn-logout-medico');
            if (btnLogout) {
                btnLogout.addEventListener('click', async (e) => {
                    e.preventDefault();
                    Swal.fire({
                        title: 'Cerrando sesión...',
                        text: 'Guardando todo de forma segura. ¡Hasta pronto!',
                        icon: 'info',
                        timer: 1200,
                        showConfirmButton: false
                    }).then(async () => {
                        await db.auth.signOut();
                        window.location.href = "../index.html";
                    });
                });
            }
        }
    } catch (error) {
        console.error('Error cargando el sidebar:', error);
    }
}

async function actualizarMenu() {
    const { data: { session } } = await db.auth.getSession();
    const authSection = document.querySelector('#auth-section');
    
    if (session && authSection) {
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

        document.getElementById('user-avatar').onclick = () => {
            const dd = document.getElementById('user-dropdown');
            dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
        };

        document.getElementById('btn-logout').onclick = async () => {
            await db.auth.signOut();
            window.location.href = "../index.html";
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarComponentes();
    cargarSidebarMedico();
});