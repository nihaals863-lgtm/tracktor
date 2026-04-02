import prisma from '../config/db.js';

/**
 * Calculate booking price based on service rate, land size, and zone distance.
 * 
 * Formula:
 *   serviceCost    = landSize * ratePerHectare
 *   fuelCostPerKm  = dieselPrice / avgMileage
 *   distanceCharge = zone.distance * fuelCostPerKm
 *   totalPrice     = serviceCost + distanceCharge
 */
export const calculateBookingPrice = async (serviceType, landSize, zoneId = null) => {
  // 1. Get service rate
  const service = await prisma.service.findUnique({
    where: { name: serviceType.toLowerCase() }
  });

  if (!service) {
    throw new Error(`Service type '${serviceType}' not found`);
  }

  const baseRate = service.baseRatePerHectare;
  const basePrice = baseRate * landSize;

  // 2. Get fuel config (safe defaults if not configured)
  let dieselPrice = 0;
  let avgMileage = 1;
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    if (config) {
      dieselPrice = config.dieselPrice || 0;
      avgMileage = config.avgMileage > 0 ? config.avgMileage : 1;
    }
  } catch (e) {
    console.warn('[BookingService] Could not fetch SystemConfig, using defaults:', e.message);
  }

  const fuelCostPerKm = dieselPrice / avgMileage;

  // 3. Get zone distance (0 if no zone selected — backward compatible)
  let distanceKm = 0;
  let zoneName = null;
  if (zoneId) {
    const zone = await prisma.zone.findUnique({ where: { id: parseInt(zoneId) } });
    if (zone) {
      distanceKm = zone.distance;
      zoneName = zone.name;
    }
  }

  // 4. Calculate charges
  const distanceCharge = parseFloat((distanceKm * fuelCostPerKm).toFixed(2));
  const fuelSurcharge = 0; // kept for schema compatibility
  const totalPrice = parseFloat((basePrice + distanceCharge).toFixed(2));
  const finalPrice = totalPrice;

  return {
    serviceId: service.id,
    basePrice,
    distanceKm,
    distanceCharge,
    fuelSurcharge,
    totalPrice,
    finalPrice,
    zoneName
  };
};

/**
 * Create a new booking for a farmer.
 */
export const createBookingRequest = async (farmerId, bookingData) => {
  const { serviceType, landSize, location, zoneId } = bookingData;

  const pricing = await calculateBookingPrice(serviceType, landSize, zoneId);

  const booking = await prisma.booking.create({
    data: {
      farmerId,
      serviceId: pricing.serviceId,
      landSize,
      location,
      basePrice: pricing.basePrice,
      distanceKm: pricing.distanceKm,
      distanceCharge: pricing.distanceCharge,
      fuelSurcharge: pricing.fuelSurcharge,
      totalPrice: pricing.totalPrice,
      finalPrice: pricing.finalPrice,
      zoneName: pricing.zoneName,
      status: 'scheduled'
    },
    include: {
      service: true
    }
  });

  return booking;
};

/**
 * Get all bookings for a specific farmer.
 */
export const getFarmerBookings = async (farmerId, query = {}) => {
  const { page = 1, limit = 6, status = 'all', search } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = { farmerId };

  if (status !== 'all') {
    where.status = status.toLowerCase();
  }

  if (search) {
    const searchInt = parseInt(search);
    where.OR = [
      { service: { name: { contains: search } } }
    ];
    if (!isNaN(searchInt)) {
      where.OR.push({ id: searchInt });
    }
  }

  const [bookings, totalCount] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        service: true,
        payments: true
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.booking.count({ where })
  ]);

  return {
    bookings,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / take),
      currentPage: parseInt(page),
      limit: take
    }
  };
};

/**
 * Get booking details by ID.
 */
export const getBookingById = async (bookingId, farmerId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(bookingId) },
    include: {
      service: true
    }
  });

  if (!booking || booking.farmerId !== farmerId) {
    return null;
  }

  return booking;
};

