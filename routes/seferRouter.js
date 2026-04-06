import express,{Router} from "express"
import seferController from "../controllers/seferController.js" 

const router = Router()

router.get("/new", seferController.getCreateSeferForm)
router.post("/new", seferController.createSefer)
// router.get("/malzeme/:malzemeId", seferController.getMalzemeSefer)


router.get("/edit/:id", seferController.getEditSefer)

router.post("/edit/:id", seferController.updateSefer)
router.post("/delete/:id", seferController.deleteSefer)

router.get("/", seferController.getAllSefer)
export default router