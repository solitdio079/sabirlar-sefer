import express,{Router} from "express"
import malzemeController from "../controllers/malzemeController.js"
const router = Router()


router.get("/", malzemeController.getMalzemeList)

router.post("/new", malzemeController.createMalzeme)
router.get("/new", malzemeController.getcreateMalzemeForm)

router.get("/update/:id", malzemeController.getUpdateForm)
router.post("/update/:id",malzemeController.updateMalzeme)
router.post("/delete/:id",malzemeController.deleteMalzeme)



export default router