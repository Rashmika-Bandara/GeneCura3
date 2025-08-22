const Audit = require('../models/Audit');
const logger = require('../utils/logger');

// Create audit trail for CRUD operations
const createAuditTrail = (entity) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(body) {
      // Only audit successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Determine action based on method
        let action;
        switch (req.method) {
          case 'POST':
            action = 'create';
            break;
          case 'PUT':
          case 'PATCH':
            action = 'update';
            break;
          case 'DELETE':
            action = 'delete';
            break;
          default:
            action = null;
        }

        if (action && req.user) {
          // Create audit record
          const auditData = {
            entity,
            entity_id: req.params.id || (body.data && body.data.id) || 'unknown',
            actor_role: req.user.role,
            actor_id: req.user.user_id,
            action,
            before: req.originalResource || null,
            after: action === 'delete' ? null : (body.data || body),
            correlationId: req.correlationId
          };

          Audit.create(auditData).catch(error => {
            logger.error('Failed to create audit trail:', error);
          });
        }
      }

      // Call original json method
      return originalJson.call(this, body);
    };

    next();
  };
};

module.exports = {
  createAuditTrail
};
