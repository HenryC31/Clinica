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

document.addEventListener('DOMContentLoaded', cargarMedicos);