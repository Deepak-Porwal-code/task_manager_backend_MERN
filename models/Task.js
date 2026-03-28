import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'in_review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  estimatedTime: {
    type: Number,
    min: 0
  },
  actualTime: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String
  },
  orderIndex: {
    type: Number,
    default: 0
  },
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', null]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for subtasks
taskSchema.virtual('subtasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'parentTask'
});

// Middleware to set completedAt when status changes to done
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = null;
    }
  }
  next();
});

// Index for better query performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
