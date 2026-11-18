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

async function exportarDados(service, filename, message) {
  try {
    const result = await service.list();
    if (result.status !== "success") throw new Error(result.message || "Erro ao exportar dados.");
    downloadJSON(filename, result.data);
    showToast(message);
  } catch (error) { showToast(error.message, "error"); }
}

function exportarUsuarios() {
  return exportarDados(userService, "kinutri-usuarios.json", "Usuários exportados com sucesso!");
}

function exportarPlanos() {
  return exportarDados(dietService, "kinutri-planos.json", "Planos exportados com sucesso!");
}

function exportarAlimentos() {
  return exportarDados(foodService, "kinutri-alimentos.json", "Alimentos exportados com sucesso!");
}

async function exportarBackupCompleto() {
  try {
    const results = await Promise.all([userService.list(), dietService.list(), foodService.list()]);
    for (const result of results) {
      if (result.status !== "success") throw new Error(result.message || "Erro ao exportar dados.");
    }
    const [usuarios, planos, alimentos] = results.map(result => result.data);
    const backup = { usuarios, planos, alimentos, historico: planos, exportadoEm: new Date().toLocaleString("pt-BR") };
    downloadJSON("kinutri-backup-completo.json", backup);
    showToast("Backup completo exportado com sucesso!");
  } catch (error) { showToast(error.message, "error"); }
}
