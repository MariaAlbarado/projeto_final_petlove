import { AppDataSource } from "../../config/database_postgres.js";
export async function validarPetHandler(request, response, next) {
  const dados = request.body;
  if (!dados.nome) {
    return response
      .status(400)
      .send({ error: "O campo 'nome' é obrigatório." });
  }

  if (!dados.tipo_id) {
    return response
      .status(400)
      .send({ error: "O campo 'tipo_id' é obrigatório." });
  }

  const tipoEncontrado = await AppDataSource.query(
    "SELECT id FROM tipos WHERE id = $1",
    [dados.tipo_id],
  );

  if (tipoEncontrado.length === 0) {
    return response
      .status(400)
      .send({ error: "O campo 'tipo_id' não corresponde a um tipo válido." });
  }
  if (!dados.cor_id) {
    return response
      .status(400)
      .send({ error: "O campo 'cor_id' é obrigatório." });
  }

  const corEncontrada = await AppDataSource.query(
    "SELECT id FROM cores WHERE id = $1",
    [dados.cor_id],
  );

  if (corEncontrada.length === 0) {
    return response
      .status(400)
      .send({ error: "O campo 'cor_id' não corresponde a uma cor válida." });
  }

  if (!dados.porte) {
    return response
      .status(400)
      .send({ error: "O campo 'porte' é obrigatório." });
  }

  if (!["P", "M", "G"].includes(dados.porte)) {
    return response
      .status(400)
      .send({ error: "O campo 'porte' deve ser 'P', 'M' ou 'G'." });
  }

  if (dados.sexo && !["M", "F"].includes(dados.sexo)) {
    return response
      .status(400)
      .send({ error: "O campo 'sexo' deve ser 'M' ou 'F'." });
  }

  if (
    dados.idade_meses !== underfined &&
    !Number.isInteger(dados.idade_meses)
  ) {
    return response
      .status(400)
      .send({ error: "O campo 'idade_meses' deve ser um número inteiro." });
  }
  if (dados.foto_url !== undefined && typeof dados.foto_url !== "string") {
    return response
      .status(400)
      .send({ error: "O campo 'foto_url' deve ser uma string." });
  }
  if (dados.historia !== undefined && typeof dados.historia !== "string") {
    return response
      .status(400)
      .send({ error: "O campo 'historia' deve ser uma string." });
  }
  if (
    dados.comportamento !== undefined &&
    typeof dados.comportamento !== "string"
  ) {
    return response
      .status(400)
      .send({ error: "O campo 'comportamento' deve ser uma string." });
  }
  if (
    dados.observacoes_extras !== undefined &&
    typeof dados.observacoes_extras !== "string"
  ) {
    return response
      .status(400)
      .send({ error: "O campo 'observacoes_extras' deve ser uma string." });
  }

  next();
}
