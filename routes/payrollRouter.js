import {Router} from "express"
import payrollController from "../controllers/payrollController.js"

const router = Router()

router.get("/personel", payrollController.getPersonelList)
router.get("/personel/new", payrollController.getPersonelForm)
router.post("/personel/new", payrollController.createPersonel)
router.get("/personel/edit/:id", payrollController.getPersonelEditForm)
router.post("/personel/edit/:id", payrollController.updatePersonel)
router.post("/personel/delete/:id", payrollController.deletePersonel)

router.get("/bordro", payrollController.getBordroList)
router.get("/bordro/new", payrollController.getBordroForm)
router.post("/bordro/new", payrollController.createBordro)
router.get("/bordro/bulk-print", payrollController.getBordroBulkPrint)
router.get("/bordro/edit/:id", payrollController.getBordroEditForm)
router.post("/bordro/edit/:id", payrollController.updateBordro)
router.get("/bordro/detail/:id", payrollController.getBordroDetail)
router.post("/bordro/minimum-paid/:id", payrollController.updateMinimumPaid)
router.post("/bordro/extra-sent/:id", payrollController.updateExtraSent)
router.post("/bordro/delete/:id", payrollController.deleteBordro)

export default router
