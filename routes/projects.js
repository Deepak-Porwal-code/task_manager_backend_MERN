import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// List projects
router.get('/', async (req, res, next) => {
  try {
    const includeArchived = req.query.include_archived === 'true';
    
    const filter = { owner: req.user._id };
    if (!includeArchived) {
      filter.isArchived = false;
    }

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Get task counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        return {
          id: project._id,
          name: project.name,
          description: project.description,
          owner_id: project.owner,
          is_archived: project.isArchived,
          created_at: project.createdAt,
          updated_at: project.updatedAt,
          task_count: taskCount
        };
      })
    );

    res.json({
      projects: projectsWithCounts,
      total: projectsWithCounts.length
    });
  } catch (error) {
    next(error);
  }
});

// Create project
router.post('/', [
  body('name').notEmpty().trim().withMessage('Project name is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation Error', errors: errors.array() });
    }

    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id
    });

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        owner_id: project.owner,
        is_archived: project.isArchived,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
        task_count: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get project by ID
router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).lean();

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: project._id }).lean();

    res.json({
      id: project._id,
      name: project.name,
      description: project.description,
      owner_id: project.owner,
      is_archived: project.isArchived,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
      task_count: tasks.length,
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
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Update project
router.put('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description, is_archived } = req.body;

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (is_archived !== undefined) project.isArchived = is_archived;

    await project.save();

    const taskCount = await Task.countDocuments({ project: project._id });

    res.json({
      message: 'Project updated successfully',
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        owner_id: project.owner,
        is_archived: project.isArchived,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
        task_count: taskCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete project
router.delete('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete all tasks in the project
    await Task.deleteMany({ project: project._id });
    
    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
