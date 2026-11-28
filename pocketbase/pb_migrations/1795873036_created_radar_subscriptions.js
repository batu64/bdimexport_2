/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "consent_kvkk = true && email != '' && tool_slug != ''",
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "exceptDomains": [],
        "help": "",
        "hidden": false,
        "id": "email3885137012",
        "name": "email",
        "onlyDomains": [],
        "presentable": false,
        "required": true,
        "system": false,
        "type": "email"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text491676904",
        "max": 180,
        "min": 0,
        "name": "company_name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text1994194169",
        "max": 140,
        "min": 0,
        "name": "contact_name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text2651740226",
        "max": 40,
        "min": 0,
        "name": "whatsapp_phone",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "select335843460",
        "maxSelect": 1,
        "name": "company_role",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "importer_tr",
          "exporter_manufacturer_tr",
          "foreign_buyer",
          "customs_broker",
          "other"
        ]
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text1138744105",
        "max": 80,
        "min": 0,
        "name": "tool_slug",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text1098958488",
        "max": 16,
        "min": 0,
        "name": "locale",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text2776776943",
        "max": 300,
        "min": 0,
        "name": "source_url",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json267969303",
        "maxSize": 50000,
        "name": "watched_hs_codes",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json3582116828",
        "maxSize": 100000,
        "name": "watched_items",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json663738602",
        "maxSize": 50000,
        "name": "trade_corridors",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text531257115",
        "max": 80,
        "min": 0,
        "name": "shipment_volume",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "select1023490895",
        "maxSelect": 1,
        "name": "channel_pref",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "email",
          "whatsapp",
          "telegram",
          "wechat"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "bool1752510796",
        "name": "consent_kvkk",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text344777727",
        "max": 64,
        "min": 0,
        "name": "consent_version",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "select107027552",
        "maxSelect": 1,
        "name": "lead_status",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "new",
          "verified",
          "contacted",
          "qualified",
          "unsubscribed"
        ]
      }
    ],
    "id": "pbc_3722216081",
    "indexes": [
      "CREATE INDEX idx_radar_subs_tool ON radar_subscriptions (tool_slug)",
      "CREATE INDEX idx_radar_subs_email ON radar_subscriptions (email)"
    ],
    "listRule": null,
    "name": "radar_subscriptions",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3722216081");

  return app.delete(collection);
})
