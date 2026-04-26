import { body, matchedData, validationResult } from "express-validator"
import db from "../db/queries.js"

const validateFeatureRequest = [
    body("title").trim().notEmpty().withMessage("Lütfen özellik başlığı giriniz."),
    body("description").trim().optional({checkFalsy:true})
]

async function getFeatureRequests(req,res){
    const featureRequests = await db.getAllFeatureRequests()
    return res.render("features",{featureRequests})
}

const createFeatureRequest = [...validateFeatureRequest, async (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.send({error: errors.array()})
    }

    const {title,description} = matchedData(req)
    await db.createFeatureRequest(title,description || "")
    return res.redirect("/features")
}]

async function updateFeatureImplemented(req,res){
    const {id} = req.params
    const implementedValue = req.body.implemented
    const implemented = Array.isArray(implementedValue)
        ? implementedValue.includes("true")
        : implementedValue === "true"

    await db.updateFeatureImplemented(id,implemented)
    return res.redirect("/features")
}

export default {getFeatureRequests, createFeatureRequest, updateFeatureImplemented}
