import express from "express"
import { config } from "dotenv"
import path from "node:path"
import driverRouter from "./routes/driverRouter.js"
import seferRouter from "./routes/seferRouter.js"
import odemeRouter from "./routes/odemeRouter.js"
import featureRouter from "./routes/featureRouter.js"
import payrollRouter from "./routes/payrollRouter.js"
import db from "./db/queries.js"
config()
const app = express()


const PORT = process.env.PORT || 3000

app.use(express.urlencoded({extended:true}))
const __dirname = path.resolve()
app.use(express.static("public"))
app.set("view engine", "ejs")
app.set("views", path.resolve(__dirname,"views"))


app.get("/", (req,res) => res.render("home"))
app.use("/sefer", seferRouter)
app.use("/odeme", odemeRouter)
app.use("/features", featureRouter)
app.use("/", payrollRouter)
app.use("/", driverRouter)


app.use((err,req,res,next) => {
    if(err){
        return res.status(400).send({error:err})
    }
})

await db.ensureOdemeHavaleSentColumn()
await db.ensureFeatureRequestTable()
await db.ensurePayrollTables()

app.listen(PORT, (err)=> {
    if(err){
        throw new Error(err.message)
    }
    console.log(`Lisiting to ${PORT}`)

})
