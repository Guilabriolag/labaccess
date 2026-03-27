/* ============================================================
   LabAccess · Sistema de Controle de Acesso · Versão Gratuita
   labaccess.js — Lógica da aplicação
   ============================================================ */

// ── Estado Global ─────────────────────────────────────────
let selectedColor = '#3b82f6';
let selectedQty   = 60;
let selectedPrice = 79;
let isPaid        = false;
let qrGenerated   = false;
let currentQRContent = '';

// ── Paleta de cores disponíveis ───────────────────────────
const COLOR_SWATCHES = [
    { hex: '#f59e0b', id: 'color-f59e0b' },
    { hex: '#3b82f6', id: 'color-3b82f6' },
    { hex: '#ef4444', id: 'color-ef4444' },
    { hex: '#10b981', id: 'color-10b981' },
    { hex: '#8b5cf6', id: 'color-8b5cf6' },
];

// ── Cor do crachá ─────────────────────────────────────────
function setColor(color) {
    selectedColor = color;
    document.getElementById('crachá').style.setProperty('--accent', color);

    document.querySelectorAll('.color-swatch').forEach(el => {
        el.classList.toggle('active', el.dataset.color === color);
    });
}

// ── Preview em tempo real ──────────────────────────────────
function updatePreview() {
    const get     = id => document.getElementById(id);
    const checked = id => get(id).checked;
    const val     = id => get(id).value;

    // Visibilidade de campos
    const showNome        = checked('show_nome');
    const showEmpresa     = checked('show_empresa');
    const showCargo       = checked('show_cargo');
    const showMatricula   = checked('show_matricula');
    const showDepartamento= checked('show_departamento');
    const showPerfil      = checked('show_perfil');
    const showValidade    = checked('show_validade');
    const showFoto        = checked('show_foto');
    const showSite        = checked('show_site');
    const showLinkedin    = checked('show_linkedin');
    const showInstagram   = checked('show_instagram');
    const showWhatsapp    = checked('show_whatsapp');
    const showEmail       = checked('show_email');

    // Valores dos campos
    const nome         = val('nome')         || '—';
    const empresa      = val('empresa')      || '—';
    const cargo        = val('cargo')        || '—';
    const matricula    = val('matricula')    || '—';
    const departamento = val('departamento') || '—';
    const perfil       = val('perfil');
    const validade     = val('validade');
    const fotoUrl      = val('foto_url');
    const site         = val('site');
    const linkedin     = val('linkedin');
    const instagram    = val('instagram');
    const whatsapp     = val('whatsapp');
    const email        = val('email');

    // Atualiza textos do crachá
    get('previewNome').innerText    = showNome    ? nome    : '••••••••';
    get('previewEmpresa').innerText = showEmpresa ? empresa : '••••';
    get('previewCargo').innerText   = showCargo   ? cargo   : '';

    // Detalhes (matrícula, depto, perfil)
    const detailsContainer = get('detailsContainer');
    detailsContainer.innerHTML = '';
    const details = [];
    if (showMatricula)    details.push({ label: 'ID',     value: matricula });
    if (showDepartamento) details.push({ label: 'Depto',  value: departamento });
    if (showPerfil)       details.push({ label: 'Perfil', value: perfil });

    details.forEach(d => {
        const div = document.createElement('div');
        div.className = 'detail-item';
        div.innerHTML = `<div class="detail-label">${d.label}</div><div class="detail-value">${d.value}</div>`;
        detailsContainer.appendChild(div);
    });

    // Links sociais
    const socialContainer = get('socialContainer');
    socialContainer.innerHTML = '';
    const socials = [];
    if (showSite      && site)      socials.push({ icon: '🌐', url: site,                                               label: 'Site'      });
    if (showLinkedin  && linkedin)  socials.push({ icon: '💼', url: linkedin,                                           label: 'LinkedIn'  });
    if (showInstagram && instagram) socials.push({ icon: '📷', url: `https://instagram.com/${instagram.replace('@','')}`, label: 'Instagram' });
    if (showWhatsapp  && whatsapp)  socials.push({ icon: '📱', url: `https://wa.me/55${whatsapp.replace(/\D/g,'')}`,   label: 'WhatsApp'  });
    if (showEmail     && email)     socials.push({ icon: '✉️', url: `mailto:${email}`,                                 label: 'Email'     });

    socials.forEach(s => {
        const a = document.createElement('a');
        a.href      = s.url;
        a.target    = '_blank';
        a.className = 'social-link';
        a.innerHTML = `${s.icon} ${s.label}`;
        socialContainer.appendChild(a);
    });

    // Validade
    const dataFormatada = validade
        ? new Date(validade).toLocaleDateString('pt-BR')
        : '--/--/----';
    get('previewValidade').innerText = showValidade ? dataFormatada : '••••••';

    // Foto
    const fotoElement = document.querySelector('.crachá-photo');
    const header = document.querySelector('.crachá-header');
    if (showFoto && fotoUrl && !fotoElement) {
        const img = document.createElement('img');
        img.className = 'crachá-photo';
        img.src = fotoUrl;
        header.appendChild(img);
    } else if (fotoElement && (!showFoto || !fotoUrl)) {
        fotoElement.remove();
    } else if (fotoElement && showFoto && fotoUrl) {
        fotoElement.src = fotoUrl;
    }
}

