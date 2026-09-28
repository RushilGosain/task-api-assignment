const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('create()', () => {
    test('should create a task with default values', () => {
      const task = taskService.create({
        title: 'Learn Jest',
      });

      expect(task).toEqual(
        expect.objectContaining({
          title: 'Learn Jest',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: null,
          completedAt: null,
        })
      );

      expect(task.id).toEqual(expect.any(String));
      expect(task.createdAt).toEqual(expect.any(String));
    });

    test('should create a task with supplied values', () => {
      const task = taskService.create({
        title: 'Build API',
        description: 'Build the task API',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2030-01-01T00:00:00.000Z',
      });

      expect(task).toEqual(
        expect.objectContaining({
          title: 'Build API',
          description: 'Build the task API',
          status: 'in_progress',
          priority: 'high',
          dueDate: '2030-01-01T00:00:00.000Z',
        })
      );
    });
  });

  describe('getAll()', () => {
    test('should return all tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const tasks = taskService.getAll();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');
    });

    test('should return an empty array when there are no tasks', () => {
      expect(taskService.getAll()).toEqual([]);
    });
  });

  describe('findById()', () => {
    test('should find a task by id', () => {
      const created = taskService.create({ title: 'Find me' });

      const found = taskService.findById(created.id);

      expect(found).toEqual(created);
    });

    test('should return undefined for an unknown id', () => {
      expect(taskService.findById('does-not-exist')).toBeUndefined();
    });
  });

  describe('getByStatus()', () => {
    test('should return tasks matching the requested status', () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      taskService.create({
        title: 'Progress task',
        status: 'in_progress',
      });

      taskService.create({
        title: 'Done task',
        status: 'done',
      });

      const result = taskService.getByStatus('todo');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Todo task');
    });

    test('should return an empty array when no tasks match', () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      expect(taskService.getByStatus('done')).toEqual([]);
    });
  });

  describe('getPaginated()', () => {
    beforeEach(() => {
      for (let i = 1; i <= 25; i++) {
        taskService.create({
          title: `Task ${i}`,
        });
      }
    });

    test('should return the first page correctly', () => {
      const result = taskService.getPaginated(1, 10);

      expect(result).toHaveLength(10);
      expect(result[0].title).toBe('Task 1');
      expect(result[9].title).toBe('Task 10');
    });

    test('should return the second page correctly', () => {
      const result = taskService.getPaginated(2, 10);

      expect(result).toHaveLength(10);
      expect(result[0].title).toBe('Task 11');
      expect(result[9].title).toBe('Task 20');
    });

    test('should return remaining tasks on the last page', () => {
      const result = taskService.getPaginated(3, 10);

      expect(result).toHaveLength(5);
      expect(result[0].title).toBe('Task 21');
      expect(result[4].title).toBe('Task 25');
    });
  });

  describe('update()', () => {
    test('should update an existing task', () => {
      const task = taskService.create({
        title: 'Original title',
      });

      const updated = taskService.update(task.id, {
        title: 'Updated title',
        priority: 'high',
      });

      expect(updated.title).toBe('Updated title');
      expect(updated.priority).toBe('high');
      expect(updated.id).toBe(task.id);
    });

    test('should return null for an unknown task', () => {
      const result = taskService.update('does-not-exist', {
        title: 'Updated',
      });

      expect(result).toBeNull();
    });
  });

  describe('remove()', () => {
    test('should remove an existing task', () => {
      const task = taskService.create({
        title: 'Delete me',
      });

      expect(taskService.remove(task.id)).toBe(true);
      expect(taskService.findById(task.id)).toBeUndefined();
    });

    test('should return false for an unknown task', () => {
      expect(taskService.remove('does-not-exist')).toBe(false);
    });
  });

  describe('completeTask()', () => {
    test('should mark a task as done and set completedAt', () => {
      const task = taskService.create({
        title: 'Complete me',
        priority: 'high',
      });

      const completed = taskService.completeTask(task.id);

      expect(completed.status).toBe('done');
      expect(completed.completedAt).toEqual(expect.any(String));
    });

    test('should preserve the task priority when completing it', () => {
      const task = taskService.create({
        title: 'High priority task',
        priority: 'high',
      });

      const completed = taskService.completeTask(task.id);

      expect(completed.priority).toBe('high');
    });

    test('should return null for an unknown task', () => {
      expect(taskService.completeTask('does-not-exist')).toBeNull();
    });
  });

  describe('getStats()', () => {
    test('should count tasks by status', () => {
      taskService.create({
        title: 'Todo',
        status: 'todo',
      });

      taskService.create({
        title: 'Progress',
        status: 'in_progress',
      });

      taskService.create({
        title: 'Done',
        status: 'done',
      });

      const stats = taskService.getStats();

      expect(stats.todo).toBe(1);
      expect(stats.in_progress).toBe(1);
      expect(stats.done).toBe(1);
    });

    test('should count overdue unfinished tasks', () => {
      taskService.create({
        title: 'Overdue',
        dueDate: '2020-01-01T00:00:00.000Z',
        status: 'todo',
      });

      taskService.create({
        title: 'Completed old task',
        dueDate: '2020-01-01T00:00:00.000Z',
        status: 'done',
      });

      const stats = taskService.getStats();

      expect(stats.overdue).toBe(1);
    });
  });
});