export function validarAtualizacaoLarAdotivoHandler(request, response, next) {
  const dados = request.body;

  if (dados.nome !== undefined && typeof dados.nome !== "string") {
    return response
      .status(400)
      .send({ error: "O campo 'nome' deve ser uma string." });
  }

  if (dados.cep !== undefined) {
    const regexCep = /^\d{5}-\d{3}$/;

    if (!regexCep.test(dados.cep)) {
      return response
        .status(400)
        .send({ error: "O campo 'cep' deve estar no formato 'XXXXX-XXX'." });
    }
  }

  if (dados.estado !== undefined && typeof dados.estado !== "string") {
    return response
      .status(400)
      .send({ error: "O campo 'estado' deve ser uma string." });
  }

  if (dados.cidade !== undefined && typeof dados.cidade !== "string") {
    return response
      .status(400)
      .send({ error: "O campo 'cidade' deve ser uma string." });
  }

  if (dados.bairro !== undefined && typeof dados.bairro !== "string") {
    return response
      .status(400)
      .send({ error: "O campo 'bairro' deve ser uma string." });
  }

  if (dados.rua !== undefined && typeof dados.rua !== "string") {
    return response
      .status(400)
      .send({ error: "O campo 'rua' deve ser uma string." });
  }

  if (
    dados.possui_telas_protecao !== undefined &&
    typeof dados.possui_telas_protecao !== "boolean"
  ) {
    return response.status(400).send({
      error: "O campo 'possui_telas_protecao' deve ser um booleano.",
    });
  }

  if (
    dados.tipo !== undefined &&
    dados.tipo !== "TEMPORARIO" &&
    dados.tipo !== "DEFINITIVO"
  ) {
    return response.status(400).send({
      error: "O campo 'tipo' deve ser 'TEMPORARIO' ou 'DEFINITIVO'.",
    });
  }

  if (dados.telefone !== undefined) {
    const regexTelefone = /^\(\d{2}\) \d{5}-\d{4}$/;

    if (!regexTelefone.test(dados.telefone)) {
      return response.status(400).send({
        error: "O campo 'telefone' deve estar no formato '(XX) XXXXX-XXXX'.",
      });
    }
  }

  next();
}
