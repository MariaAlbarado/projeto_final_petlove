import { EntitySchema } from "typeorm";

export const PetEntity = new EntitySchema({
  name: "Pet",
  tableName: "pets",
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

    tipo_id: {
      type: "int",
      nullable: false,
    },

    raca_id: {
      type: "int",
      nullable: false,
    },
    cor_id: {
      type: "int",
      nullable: false,
    },
    porte: {
      type: "varchar",
      length: 1,
      nullable: false,
    },
    sexo: {
      type: "varchar",
      length: 1,
      nullable: true,
    },
    foto_url: {
      type: "varchar",
      nullable: true,
    },

    historia: {
      type: "text",
      nullable: true,
    },

    comportamento: {
      type: "text",
      nullable: true,
    },

    observacoes_extras: {
      type: "text",
      nullable: true,
    },

    idade_meses: {
      type: "int",
      nullable: true,
    },
  },
});
