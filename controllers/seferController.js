import { validationResult, matchedData, body } from "express-validator"
import db from "../db/queries.js"


const validateSefer= [
    body("driver_name").trim().notEmpty().withMessage("Lütfen şoför adını giriniz."),
    body("pay_type").notEmpty().withMessage("Lütfen ödeme yöntemi seçiniz."),
    body("malzeme_id").isUUID().withMessage("Malzeme ID must be a UUID"),
    body("sefer_qty").isNumeric().withMessage("Lütfen sefer sayısı giriniz"),
    body("total_payout").isNumeric().withMessage("Lütfen ödenen tutar giriniz!")
]


async function getCreateSeferForm(req,res){
    const {malzemeId} = req.params
    const malzeme = await db.getOneMalzeme(malzemeId)
   // console.log(malzeme)
    return res.render("createSefer", {malzeme})
}

const createSefer = [...validateSefer, async(req,res) => {
     const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.send({ error: errors.array() })
    }

    const { driver_name, malzeme_id,pay_type,sefer_qty,total_payout } = matchedData(req)
    const date = new Date()
    await db.createSefer(driver_name,malzeme_id,pay_type,date,total_payout,sefer_qty)
    return res.redirect(`/sefer/malzeme/${malzeme_id}`)
}]

const updateSefer = [...validateSefer, async(req,res) => {
    const {id} = req.params
    const errors = validationResult(req)
    const sefer = await db.getOneSefer(id)
    if (!errors.isEmpty()) {
        return res.send({ error: errors.array() })
    }
    const { driver_name, malzeme_id,pay_type,sefer_qty,total_payout } = matchedData(req)
    await db.updateSefer(id,driver_name,malzeme_id,pay_type,total_payout,sefer_qty)
    return res.redirect(`/sefer/malzeme/${sefer.malzeme_id}`)
}]

async function getMalzemeSefer(req,res) {
    const {malzemeId} = req.params 
    const {arama} = req.query
    const malzeme = await db.getOneMalzeme(malzemeId)
    const totalPayout = await db.getTotalAmount(malzemeId)
    if(!malzeme) return res.send({error: "parent malzeme not found!"})

    const seferList = arama ? await db.searchSefer(malzemeId,arama) : await db.getMalzemeSefer(malzemeId)
    return res.render("malzemeSefer", {title:`${malzeme.name} Seferleri`,seferList,malzeme,totalPayout})
}

async function getEditSefer(req,res){
    const {malzemeId,seferId} = req.params
    const sefer = await db.getOneSefer(seferId)
    const malzeme = await db.getOneMalzeme(malzemeId)
    if(!malzeme) return res.send({error: "Bu yol bulunmadı!"})
    if(!sefer) return res.send({error: "Bu sefer yok!"})
    return res.render("editSefer", {sefer,malzeme})

}

async function deleteSefer(req,res){
    const {id,malzemeId} = req.params 
    await db.deleteSefer(id)
    return res.redirect(`/sefer/malzeme/${malzemeId}`)
}

export default {getCreateSeferForm,createSefer, getMalzemeSefer,getEditSefer,updateSefer,deleteSefer}
