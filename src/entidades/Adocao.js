import { EntitySchema } from "typeorm";

export const AdocaoEntity = new EntitySchema({
  name: "Adocao",
  tableName: "adocoes",

  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },

    pet_id: {
      type: "int",
      nullable: false,
    },

    lar_adotivo_id: {
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
