function downloadJSON(filename, data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function exportarUsuarios() {
  const usuarios = JSON.parse(localStorage.getItem("kinutri_users")) || [];
  downloadJSON("kinutri-usuarios.json", usuarios);
  showToast("Usuários exportados com sucesso!");
}

function exportarPlanos() {
  const planos = JSON.parse(localStorage.getItem("kinutri_planos")) || [];
  downloadJSON("kinutri-planos.json", planos);
  showToast("Planos exportados com sucesso!");
}

function exportarAlimentos() {
  const alimentos = JSON.parse(localStorage.getItem("kinutri_alimentos")) || [];
  downloadJSON("kinutri-alimentos.json", alimentos);
  showToast("Alimentos exportados com sucesso!");
}

function exportarBackupCompleto() {
  const backup = {
    usuarios: JSON.parse(localStorage.getItem("kinutri_users")) || [],
    planos: JSON.parse(localStorage.getItem("kinutri_planos")) || [],
    alimentos: JSON.parse(localStorage.getItem("kinutri_alimentos")) || [],
    historico: JSON.parse(localStorage.getItem("kinutri_historico")) || [],
    exportadoEm: new Date().toLocaleString("pt-BR")
  };

  downloadJSON("kinutri-backup-completo.json", backup);
  showToast("Backup completo exportado com sucesso!");
}