import mongoose from 'mongoose';
import {
  ACTIVITY_ACTION_LIST,
  ACTIVITY_ENTITY_TYPE_LIST,
} from '../constants/activity.js';

const activitySchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity actor is required'],
      index: true,
    },
    action: {
      type: String,
      enum: {
        values: ACTIVITY_ACTION_LIST,
        message: '{VALUE} is not a valid activity action',
      },
      required: [true, 'Activity action is required'],
      index: true,
    },
    entityType: {
      type: String,
      enum: {
        values: ACTIVITY_ENTITY_TYPE_LIST,
        message: '{VALUE} is not a supported activity entity type',
      },
      required: [true, 'Activity entity type is required'],
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Helpful Compound Indexes for feed and audit queries
activitySchema.index({ createdAt: -1 });
activitySchema.index({ actor: 1, createdAt: -1 });
activitySchema.index({ entityType: 1, entityId: 1 });

/**
 * Returns safe serialized activity record
 */
activitySchema.methods.toSafeObject = function () {
  let actorData = null;
  if (this.actor) {
    if (this.actor._id) {
      actorData = {
        id: this.actor._id.toString(),
        name: this.actor.name,
        email: this.actor.email,
        role: this.actor.role,
        jobTitle: this.actor.jobTitle,
      };
    } else {
      actorData = { id: this.actor.toString() };
    }
  }

  return {
    id: this._id.toString(),
    actor: actorData,
    action: this.action,
    entityType: this.entityType,
    entityId: this.entityId ? this.entityId.toString() : null,
    description: this.description,
    metadata: this.metadata || {},
    createdAt: this.createdAt,
  };
};

export const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
