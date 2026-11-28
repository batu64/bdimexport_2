/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
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
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text4171620892",
        "max": 100,
        "min": 0,
        "name": "alert_code",
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
        "id": "text1990178203",
        "max": 64,
        "min": 0,
        "name": "source_code",
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
        "id": "text1942130484",
        "max": 16,
        "min": 0,
        "name": "jurisdiction",
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
        "id": "text3406238109",
        "max": 64,
        "min": 0,
        "name": "measure_type",
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
        "id": "text2651326123",
        "max": 32,
        "min": 0,
        "name": "published_date",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json4279113920",
        "maxSize": 50000,
        "name": "affected_hs_codes",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json2874595007",
        "maxSize": 20000,
        "name": "affected_origins",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text19357424",
        "max": 300,
        "min": 0,
        "name": "title_tr",
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
        "id": "text561646865",
        "max": 1200,
        "min": 0,
        "name": "summary_tr",
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
        "id": "text4063379760",
        "max": 500,
        "min": 0,
        "name": "official_url",
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
        "id": "text258771450",
        "max": 32,
        "min": 0,
        "name": "impact_level",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "select1602529173",
        "maxSelect": 1,
        "name": "approval_status",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "pending_admin_review",
          "approved",
          "archived"
        ]
      }
    ],
    "id": "pbc_2810631272",
    "indexes": [
      "CREATE UNIQUE INDEX idx_reg_alert_code ON regulatory_alerts (alert_code)",
      "CREATE INDEX idx_reg_alert_status_date ON regulatory_alerts (approval_status, published_date)"
    ],
    "listRule": "approval_status = 'approved'",
    "name": "regulatory_alerts",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": "approval_status = 'approved'"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810631272");

  return app.delete(collection);
})
