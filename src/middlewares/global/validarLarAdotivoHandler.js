export const validarLarAdotivoHandler = (request, response, next) => {
  const {
    nome,
    cep,
    estado,
    cidade,
    bairro,
    rua,
    possui_telas_protecao,
    tipo,
    telefone,
  } = request.body;

  if (
    !nome ||
    !cep ||
    !estado ||
    !cidade ||
    !bairro ||
    !rua ||
    possui_telas_protecao === undefined ||
    !tipo ||
    !telefone
  ) {
    return response
      .status(400)
      .send({ error: "Todos os campos são obrigatórios." });
  }

  if (typeof nome !== "string") {
    return response
      .status(400)
      .send({ error: "O campo 'nome' deve ser uma string." });
  }

  const regexCep = /^\d{5}-\d{3}$/;
  if (!regexCep.test(cep)) {
    return response
      .status(400)
      .send({ error: "O campo 'cep' deve estar no formato 'XXXXX-XXX'." });
  }
  if (typeof possui_telas_protecao !== "boolean") {
    return response
      .status(400)
      .send({ error: "O campo 'possui_telas_protecao' deve ser um booleano." });
  }
  if (tipo !== "TEMPORARIO" && tipo !== "DEFINITIVO") {
    return response
      .status(400)
      .send({ error: "O campo 'tipo' deve ser 'TEMPORARIO' ou 'DEFINITIVO'." });
  }
  const regexTelefone = /^\(\d{2}\) \d{5}-\d{4}$/;
  if (!regexTelefone.test(telefone)) {
    return response.status(400).send({
      error:
        "O campo 'telefone' deve estar no formato '(XX) XXXXX-XXXX' ou '(XX) XXXX-XXXX'.",
    });
  }
  next();
};
