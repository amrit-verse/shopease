import { Router } from "express";
import { createOrder, myOrders, getOrder, updateOrderStatus, trackOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, createOrder);
router.get("/mine", protect, myOrders);
router.get("/track/:trackingId", protect, trackOrder);
router.get("/:id", protect, getOrder);
router.patch("/:id/status", protect, updateOrderStatus);

export default router;
