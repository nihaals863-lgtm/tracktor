import * as settingsService from '../../services/settings.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

// ─── SYSTEM CONFIG ───────────────────────────────────────────────

export const getSystemConfig = async (req, res) => {
  try {
    const config = await settingsService.getSystemConfig();
    return sendSuccess(res, config, "System configuration retrieved");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateSystemConfig = async (req, res) => {
  try {
    const data = req.body;
    const config = await settingsService.updateSystemConfig(data);
    return sendSuccess(res, config, "System configuration updated");
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

// ─── ZONES ───────────────────────────────────────────────────────

export const listZones = async (req, res) => {
  try {
    const zones = await settingsService.listZones();
    return sendSuccess(res, zones, "Zones retrieved");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createZone = async (req, res) => {
  try {
    const { name, distance } = req.body;
    const zone = await settingsService.createZone(name, distance);
    return sendSuccess(res, zone, "Zone created successfully", 201);
  } catch (error) {
    const statusCode = error.message.includes('already exists') ? 409 : 400;
    return sendError(res, error.message, statusCode);
  }
};

export const updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, distance } = req.body;
    const zone = await settingsService.updateZone(id, name, distance);
    return sendSuccess(res, zone, "Zone updated successfully");
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 400;
    return sendError(res, error.message, statusCode);
  }
};

export const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;
    await settingsService.deleteZone(id);
    return sendSuccess(res, null, "Zone deleted successfully");
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return sendError(res, error.message, statusCode);
  }
};
