import prisma from '../config/db.js';

const allowedTransitions = {
  scheduled: ['dispatched', 'cancelled'],
  dispatched: ['en_route'],
  en_route: ['in_progress'],
  in_progress: ['completed'],
  completed: ['paid'],
  paid: [],
  cancelled: []
};

// Returns operator specific jobs split into current and queue
export const getOperatorJobs = async (operatorId) => {
  const jobs = await prisma.booking.findMany({
    where: { operatorId: parseInt(operatorId) },
    include: {
      farmer: { select: { name: true, phone: true } },
      service: { select: { name: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Current job is anything that is active
  const currentJob = jobs.find(j => ['dispatched', 'en_route', 'in_progress'].includes(j.status));
  // Queue is all other dispatched jobs
  const queue = jobs.filter(j => j.status === 'dispatched' && j.id !== currentJob?.id);

  return {
    current_job: currentJob || null,
    queue: queue
  };
};

export const getOperatorStats = async (operatorId) => {
  // Calculate total hectares from completed bookings
  const completedStats = await prisma.booking.aggregate({
    where: {
      operatorId: parseInt(operatorId),
      status: 'completed'
    },
    _sum: {
      landSize: true
    }
  });

  // Mocking the other telemetry data for now as per PRD
  return {
    hectares_done: completedStats._sum.landSize || 0,
    fuel_efficiency: 4.2, // Hardcoded L/HA for now
    shift_time: "06:12",   // Mocked
    unit_health: 98       // Mocked %
  };
};

export const updateJobStatus = async (operatorId, bookingId, nextStatus) => {
  // 1. Fetch existing booking
  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(bookingId) }
  });

  if (!booking) {
    throw new Error('NOT_FOUND: Booking does not exist');
  }

  // 2. Validate Operator Ownership
  if (booking.operatorId !== parseInt(operatorId)) {
    throw new Error('FORBIDDEN: You do not have permission to update this booking');
  }

  // 3. Idempotency Check
  if (booking.status === nextStatus) {
    return booking; // Already at the requested status
  }

  // 4. Strict State Machine Validation
  const currentAllowed = allowedTransitions[booking.status] || [];
  if (!currentAllowed.includes(nextStatus)) {
    throw new Error(`INVALID_TRANSITION: Cannot transition from ${booking.status} to ${nextStatus}`);
  }

  // 5. Transaction or Standard Update depending on target state
  if (nextStatus === 'completed') {
    // Requires transaction to free resources
    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'completed' }
      }),
      prisma.user.update({
        where: { id: booking.operatorId },
        data: { availability: 'available' }
      }),
      prisma.tractor.update({
        where: { id: booking.tractorId },
        data: { status: 'available' }
      })
    ]);
    return updatedBooking;
  } else {
    // Normal progress update (en_route, in_progress)
    return await prisma.booking.update({
      where: { id: booking.id },
      data: { status: nextStatus }
    });
  }
};
