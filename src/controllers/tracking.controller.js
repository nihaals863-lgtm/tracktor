import { PrismaClient } from '@prisma/client';
import { emitLocationUpdate } from '../services/socket.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

const prisma = new PrismaClient();

export const updateLocation = async (req, res) => {
    try {
        const { operator_id, latitude, longitude, status } = req.body;

        if (!operator_id || latitude === undefined || longitude === undefined) {
            return sendError(res, 'operator_id, latitude, and longitude are required', 400);
        }

        // 1. Validate operator exists in User table
        const operator = await prisma.user.findUnique({
            where: { id: parseInt(operator_id) }
        });

        if (!operator || operator.role !== 'operator') {
            return sendError(res, 'Invalid operator ID', 404);
        }

        // 2. Update or Create OperatorLocation
        const location = await prisma.operatorLocation.upsert({
            where: { operatorId: parseInt(operator_id) },
            update: {
                currentLat: latitude,
                currentLng: longitude,
                status: status || 'AVAILABLE',
                lastUpdated: new Date()
            },
            create: {
                operatorId: parseInt(operator_id),
                name: operator.name,
                currentLat: latitude,
                currentLng: longitude,
                status: status || 'AVAILABLE'
            }
        });

        // 3. Optional: Create TrackingLog
        await prisma.trackingLog.create({
            data: {
                operatorId: parseInt(operator_id),
                lat: latitude,
                lng: longitude
            }
        });

        // 4. Emit Socket Event
        emitLocationUpdate({
            operator_id,
            latitude,
            longitude,
            status: location.status,
            name: operator.name,
            last_updated: location.lastUpdated
        });

        return sendSuccess(res, location, 'Location updated successfully');
    } catch (error) {
        console.error('Update Location Error:', error);
        return sendError(res, error.message, 500);
    }
};

export const getLatestLocations = async (req, res) => {
    try {
        const locations = await prisma.operatorLocation.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        return sendSuccess(res, locations, 'Latest operator locations fetched');
    } catch (error) {
        console.error('Get Latest Locations Error:', error);
        return sendError(res, error.message, 500);
    }
};
