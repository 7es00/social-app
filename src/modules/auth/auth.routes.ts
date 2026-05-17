import { Router } from "express";
import { validate } from "../../middleware/validation.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as authController from "./auth.controller";
import * as authDto from "./auth.dto";

const router = Router();

router.post("/register", validate(authDto.registerDto), authController.register);
router.post("/confirm-email", validate(authDto.confirmEmailDto), authController.confirmEmail);
router.post("/resend-confirmation", authController.resendConfirmation);
router.post("/login", validate(authDto.loginDto), authController.login);
router.post("/logout", authenticate, authController.logout);
router.post("/forgot-password", validate(authDto.forgotPasswordDto), authController.forgotPassword);
router.post("/reset-password", validate(authDto.resetPasswordDto), authController.resetPassword);
router.put("/change-password", authenticate, validate(authDto.changePasswordDto), authController.changePassword);

export default router;
