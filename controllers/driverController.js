import { validationResult, matchedData, body } from "express-validator"
import db from "../db/queries.js"

const validateDriver = [
    body("name").trim().notEmpty().withMessage("Lütfen bir ad verin!"),
    body("tckn").isLength({min:11,max:11}).withMessage("Geçerli bir TCKN girin.")
]


async function getDriverList(req, res) {
    const {arama} = req.query
    //console.log(arama)
    const driverList = arama ? await db.searchDriver(arama) : await db.getAllDrivers();
    return res.render("index", { driverList })
}

const createDriver = [...validateDriver, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.send({ error: errors.array() })
    }

    const { name, tckn } = matchedData(req)

    await db.createDriver(name, tckn)
    return res.redirect("/drivers")
}]

async function getUpdateForm(req, res) {
    const { id } = req.params
    const driver = await db.getOneDriver(id)
    if (!driver) return res.status(404).send({ error: "Şoför bulunmadı." })
    return res.render("editDriver", { driver })

}

const updateDriver = [...validateDriver, async (req, res) => {
    const { id } = req.params
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.send({ error: errors.array() })
    }

    const { name, tckn } = matchedData(req)
    await db.editDriver(id,name,tckn)
    return res.redirect("/drivers")


}]

async function deleteDriver(req,res){
    const {id} = req.params
    await db.deleteDriver(id)
    return res.redirect("/drivers")
}


async function getcreateDriverForm(req, res) {
    return res.render("driverForm")
}
export default {
    getDriverList,
    createDriver,
    getcreateDriverForm,
    getUpdateForm,
    updateDriver,
    deleteDriver
}
