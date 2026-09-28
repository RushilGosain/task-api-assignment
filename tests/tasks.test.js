const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('GET /tasks', () => {
    test('should return an empty array when there are no tasks', async () => {
      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return all tasks', async () => {
      await request(app)
        .post('/tasks')
        .send({
          title: 'Task 1',
        });

      await request(app)
        .post('/tasks')
        .send({
          title: 'Task 2',
        });

      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Task 1');
      expect(response.body[1].title).toBe('Task 2');
    });
  });

  describe('GET /tasks?status=', () => {
    beforeEach(() => {
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
    });

    test('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/tasks')
        .query({ status: 'todo' })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('todo');
    });

    test('should return an empty array for a status with no matches', async () => {
      const response = await request(app)
        .get('/tasks')
        .query({ status: 'invalid-status' })
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /tasks?page=&limit=', () => {
    beforeEach(() => {
      for (let i = 1; i <= 15; i++) {
        taskService.create({
          title: `Task ${i}`,
        });
      }
    });

    test('should return the first page', async () => {
      const response = await request(app)
        .get('/tasks')
        .query({
          page: 1,
          limit: 10,
        })
        .expect(200);

      expect(response.body).toHaveLength(10);
      expect(response.body[0].title).toBe('Task 1');
      expect(response.body[9].title).toBe('Task 10');
    });

    test('should return the second page', async () => {
      const response = await request(app)
        .get('/tasks')
        .query({
          page: 2,
          limit: 10,
        })
        .expect(200);

      expect(response.body).toHaveLength(5);
      expect(response.body[0].title).toBe('Task 11');
    });
  });

  describe('POST /tasks', () => {
    test('should create a task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Write tests',
          description: 'Test the API',
          priority: 'high',
        })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          title: 'Write tests',
          description: 'Test the API',
          priority: 'high',
          status: 'todo',
          completedAt: null,
        })
      );

      expect(response.body.id).toEqual(expect.any(String));
      expect(response.body.createdAt).toEqual(expect.any(String));
    });

    test('should reject a missing title', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          priority: 'high',
        })
        .expect(400);

      expect(response.body.error).toBe(
        'title is required and must be a non-empty string'
      );
    });

    test('should reject an empty title', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: '   ',
        })
        .expect(400);

      expect(response.body.error).toBe(
        'title is required and must be a non-empty string'
      );
    });

    test('should reject an invalid status', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Invalid task',
          status: 'pending',
        })
        .expect(400);

      expect(response.body.error).toContain('status must be one of');
    });

    test('should reject an invalid priority', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Invalid task',
          priority: 'urgent',
        })
        .expect(400);

      expect(response.body.error).toContain('priority must be one of');
    });
  });

  describe('PUT /tasks/:id', () => {
    test('should update an existing task', async () => {
      const task = taskService.create({
        title: 'Original title',
        priority: 'low',
      });

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
          title: 'Updated title',
          priority: 'high',
        })
        .expect(200);

      expect(response.body.title).toBe('Updated title');
      expect(response.body.priority).toBe('high');
      expect(response.body.id).toBe(task.id);
    });

    test('should return 404 for an unknown task', async () => {
      const response = await request(app)
        .put('/tasks/does-not-exist')
        .send({
          title: 'Updated',
        })
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    test('should reject an empty title', async () => {
      const task = taskService.create({
        title: 'Original',
      });

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
          title: '',
        })
        .expect(400);

      expect(response.body.error).toBe(
        'title must be a non-empty string'
      );
    });
  });

  describe('DELETE /tasks/:id', () => {
    test('should delete an existing task', async () => {
      const task = taskService.create({
        title: 'Delete me',
      });

      await request(app)
        .delete(`/tasks/${task.id}`)
        .expect(204);

      expect(taskService.findById(task.id)).toBeUndefined();
    });

    test('should return 404 for an unknown task', async () => {
      const response = await request(app)
        .delete('/tasks/does-not-exist')
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    test('should mark a task as complete', async () => {
      const task = taskService.create({
        title: 'Complete me',
        priority: 'high',
      });

      const response = await request(app)
        .patch(`/tasks/${task.id}/complete`)
        .expect(200);

      expect(response.body.status).toBe('done');
      expect(response.body.completedAt).toEqual(expect.any(String));
    });

    test('should preserve priority when completing a task', async () => {
      const task = taskService.create({
        title: 'Important task',
        priority: 'high',
      });

      const response = await request(app)
        .patch(`/tasks/${task.id}/complete`)
        .expect(200);

      expect(response.body.priority).toBe('high');
    });

    test('should return 404 for an unknown task', async () => {
      const response = await request(app)
        .patch('/tasks/does-not-exist/complete')
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('GET /tasks/stats', () => {
    test('should return task counts by status', async () => {
      taskService.create({
        title: 'Todo',
        status: 'todo',
      });

      taskService.create({
        title: 'In progress',
        status: 'in_progress',
      });

      taskService.create({
        title: 'Done',
        status: 'done',
      });

      const response = await request(app)
        .get('/tasks/stats')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          todo: 1,
          in_progress: 1,
          done: 1,
        })
      );
    });

    test('should count overdue unfinished tasks', async () => {
      taskService.create({
        title: 'Overdue task',
        status: 'todo',
        dueDate: '2020-01-01T00:00:00.000Z',
      });

      const response = await request(app)
        .get('/tasks/stats')
        .expect(200);

      expect(response.body.overdue).toBe(1);
    });
  });
});
describe('PATCH /tasks/:id/assign', () => {
  test('assigns a task to a valid assignee', async () => {
    const task = await request(app)
      .post('/tasks')
      .send({
        title: 'Task to assign',
        priority: 'high',
      });

    const response = await request(app)
      .patch(`/tasks/${task.body.id}/assign`)
      .send({
        assignee: 'Rushil',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(task.body.id);
    expect(response.body.assignee).toBe('Rushil');
  });

  test('returns 400 when assignee is an empty string', async () => {
    const task = await request(app)
      .post('/tasks')
      .send({
        title: 'Task to assign',
      });

    const response = await request(app)
      .patch(`/tasks/${task.body.id}/assign`)
      .send({
        assignee: '',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      'assignee must be a non-empty string'
    );
  });

  test('returns 400 when assignee is only whitespace', async () => {
    const task = await request(app)
      .post('/tasks')
      .send({
        title: 'Task to assign',
      });

    const response = await request(app)
      .patch(`/tasks/${task.body.id}/assign`)
      .send({
        assignee: '   ',
      });

    expect(response.statusCode).toBe(400);
  });

  test('returns 400 when assignee is not a string', async () => {
    const task = await request(app)
      .post('/tasks')
      .send({
        title: 'Task to assign',
      });

    const response = await request(app)
      .patch(`/tasks/${task.body.id}/assign`)
      .send({
        assignee: 123,
      });

    expect(response.statusCode).toBe(400);
  });

  test('returns 404 when task does not exist', async () => {
    const response = await request(app)
      .patch('/tasks/non-existent-id/assign')
      .send({
        assignee: 'Rushil',
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  test('reassigns a task when it already has an assignee', async () => {
    const task = await request(app)
      .post('/tasks')
      .send({
        title: 'Task to reassign',
      });

    await request(app)
      .patch(`/tasks/${task.body.id}/assign`)
      .send({
        assignee: 'First User',
      });

    const response = await request(app)
      .patch(`/tasks/${task.body.id}/assign`)
      .send({
        assignee: 'Second User',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.assignee).toBe('Second User');
  });
});