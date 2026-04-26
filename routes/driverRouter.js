import express,{Router} from "express"
import driverController from "../controllers/driverController.js"
const router = Router()


router.get("/drivers", driverController.getDriverList)

 router.post("/new", driverController.createDriver)
 router.get("/new", driverController.getcreateDriverForm)

router.get("/update/:id", driverController.getUpdateForm)
 router.post("/update/:id", driverController.updateDriver)
router.post("/delete/:id", driverController.deleteDriver)



export default router
