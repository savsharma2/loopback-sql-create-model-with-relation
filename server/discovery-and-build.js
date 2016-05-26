'use strict';

function discoverApi(app) {
  var fs = require('fs'),
    modelNames = [],
    files = [],
    fileName = '././common/models/',
    changeCase = require('change-case'),
    schemaPromises,
    extend = require('extend'),
    results,
    file = fs.readFileSync('server/model-config.json'),
    pluralize = require('pluralize'),
    lingo = require('lingo'),
    tableSchemas, mysqlSource = require('./datasources.json'),
    DataSource = require('loopback-datasource-juggler').DataSource,
    dataSource = new DataSource('mssql', mysqlSource.sqlserver),
    modelConfig = JSON.parse(file.toString()),
    s = require('string'),
    tableBase = {
      'base': 'PersistedModel',
      'idInjection': false,
      'validations': [],
      'relations': {},
      'acls': [],
      'methods': {}
    };


  return dataSource.discoverModelDefinitions({
    views: false
  }).then(function(models, err) {
    models.forEach(function(model) {
      modelNames.push(model.name);
    });
    schemaPromises = modelNames.map(modelName =>
      dataSource.discoverSchema(modelName));
    results = Promise.all(schemaPromises);
    return results;
  }).then(function(schemas) {
    tableSchemas = schemas;
    schemaPromises = modelNames.map(modelName => dataSource.discoverForeignKeys(modelName));
    if (schemas && schemas instanceof Array) {
      schemas.forEach(function(schema) {
        if (schema && schema.options && schema.options.mssql) {
          let camelName = changeCase.lowerCaseFirst(schema.options.mssql.table),
            name = s(camelName).dasherize().s;
          schema.fileName = fileName + name + '.json';
          schema.name = schema.options.mssql.table;
          extend(true, schema, tableBase);
        }
      });
    }
    results = Promise.all(schemaPromises);
    return results;
  }).then(function(fkSchemas) {
    schemaPromises = modelNames.map(modelName => dataSource.discoverExportedForeignKeys(modelName));
    if (fkSchemas && fkSchemas instanceof Array) {
      fkSchemas.forEach(function(fkSchema, index) {
        let i = 0;
        while (fkSchema[i]) {
          let relationName = changeCase.lowerCase(fkSchema[i][fkSchema.columns.PK_Table.name]);
          tableSchemas[index].relations[lingo.en.singularize(relationName)] = {
            'type': 'belongsTo',
            'model': fkSchema[i][fkSchema.columns.PK_Table.name],
            'foreignKey': changeCase.lowerCase(fkSchema[i][fkSchema.columns.fkColumnName.name])
          };
          i++;
        }
      });
    }
    results = Promise.all(schemaPromises);
    return results;
  }).then(function(pkSchemas) {
    if (pkSchemas && pkSchemas instanceof Array) {
      pkSchemas.forEach(function(pkSchema, index) {
        let i = 0;
        while (pkSchema[i]) {
          tableSchemas[index].relations[changeCase.lowerCase(pkSchema[i][pkSchema.columns.fkTableName.name])] = {
            'type': 'hasMany',
            'model': pkSchema[i][pkSchema.columns.fkTableName.name],
            'foreignKey': changeCase.lowerCase(pkSchema[i][pkSchema.columns.fkColumnName.name])
          };
          i++;
        }
      });
    }
    if (tableSchemas && tableSchemas instanceof Array) {
      tableSchemas.forEach(function(schema) {
        if (schema.fileName) {
          if (!fs.existsSync(fileName)) {
            fs.mkdirSync(fileName);
          }
          fs.writeFileSync(schema.fileName, JSON.stringify(schema));
        }
        modelConfig[schema.name] = {
          'dataSource': 'sqlserver',
          'public': true
        };
      });
      fs.writeFileSync('server/model-config.json', JSON.stringify(modelConfig));
    }
  });
}
module.exports.discoverAndBuid = function(app) {
  return discoverApi(app);
};