// ── Geração do QR Code ────────────────────────────────────
function generateQRCode(text, canvasId) {
    return new Promise((resolve, reject) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) { reject(new Error('Canvas não encontrado')); return; }

        canvas.width  = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(text)}`;
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
        };
        img.onerror = () => reject(new Error('Erro ao gerar QR Code'));
        img.src = qrUrl;
    });
}

// ── Conteúdo do QR ────────────────────────────────────────
function generateQRContent() {
    const val = id => document.getElementById(id).value;
    const data = {
        tipo:        'labaccess_free_v1',
        id:          Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        empresa:     val('empresa')     || 'Empresa',
        nome:        val('nome')        || 'Colaborador',
        cargo:       val('cargo')       || 'Cargo',
        matricula:   val('matricula')   || 'ID',
        departamento:val('departamento')|| 'Depto',
        perfil:      val('perfil'),
        validade:    val('validade'),
        site:        val('site'),
        linkedin:    val('linkedin'),
        instagram:   val('instagram'),
        whatsapp:    val('whatsapp'),
        email:       val('email'),
        observacoes: val('observacoes'),
        timestamp:   new Date().toISOString(),
        free_version: true
    };

    // Checksum simples
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    data.checksum = Math.abs(hash).toString(36);
    return JSON.stringify(data);
}

// ── Gerar crachá ──────────────────────────────────────────
async function generateBadge() {
    const content     = generateQRContent();
    currentQRContent  = content;

    const placeholder = document.getElementById('qrPlaceholder');
    const canvas      = document.getElementById('qrCanvas');

    placeholder.style.display = 'flex';
    canvas.style.display      = 'none';

    try {
        await generateQRCode(content, 'qrCanvas');
        placeholder.style.display = 'none';
        canvas.style.display      = 'block';
        qrGenerated = true;

        const paymentBtn = document.getElementById('paymentBtn');
        paymentBtn.disabled   = false;
        paymentBtn.innerText  = `💳 SIMULAR PAGAMENTO R$ ${selectedPrice},00`;

        showToast('✅ QR Code gerado! Agora simule o pagamento.', 'success');
    } catch (e) {
        console.error('Erro ao gerar QR:', e);
        showToast('Erro ao gerar QR Code. Tente novamente.', 'error');
    }
}

// ── Pagamento / Modal ─────────────────────────────────────
function handlePayment() {
    if (!qrGenerated) {
        showToast('⚠️ Gere o QR Code primeiro!', 'warning');
        return;
    }
    openModal();
}

function openModal() {
    const modal = document.getElementById('paymentModal');
    document.getElementById('modalTotal').innerText = `R$ ${selectedPrice},00`;

    const qrDiv = document.getElementById('modalQr');
    qrDiv.innerHTML = '';

    const pixString = `00020126580014br.gov.bcb.pix0136contato@labriolag.com.br5204000053039865404${selectedPrice * 100}5802BR5925Labriolag Holding6009SAO PAULO62260522LabAccess_${Date.now()}6304`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(pixString)}`;

    const img = document.createElement('img');
    img.src = qrUrl;
    img.style.cssText = 'width:160px;height:160px;';
    qrDiv.appendChild(img);

    modal.classList.add('open');
}

