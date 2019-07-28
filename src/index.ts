import express = require("express");
import helmet = require("helmet");
import bodyParser = require("body-parser");
import router from "./routes/v1";

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
app.use("/v1/", router);

app.get("/", function(_req, res) {
    res.redirect(301, "https://github.com/eai04191/honto-order-mail-parser");
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.log(require("express-list-endpoints")(app));
});
