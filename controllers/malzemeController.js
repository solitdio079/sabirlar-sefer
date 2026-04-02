import { validationResult, matchedData, body } from "express-validator"
import db from "../db/queries.js"

const validateMalzeme = [
    body("name").trim().notEmpty().withMessage("Lütfen bir ad verin!"),
    body("price").isNumeric().withMessage("Fiyat sayı olmalıdır")
]


async function getMalzemeList(req, res) {
    const {arama} = req.query
    //console.log(arama)
    const malzemeList = arama ? await db.searchMalzeme(arama) : await db.getAllMalzeme();
    return res.render("index", { malzemeList })
}

const createMalzeme = [...validateMalzeme, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.send({ error: errors.array() })
    }

    const { name, price } = matchedData(req)

    await db.createMalzeme(name, price)
    return res.redirect("/")
}]

async function getUpdateForm(req, res) {
    const { id } = req.params
    const malzeme = await db.getOneMalzeme(id)
    if (!malzeme) return res.status(404).send({ error: "Malzeme bulunmadı." })
    return res.render("editMalzeme", { malzeme })

}

const updateMalzeme = [...validateMalzeme, async (req, res) => {
    const { id } = req.params
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.send({ error: errors.array() })
    }

    const { name, price } = matchedData(req)
    await db.updateMalzeme(id,name,price)
    return res.redirect("/")


}]

async function deleteMalzeme(req,res){
    const {id} = req.params
    await db.deleteMalzeme(id)
    return res.redirect("/")
}


async function getcreateMalzemeForm(req, res) {
    return res.render("malzemeForm")
}
export default {
    getMalzemeList,
    createMalzeme,
    getcreateMalzemeForm,
    getUpdateForm,
    updateMalzeme,
    deleteMalzeme
}

