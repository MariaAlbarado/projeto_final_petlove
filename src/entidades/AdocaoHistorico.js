import { EntitySchema } from "typeorm";

export const AdocaoHistoricoEntity = new EntitySchema({
  name: "AdocaoHistorico",
  tableName: "adocoes_historico",

  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },

    status: {
      type: "varchar",
      length: 255,
      nullable: false,
    },

    observacao: {
      type: "text",
      nullable: false,
    },

    adocao_id: {
      type: "int",
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