function closeModal() {
    document.getElementById('paymentModal').classList.remove('open');
}

function simulatePayment() {
    isPaid = true;
    closeModal();
    downloadBadge();

    // Salva registro local
    const venda = {
        data:        new Date().toISOString(),
        empresa:     document.getElementById('empresa').value,
        quantidade:  selectedQty,
        total:       selectedPrice,
        colaborador: document.getElementById('nome').value,
        free_version: true
    };
    const vendas = JSON.parse(localStorage.getItem('labaccess_vendas') || '[]');
    vendas.unshift(venda);
    localStorage.setItem('labaccess_vendas', JSON.stringify(vendas.slice(0, 50)));
}

// ── Download do crachá ────────────────────────────────────
async function downloadBadge() {
    if (!isPaid) {
        showToast('⚠️ Simule o pagamento primeiro!', 'warning');
        return;
    }

    const crachaElement = document.getElementById('crachá');
    try {
        showToast('📸 Gerando imagem...', 'info');
        const canvas = await html2canvas(crachaElement, {
            scale: 3,
            backgroundColor: null,
            useCORS: true,
            logging: false
        });

        const link = document.createElement('a');
        const nome    = document.getElementById('nome').value    || 'crachá';
        const empresa = document.getElementById('empresa').value || 'empresa';
        link.download = `LabAccess_Free_${empresa}_${nome}.png`;
        link.href     = canvas.toDataURL('image/png');
        link.click();

        showToast('✅ Crachá baixado! Versão gratuita — sem lastro financeiro.', 'success');
    } catch (e) {
        console.error(e);
        showToast('Erro ao gerar imagem', 'error');
    }
}

// ── Toast de notificação ──────────────────────────────────
function showToast(msg, type) {
    const colors = {
        success: '#10b981',
        error:   '#ef4444',
        warning: '#f59e0b',
        info:    '#3b82f6'
    };
    const toast = document.createElement('div');
    toast.className       = 'toast';
    toast.style.background = colors[type] || colors.info;
    toast.innerText        = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ── Inicialização ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Define validade padrão = hoje + 1 ano
    const umAno = new Date();
    umAno.setFullYear(umAno.getFullYear() + 1);
    document.getElementById('validade').value = umAno.toISOString().split('T')[0];

    // Seleção de plano
    document.querySelectorAll('.plan-card').forEach(plan => {
        plan.addEventListener('click', () => {
            document.querySelectorAll('.plan-card').forEach(p => p.classList.remove('selected'));
            plan.classList.add('selected');
            selectedQty   = parseInt(plan.dataset.qty);
            selectedPrice = parseInt(plan.dataset.price);

            document.getElementById('totalValue').innerText = `R$ ${selectedPrice},00`;
            const precoUnit = (selectedPrice / selectedQty).toFixed(2);
            document.getElementById('qtyInfo').innerText = `${selectedQty} acessos · R$ ${precoUnit} por acesso`;
        });
    });

    // Seletor de cores com delegação de evento
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => setColor(swatch.dataset.color));
    });

    // Preview inicial
    updatePreview();

    // Restaura dados salvos
    const saved = localStorage.getItem('labaccess_empresa');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.empresa) document.getElementById('empresa').value = data.empresa;
        } catch (_) {}
    }

    // Salva empresa ao sair
    window.addEventListener('beforeunload', () => {
        const empresa = document.getElementById('empresa').value;
        if (empresa) localStorage.setItem('labaccess_empresa', JSON.stringify({ empresa }));
    });
});
