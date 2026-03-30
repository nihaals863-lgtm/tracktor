import prisma from '../config/db.js';

/**
 * Calculate booking price based on service rate and land size.
 * Future-ready structure included.
 */
export const calculateBookingPrice = async (serviceType, landSize) => {
  const service = await prisma.service.findUnique({
    where: { name: serviceType.toLowerCase() }
  });

  if (!service) {
    throw new Error(`Service type '${serviceType}' not found`);
  }

  const baseRate = service.baseRatePerHectare;
  const basePrice = baseRate * landSize;

  // Future-ready defaults
  const distanceKm = 0;
  const distanceCharge = 0;
  const fuelSurcharge = 0;
  const totalPrice = basePrice + distanceCharge + fuelSurcharge;
  const finalPrice = totalPrice;

  return {
    serviceId: service.id,
    basePrice,
    distanceKm,
    distanceCharge,
    fuelSurcharge,
    totalPrice,
    finalPrice
  };
};

/**
 * Create a new booking for a farmer.
 */
export const createBookingRequest = async (farmerId, bookingData) => {
  const { serviceType, landSize, location } = bookingData;

  const pricing = await calculateBookingPrice(serviceType, landSize);

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
