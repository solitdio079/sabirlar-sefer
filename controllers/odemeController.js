import { validationResult, matchedData, body } from "express-validator"
import db from "../db/queries.js"
import pool from "../db/pool.js"


const validateOdeme= [
    body("sefer_id").notEmpty().withMessage("Lütfen sefer ID giriniz."),
    body("sefer_date").trim().notEmpty().withMessage("Lütfen sefer tarihi giriniz."),
    body("sefer_price").isNumeric().withMessage("Lütfen sefer fiyatı giriniz."),
    body("sefer_name").trim().notEmpty().withMessage("Lütfen sefer adını giriniz."),
    body("sefer_qty").notEmpty().withMessage("Lütfen sefer sayısı giriniz."),
    body("driver_id").trim().notEmpty().withMessage("Lütfen şoför ID giriniz."),
    body("driver_name").trim().notEmpty().withMessage("Lütfen şoför adı giriniz."),
    body("pay_type").trim().notEmpty().withMessage("Lütfen ödeme şekli giriniz."),
    body("payout").isNumeric().notEmpty().withMessage("Lütfen ödenen miktarı giriniz."),
   
]


const createOdeme = [...validateOdeme, async (req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.send({ error: errors.array() })
    }

    const {sefer_date,sefer_id,sefer_name,sefer_price,driver_id,driver_name,pay_type,payout,sefer_qty} = matchedData(req)
    await db.createOdeme(sefer_date,sefer_id,sefer_name,sefer_price,driver_id,driver_name,pay_type,payout,sefer_qty)
    return res.redirect(`/odeme/?driverId=${driver_id}`)
}]
const updateOdeme = [...validateOdeme, async (req,res)=>{
    const {id} = req.params
    const odeme = await db.getOneOdeme(id)
    if(!odeme) return res.send({error: "Bu ödeme bulunmadı!"})
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.send({ error: errors.array() })
    }

    const {sefer_date,sefer_id,sefer_name,sefer_price,driver_id,driver_name,pay_type,payout,sefer_qty} = matchedData(req)
    await db.updateOdeme(id,sefer_date,sefer_id,sefer_name,sefer_price,driver_id,driver_name,pay_type,payout,sefer_qty)
    return res.redirect(`/odeme/?driverId=${driver_id}`)
}]

async function getOdemeForm(req,res){
    const {driverId} = req.params
    const seferList = await db.getAllSefer()
    const driver = await db.getOneDriver(driverId)

    return res.render("createOdeme",{seferList,driver})
}

async function getOdemeList(req,res){
    const {driverId,seferId} = req.query
    let odemeList=[]
    let title = ''
    if(driverId){
        odemeList = await db.getDriverOdeme(driverId)
        title = "Şoför Ödemeleri"
    }
    else if(seferId){
        odemeList = await db.getSeferOdeme(seferId)
        title = "Sefer Ödemeleri"
    }else{
        odemeList = await db.getAllOdeme()
        title = "Ödemeler"
    }
    const toplam = odemeList.reduce((acc,curr) => {
        if(curr.pay_type !== "Nakit") return acc
        return acc + parseInt(curr.payout)
    },0)
     
    res.render("odemeList",{odemeList,title, toplam})
}

async function deleteOdeme(req,res){
    const {id} = req.params
    const odeme = await db.getOneOdeme(id)
    if(!odeme) return res.send({error: "Bu ödeme bulunmadı!"})
    await db.deleteOdeme(id)
    return res.redirect(`/odeme/?driverId=${odeme.driver_id}`)

}

async function getUpdateOdemeForm(req,res){
    const {driverId,id} = req.params
    const seferList = await db.getAllSefer()
    const driver = await db.getOneDriver(driverId)
    const odeme = await db.getOneOdeme(id)
    if(!odeme) return res.send({error: "Ödeme bulunmadı!"})
    console.log(odeme)

    return res.render("updateOdeme",{seferList,driver,odeme})
    
}
export default {getOdemeForm,createOdeme,getOdemeList,updateOdeme,deleteOdeme,getUpdateOdemeForm}
