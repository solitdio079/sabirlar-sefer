import { validationResult, matchedData, body } from "express-validator"
import db from "../db/queries.js"


const validateSefer= [
    body("name").trim().notEmpty().withMessage("Lütfen şoför adını giriniz."),
    body("price").isNumeric().withMessage("Lütfen sefer fiyatı giriniz."),
]


async function getCreateSeferForm(req,res){
    return res.render("createSefer")
}

const createSefer = [...validateSefer, async(req,res) => {
     const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.send({ error: errors.array() })
    }

    const { name,price } = matchedData(req)
    //const date = new Date()
    await db.createSefer(name,price)
    return res.redirect(`/sefer`)
}]

const updateSefer = [...validateSefer, async(req,res) => {
    const {id} = req.params
    const errors = validationResult(req)
    const sefer = await db.getOneSefer(id)
    if (!errors.isEmpty()) {
        return res.send({ error: errors.array() })
    }
    const { name,price } = matchedData(req)
    await db.editSefer(id,name,price)
    return res.redirect(`/sefer`)
}]

async function getAllSefer(req,res) {
    const {arama} = req.query
    const seferList = arama ? await db.searchSefer(arama) : await db.getAllSefer()
    return res.render("allSefer", {title:`Seferler`,seferList})
}

async function getEditSefer(req,res){
    const {id} = req.params
    const sefer = await db.getOneSefer(id)
    if(!sefer) return res.send({error: "Bu sefer yok!"})
    return res.render("editSefer", {sefer})

}

async function deleteSefer(req,res){
    const {id} = req.params 
    await db.deleteSefer(id)
    return res.redirect(`/sefer`)
}

export default {getCreateSeferForm,createSefer, getAllSefer,getEditSefer,updateSefer,deleteSefer}
