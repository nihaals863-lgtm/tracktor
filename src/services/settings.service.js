import prisma from '../config/db.js';

// ─── SYSTEM CONFIGURATION (Singleton) ────────────────────────────

/**
 * Get system configuration. Creates default if not exists.
 */
export const getSystemConfig = async () => {
  let config = await prisma.systemConfig.findUnique({ where: { id: 1 } });

  if (!config) {
    config = await prisma.systemConfig.create({
      data: { id: 1 }
    });
  }

  return {
    // General
    hubName: config.hubName,
    hubLocation: config.hubLocation,
    supportEmail: config.supportEmail,
    contactEmail: config.contactEmail,
    // Fuel
    dieselPrice: config.dieselPrice,
    avgMileage: config.avgMileage,
    fuelCostPerKm: config.avgMileage > 0
      ? parseFloat((config.dieselPrice / config.avgMileage).toFixed(2))
      : 0,
    // Maintenance
    serviceIntervalHours: config.serviceIntervalHours,
    preAlertHours: config.preAlertHours,
    updatedAt: config.updatedAt
  };
};

/**
 * Update system configuration.
 */
export const updateSystemConfig = async (data) => {
  const config = await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data }
  });

  return {
    ...config,
    fuelCostPerKm: config.avgMileage > 0 
      ? parseFloat((config.dieselPrice / config.avgMileage).toFixed(2))
      : 0
  };
};

// ─── DISTANCE ZONES ──────────────────────────────────────────────

/**
 * List all zones.
 */
export const listZones = async () => {
  return await prisma.zone.findMany({
    orderBy: { distance: 'asc' }
  });
};

/**
 * Get a single zone by ID.
 */
export const getZoneById = async (id) => {
  const zone = await prisma.zone.findUnique({ where: { id: parseInt(id) } });
  if (!zone) throw new Error('Zone not found');
  return zone;
};

/**
 * Create a new zone.
 */
export const createZone = async (name, distance) => {
  if (!name || name.trim().length === 0) throw new Error('Zone name is required');
  if (distance == null || distance < 0) throw new Error('Distance must be a non-negative number');

  const existing = await prisma.zone.findUnique({ where: { name: name.trim() } });
  if (existing) throw new Error('A zone with this name already exists');

  return await prisma.zone.create({
    data: { name: name.trim(), distance: parseFloat(distance) }
  });
};

/**
 * Update an existing zone.
 */
export const updateZone = async (id, name, distance) => {
  const zone = await prisma.zone.findUnique({ where: { id: parseInt(id) } });
  if (!zone) throw new Error('Zone not found');

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (distance !== undefined) data.distance = parseFloat(distance);

  return await prisma.zone.update({
    where: { id: parseInt(id) },
    data
  });
};

/**
 * Delete a zone.
 */
export const deleteZone = async (id) => {
  const zone = await prisma.zone.findUnique({ where: { id: parseInt(id) } });
  if (!zone) throw new Error('Zone not found');

  await prisma.zone.delete({ where: { id: parseInt(id) } });
  return { success: true };
};
