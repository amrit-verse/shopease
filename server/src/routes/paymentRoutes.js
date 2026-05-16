import { Router } from "express";
import { createPaymentOrder, verifyPayment, getPaymentKey } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/key", protect, getPaymentKey);
router.post("/create-order", protect, createPaymentOrder);
router.post("/verify", protect, verifyPayment);

export default router;
