import {Router} from "express"
import odemeController from "../controllers/odemeController.js"
const router = Router()


router.get("/new/:driverId", odemeController.getOdemeForm)
router.post("/new", odemeController.createOdeme)
router.post("/havale-sent/:id", odemeController.updateHavaleSent)
router.post("/update/:id", odemeController.updateOdeme)
router.get("/update/:driverId/:id", odemeController.getUpdateOdemeForm)
router.get("/", odemeController.getOdemeList)

router.post("/delete/:id", odemeController.deleteOdeme)
export default router
