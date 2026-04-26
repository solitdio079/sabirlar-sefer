import {Router} from "express"
import featureController from "../controllers/featureController.js"

const router = Router()

router.get("/", featureController.getFeatureRequests)
router.post("/", featureController.createFeatureRequest)
router.post("/implemented/:id", featureController.updateFeatureImplemented)

export default router
