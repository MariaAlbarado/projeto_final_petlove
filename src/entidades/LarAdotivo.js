import { EntitySchema } from "typeorm";

export const LarAdotivoEntity = new EntitySchema({
  name: "LarAdotivo",
  tableName: "lares_adotivos",

  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    nome: {
      type: "varchar",
      length: 150,
      nullable: false,
    },

    cep: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 2,
      nullable: false,
    },
    cidade: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    bairro: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    rua: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    possui_telas_protecao: {
      type: "boolean",
      nullable: false,
    },

    tipo: {
      type: "varchar",
      length: 255,
      nullable: false,
      default: "DEFINITIVO",
    },
    telefone: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    criado_em: {
      type: "timestamp",
      createDate: true,
    },
    atualizado_em: {
      type: "timestamp",
      updateDate: true,
    },
  },
});
