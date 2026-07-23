import { Router } from "express";
import {
  inviteMember,
  linkOwner,
  listLinkedOwners,
  listMembers,
  unlinkOwner,
  updateMemberStatus,
} from "../controllers/agencyTeam.controller.js";
import { getAgencyStats } from "../controllers/agencyStats.controller.js";
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  listContracts,
  createContract,
  updateContract,
  signContract,
  listPayments,
  createPayment,
  recordPayment,
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  listAppointments,
  createAppointment,
  deleteAppointment,
  listDocuments,
  createDocument,
  deleteDocument,
  listExpenses,
  createExpense,
  getAccountingSummary,
} from "../controllers/agencyCrm.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireRole("agency", "admin"));

router.get("/stats", getAgencyStats);

router.get("/members", listMembers);
router.post("/members", inviteMember);
router.patch("/members/:id/status", updateMemberStatus);

router.get("/owners", listLinkedOwners);
router.post("/owners", linkOwner);
router.delete("/owners/:id", unlinkOwner);

router.get("/clients", listClients);
router.get("/clients/:id", getClient);
router.post("/clients", createClient);
router.patch("/clients/:id", updateClient);
router.delete("/clients/:id", deleteClient);

router.get("/contracts", listContracts);
router.post("/contracts", createContract);
router.patch("/contracts/:id", updateContract);
router.post("/contracts/:id/sign", signContract);

router.get("/payments", listPayments);
router.post("/payments", createPayment);
router.post("/payments/:id/record", recordPayment);

router.get("/tasks", listTasks);
router.post("/tasks", createTask);
router.patch("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

router.get("/appointments", listAppointments);
router.post("/appointments", createAppointment);
router.delete("/appointments/:id", deleteAppointment);

router.get("/documents", listDocuments);
router.post("/documents", createDocument);
router.delete("/documents/:id", deleteDocument);

router.get("/expenses", listExpenses);
router.post("/expenses", createExpense);
router.get("/accounting", getAccountingSummary);

export default router;
