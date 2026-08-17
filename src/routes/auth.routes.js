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

import { validarAtualizacaoLarAdotivoHandler } from "../middlewares/global/validarAtualizacaoLarAdotivoHandler.js";

import { AdocaoEntity } from "../entidades/Adocao.js";

import { AdocaoHistoricoEntity } from "../entidades/AdocaoHistorico.js";

const authRoutes = new Router();

const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);

const petRepository = AppDataSource.getRepository(PetEntity);

const larAdotivoRepository = AppDataSource.getRepository(LarAdotivoEntity);

const adocaoRepository = AppDataSource.getRepository(AdocaoEntity);

const adocaoHistoricoRepository = AppDataSource.getRepository(
  AdocaoHistoricoEntity,
);

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

    const petsComLar = await Promise.all(
      pets.map(async (pet) => {
        const adocao = await AppDataSource.query(
          `
          SELECT la.*
          FROM adocoes a
          INNER JOIN adocoes_historico ah
            ON ah.adocao_id = a.id
          INNER JOIN lares_adotivos la
            ON la.id = a.lar_adotivo_id
          WHERE a.pet_id = $1
            AND ah.status = 'FINALIZADO'
          LIMIT 1
          `,
          [pet.id],
        );

        return {
          ...pet,
          lar_adotivo: adocao.length > 0 ? adocao[0] : null,
        };
      }),
    );

    return response.status(200).send(petsComLar);
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

    const laresComPets = await Promise.all(
      lares.map(async (lar) => {
        const pets = await AppDataSource.query(
          `
          SELECT DISTINCT p.*
          FROM pets p
          INNER JOIN adocoes a
            ON a.pet_id = p.id
          INNER JOIN adocoes_historico ah
            ON ah.adocao_id = a.id
          WHERE a.lar_adotivo_id = $1
            AND ah.status = 'FINALIZADO'
          `,
          [lar.id],
        );

        return {
          ...lar,
          pets,
        };
      }),
    );

    return response.status(200).send(laresComPets);
  },
);

authRoutes.get(
  "/lares/:id",
  autorizarHandler(ROLES.ADMIN, ROLES.FUNCIONARIO),
  verifyIdExistsHandler(LarAdotivoEntity, "Lar Adotivo"),
  async (request, response) => {
    return response.status(200).send(request.cachorro);
  },
);

authRoutes.patch(
  "/lares/:id",
  autorizarHandler(ROLES.ADMIN, ROLES.FUNCIONARIO),
  verifyIdExistsHandler(LarAdotivoEntity, "Lar Adotivo"),
  validarAtualizacaoLarAdotivoHandler,
  async (request, response) => {
    const dados = request.body;

    larAdotivoRepository.merge(request.cachorro, dados);

    const larAtualizado = await larAdotivoRepository.save(request.cachorro);

    return response.status(200).send(larAtualizado);
  },
);

authRoutes.post(
  "/pets/adotar",
  autorizarHandler(ROLES.ADMIN),
  async (request, response) => {
    const { pet_id, lar_adotivo_id, observacoes } = request.body;

    if (!pet_id || !lar_adotivo_id || !observacoes) {
      return response.status(400).send({
        error: "pet_id, lar_adotivo_id e observacoes são obrigatórios.",
      });
    }

    const petExiste = await petRepository.existsBy({
      id: Number(pet_id),
    });

    if (!petExiste) {
      return response.status(404).send({
        error: "Pet não encontrado.",
      });
    }

    const larExiste = await larAdotivoRepository.existsBy({
      id: Number(lar_adotivo_id),
    });

    if (!larExiste) {
      return response.status(404).send({
        error: "Lar adotivo não encontrado.",
      });
    }

    const adocaoAtiva = await AppDataSource.query(
      `
      SELECT a.id
      FROM adocoes a
      INNER JOIN adocoes_historico ah
        ON ah.adocao_id = a.id
      WHERE a.pet_id = $1
        AND ah.status IN ('ANALISE', 'CONCLUIDO', 'FINALIZADO')
      LIMIT 1
      `,
      [pet_id],
    );

    if (adocaoAtiva.length > 0) {
      return response.status(CONFLICT_STATUS).send({
        error: "Este pet já possui uma adoção ativa.",
      });
    }

    const novaAdocao = adocaoRepository.create({
      pet_id,
      lar_adotivo_id,
    });

    const adocaoSalva = await adocaoRepository.save(novaAdocao);

    const novoHistorico = adocaoHistoricoRepository.create({
      adocao_id: adocaoSalva.id,
      observacao: observacoes,
      status: "ANALISE",
    });

    await adocaoHistoricoRepository.save(novoHistorico);

    return response.status(CREATED_STATUS).send(adocaoSalva);
  },
);

export default authRoutes;
