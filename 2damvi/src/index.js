const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const api = require("./api.js");
//Swagger
var swaggerUi = require("swagger-ui-express"),
swaggerDocument = require("./Swagger.json");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
api.setup(app);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

port =  process.env.PORT || 3000;

app.listen(port, () => {
    console.log("El servidor está inicializado en el puerto " + port);
});