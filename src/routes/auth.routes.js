import { PetEntity } from "../entidades/Pet.js";
import { validarPetHandler } from "../middlewares/global/validarPetHandler.js";
import { Router } from "express";
import { verifyIdExistsHandler } from "../middlewares/global/verifyIdExistsHandler.js";
import { validarAtualizacaoPetHandler } from "../middlewares/global/ValidarAtualizacaoPetHandler.js";

import bcrypt from "bcrypt"; // lib gerar hash da senha
import jwt from "jsonwebtoken"; // lib que vai gerar o token do usuario

import { AppDataSource } from "../config/database_postgres.js";
import { UsuarioEntity } from "../entidades/Usuario.js";

import { CREATED_STATUS, CONFLICT_STATUS } from "../constants/server.js";
import { ROLES } from "../constants/roles.js";

import { autorizarHandler } from "../middlewares/auth/autorizarHandler.js";

import { LarAdotivoEntity } from "../entidades/LarAdotivo.js";
import { validarLarAdotivoHandler } from "../middlewares/global/validarLarAdotivoHandler.js";

const authRoutes = new Router();

const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);

const petRepository = AppDataSource.getRepository(PetEntity);

const larAdotivoRepository = AppDataSource.getRepository(LarAdotivoEntity);

authRoutes.post(
  "/auth/usuarios",
  autorizarHandler(ROLES.ADMIN),
  async (request, response) => {
    const dados = request.body;

    const usuarioEncontrado = await usuarioRepository.existsBy({
      email: dados.email,
    });

    if (usuarioEncontrado) {
      response.status(CONFLICT_STATUS).send({ error: "O email já existe" });
    } else {
      const senhaHash = await bcrypt.hash(dados.senha, 12);

      // criar um novo objeto apartir do body com senha alterada
      const dadosUsuario = {
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,
        role: dados.role,
      };

      await usuarioRepository.save(dadosUsuario);

      response
        .status(CREATED_STATUS)
        .send({ nome: dados.nome, role: dados.role });
    }
  },
);

authRoutes.post(
  "/pets",
  autorizarHandler(ROLES.ADMIN, ROLES.FUNCIONARIO),
  validarPetHandler,
  async (request, response) => {
    const dados = request.body;

    const novoPet = petRepository.create(dados);
    const petSalvo = await petRepository.save(novoPet);

    return response.status(CREATED_STATUS).send(petSalvo);
  },
);

authRoutes.get(
  "/pets",
  autorizarHandler(ROLES.ADMIN, ROLES.FUNCIONARIO),
  async (request, response) => {
    const pets = await petRepository.find({
      relations: {
        tipo: true,
        raca: true,
        cor: true,
      },
    });

    return response.status(200).send(pets);
  },
);

authRoutes.get(
  "/pets/:id",
  autorizarHandler(ROLES.ADMIN, ROLES.FUNCIONARIO),
  verifyIdExistsHandler(PetEntity, "Pet"),
  async (request, response) => {
    return response.status(200).send(request.cachorro);
  },
);

authRoutes.patch(
  "/pets/:id",
  autorizarHandler(ROLES.ADMIN, ROLES.FUNCIONARIO),
  verifyIdExistsHandler(PetEntity, "Pet"),
  validarAtualizacaoPetHandler,
  async (request, response) => {
    const dados = request.body;
    const petAtualizado = petRepository.merge(request.cachorro, dados);

    const petSalvo = await petRepository.save(petAtualizado);

    return response.status(200).send(petSalvo);
  },
);

authRoutes.delete(
  "/pets/:id",
  autorizarHandler(ROLES.ADMIN),
  verifyIdExistsHandler(PetEntity, "Pet"),
  async (request, response) => {
    const { id } = request.params;
    const adocao = await AppDataSource.query(
      "SELECT * FROM adocoes WHERE pet_id = $1",
      [id],
    );
    if (adocao.length > 0) {
      return response
        .status(400)
        .send({ error: "Não é possível excluir um pet que já foi adotado." });
    }
    await petRepository.remove(request.cachorro);
    return response.status(204).send();
  },
);

authRoutes.post(
  "/Lares",
  autorizarHandler(ROLES.ADMIN, ROLES.FUNCIONARIO),
  validarLarAdotivoHandler,
  async (request, response) => {
    const dados = request.body;

    const novoLar = larAdotivoRepository.create(dados);
    const larSalvo = await larAdotivoRepository.save(novoLar);

    return response.status(CREATED_STATUS).send(larSalvo);
  },
);

authRoutes.get(
  "/lares",
  autorizarHandler(ROLES.ADMIN, ROLES.FUNCIONARIO),
  async (request, response) => {
    const { estado, tipo } = request.query;

    const filtros = {};

    if (estado) {
      filtros.estado = estado;
    }
    if (tipo) {
      filtros.tipo = tipo;
    }
    const lares = await larAdotivoRepository.find({
      where: filtros,
      order: {
        criado_em: "ASC",
      },
    });
    return response.status(200).send(lares);
  },
);

export default authRoutes;
