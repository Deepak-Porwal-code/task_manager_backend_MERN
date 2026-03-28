import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// List tasks with filters
router.get('/', async (req, res, next) => {
  try {
    const { project_id, status, assignee_id, priority } = req.query;

    // Get user's projects
    const userProjects = await Project.find({ owner: req.user._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const filter = { project: { $in: projectIds } };

    if (project_id) filter.project = project_id;
    if (status) filter.status = status;
    if (assignee_id) filter.assignee = assignee_id;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      tasks: tasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        project_id: task.project,
        assignee_id: task.assignee,
        due_date: task.dueDate,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
        completed_at: task.completedAt,
        estimated_time: task.estimatedTime,
        actual_time: task.actualTime,
        tags: task.tags || [],
        notes: task.notes,
        order_index: task.orderIndex,
        parent_task_id: task.parentTask,
        is_recurring: task.isRecurring,
        recurrence_pattern: task.recurrencePattern
      })),
      total: tasks.length
    });
  } catch (error) {
    next(error);
  }
});

// Create task
router.post('/', [
  body('title').notEmpty().trim().withMessage('Task title is required'),
  body('project_id').notEmpty().withMessage('Project ID is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation Error', errors: errors.array() });
    }

    const {
      title, description, project_id, status, priority,
      assignee_id, due_date, estimated_time, tags, notes,
      parent_task_id, is_recurring, recurrence_pattern
    } = req.body;

    // Verify project ownership
    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Verify assignee if provided
    if (assignee_id) {
      const assignee = await User.findById(assignee_id);
      if (!assignee || !assignee.isActive) {
        return res.status(400).json({ message: 'Invalid assignee' });
      }
    }

    const task = await Task.create({
      title,
      description,
      project: project_id,
      status: status || 'todo',
      priority: priority || 'medium',
      assignee: assignee_id,
      dueDate: due_date,
      estimatedTime: estimated_time,
      tags: tags || [],
      notes,
      parentTask: parent_task_id,
      isRecurring: is_recurring || false,
      recurrencePattern: recurrence_pattern
    });

    // Get subtasks if any
    const subtasks = await Task.find({ parentTask: task._id }).lean();

    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        project_id: task.project,
        assignee_id: task.assignee,
        due_date: task.dueDate,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
        completed_at: task.completedAt,
        estimated_time: task.estimatedTime,
        actual_time: task.actualTime,
        tags: task.tags || [],
        notes: task.notes,
        order_index: task.orderIndex,
        parent_task_id: task.parentTask,
        is_recurring: task.isRecurring,
        recurrence_pattern: task.recurrencePattern,
        subtasks: subtasks.map(st => ({
          id: st._id,
          title: st.title,
          status: st.status,
          priority: st.priority
        })),
        subtasks_count: subtasks.length,
        subtasks_completed: subtasks.filter(st => st.status === 'done').length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get task by ID
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).lean();

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify ownership through project
    const project = await Project.findById(task.project);
    if (!project || project.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      project_id: task.project,
      assignee_id: task.assignee,
      due_date: task.dueDate,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
      completed_at: task.completedAt,
      estimated_time: task.estimatedTime,
      actual_time: task.actualTime,
      tags: task.tags || [],
      notes: task.notes,
      order_index: task.orderIndex,
      parent_task_id: task.parentTask,
      is_recurring: task.isRecurring,
      recurrence_pattern: task.recurrencePattern
    });
  } catch (error) {
    next(error);
  }
});

// Update task
router.put('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify ownership through project
    const project = await Project.findById(task.project);
    if (!project || project.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const {
      title, description, status, priority, assignee_id,
      due_date, estimated_time, actual_time, tags, notes, order_index
    } = req.body;

    // Verify assignee if being updated
    if (assignee_id) {
      const assignee = await User.findById(assignee_id);
      if (!assignee || !assignee.isActive) {
        return res.status(400).json({ message: 'Invalid assignee' });
      }
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignee_id !== undefined) task.assignee = assignee_id;
    if (due_date !== undefined) task.dueDate = due_date;
    if (estimated_time !== undefined) task.estimatedTime = estimated_time;
    if (actual_time !== undefined) task.actualTime = actual_time;
    if (tags !== undefined) task.tags = tags;
    if (notes !== undefined) task.notes = notes;
    if (order_index !== undefined) task.orderIndex = order_index;

    await task.save();

    // Get subtasks
    const subtasks = await Task.find({ parentTask: task._id }).lean();

    res.json({
      message: 'Task updated successfully',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        project_id: task.project,
        assignee_id: task.assignee,
        due_date: task.dueDate,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
        completed_at: task.completedAt,
        estimated_time: task.estimatedTime,
        actual_time: task.actualTime,
        tags: task.tags || [],
        notes: task.notes,
        order_index: task.orderIndex,
        parent_task_id: task.parentTask,
        is_recurring: task.isRecurring,
        recurrence_pattern: task.recurrencePattern,
        subtasks: subtasks.map(st => ({
          id: st._id,
          title: st.title,
          status: st.status,
          priority: st.priority
        })),
        subtasks_count: subtasks.length,
        subtasks_completed: subtasks.filter(st => st.status === 'done').length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete task
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify ownership through project
    const project = await Project.findById(task.project);
    if (!project || project.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Add time to task (Pomodoro)
router.post('/:id/time', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify ownership through project
    const project = await Project.findById(task.project);
    if (!project || project.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { minutes } = req.body;

    if (typeof minutes !== 'number' || minutes < 0) {
      return res.status(400).json({ message: 'Invalid minutes value' });
    }

    task.actualTime = (task.actualTime || 0) + minutes;
    await task.save();

    res.json({
      message: 'Time added successfully',
      actual_time: task.actualTime
    });
  } catch (error) {
    next(error);
  }
});

// Get subtasks
router.get('/:id/subtasks', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify ownership through project
    const project = await Project.findById(task.project);
    if (!project || project.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtasks = await Task.find({ parentTask: req.params.id }).lean();

    res.json({
      subtasks: subtasks.map(st => ({
        id: st._id,
        title: st.title,
        description: st.description,
        status: st.status,
        priority: st.priority,
        project_id: st.project,
        assignee_id: st.assignee,
        due_date: st.dueDate,
        created_at: st.createdAt,
        updated_at: st.updatedAt,
        completed_at: st.completedAt,
        estimated_time: st.estimatedTime,
        actual_time: st.actualTime,
        tags: st.tags || [],
        notes: st.notes,
        order_index: st.orderIndex,
        parent_task_id: st.parentTask,
        is_recurring: st.isRecurring,
        recurrence_pattern: st.recurrencePattern
      })),
      total: subtasks.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
