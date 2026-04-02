import express,{Router} from "express"
import seferController from "../controllers/seferController.js" 

const router = Router()

router.get("/new/:malzemeId", seferController.getCreateSeferForm)
router.post("/new", seferController.createSefer)
router.get("/malzeme/:malzemeId", seferController.getMalzemeSefer)


router.get("/edit/:malzemeId/:seferId", seferController.getEditSefer)

router.post("/edit/:id", seferController.updateSefer)
router.post("/delete/:id/:malzemeId", seferController.deleteSefer)
export default router