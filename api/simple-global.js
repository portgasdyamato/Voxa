// Ultra-simple persistent in-memory storage for Vercel serverless functions
// This uses a global object that persists across function calls

// Global store that persists across function calls
global.voxaStore = global.voxaStore || {
  tasks: [
    {
      id: 1,
      title: "Welcome to VoXa!",
      description: "This is your first task. Try creating more tasks using voice commands or the manual task button.",
      completed: false,
      priority: "medium",
      category_id: 1,
      category_name: "Work",
      category_color: "#3B82F6",
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  categories: [
    { id: 1, name: "Work", color: "#3B82F6", user_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, name: "Personal", color: "#10B981", user_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, name: "Shopping", color: "#F59E0B", user_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, name: "Health", color: "#EF4444", user_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 5, name: "Learning", color: "#8B5CF6", user_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  nextTaskId: 2,
  nextCategoryId: 6
};

export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const store = global.voxaStore;
    
    console.log(`${req.method} ${url.pathname}`);
    console.log('Current store state:', { taskCount: store.tasks.length, categoryCount: store.categories.length });

    // Health check
    if (url.pathname === '/api/health') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        storage: 'global_memory',
        taskCount: store.tasks.length,
        categoryCount: store.categories.length
      }));
      return;
    }

    // Debug endpoint
    if (url.pathname === '/api/debug') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        storage: 'global_memory',
        store: store,
        timestamp: new Date().toISOString()
      }, null, 2));
      return;
    }

    // GET /api/tasks
    if (url.pathname === '/api/tasks' && req.method === 'GET') {
      const todayOnly = url.searchParams.get('today') === 'true';
      let tasks = store.tasks;
      
      if (todayOnly) {
        const today = new Date().toISOString().split('T')[0];
        tasks = tasks.filter(task => task.created_at.startsWith(today));
      }
      
      console.log('Returning tasks:', tasks.length);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(tasks));
      return;
    }

    // POST /api/tasks
    if (url.pathname === '/api/tasks' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const taskData = JSON.parse(body);
          console.log('Creating task:', taskData);
          
          const category = store.categories.find(c => c.id === taskData.categoryId);
          const newTask = {
            id: store.nextTaskId++,
            title: taskData.title,
            description: taskData.description || null,
            completed: taskData.completed || false,
            priority: taskData.priority || 'medium',
            category_id: taskData.categoryId || null,
            category_name: category ? category.name : null,
            category_color: category ? category.color : null,
            user_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            due_date: taskData.dueDate || null
          };
          
          store.tasks.push(newTask);
          console.log('Task created:', newTask);
          console.log('Total tasks now:', store.tasks.length);
          
          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(newTask));
        } catch (error) {
          console.error('Task creation error:', error);
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // PATCH/PUT /api/tasks/:id
    if (url.pathname.startsWith('/api/tasks/') && (req.method === 'PATCH' || req.method === 'PUT')) {
      const taskId = parseInt(url.pathname.split('/')[3]);
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const updates = JSON.parse(body);
          console.log('Updating task:', taskId, updates);
          
          const taskIndex = store.tasks.findIndex(t => t.id === taskId);
          if (taskIndex === -1) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Task not found' }));
            return;
          }
          
          const task = store.tasks[taskIndex];
          const updatedTask = {
            ...task,
            ...updates,
            updated_at: new Date().toISOString()
          };
          
          // Update category info if category changed
          if (updates.categoryId) {
            const category = store.categories.find(c => c.id === updates.categoryId);
            if (category) {
              updatedTask.category_id = updates.categoryId;
              updatedTask.category_name = category.name;
              updatedTask.category_color = category.color;
            }
          }
          
          store.tasks[taskIndex] = updatedTask;
          console.log('Task updated:', updatedTask);
          
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(updatedTask));
        } catch (error) {
          console.error('Task update error:', error);
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // DELETE /api/tasks/:id
    if (url.pathname.startsWith('/api/tasks/') && req.method === 'DELETE') {
      const taskId = parseInt(url.pathname.split('/')[3]);
      console.log('Deleting task:', taskId);
      
      const taskIndex = store.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Task not found' }));
        return;
      }
      
      store.tasks.splice(taskIndex, 1);
      console.log('Task deleted, remaining tasks:', store.tasks.length);
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // GET /api/categories
    if (url.pathname === '/api/categories' && req.method === 'GET') {
      console.log('Returning categories:', store.categories.length);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(store.categories));
      return;
    }

    // POST /api/categories
    if (url.pathname === '/api/categories' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const categoryData = JSON.parse(body);
          console.log('Creating category:', categoryData);
          
          const newCategory = {
            id: store.nextCategoryId++,
            name: categoryData.name,
            color: categoryData.color,
            user_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          store.categories.push(newCategory);
          console.log('Category created:', newCategory);
          
          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(newCategory));
        } catch (error) {
          console.error('Category creation error:', error);
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // GET /api/stats
    if (url.pathname === '/api/stats' && req.method === 'GET') {
      const totalTasks = store.tasks.length;
      const completedTasks = store.tasks.filter(task => task.completed).length;
      const pendingTasks = totalTasks - completedTasks;
      
      // Calculate overdue tasks
      const now = new Date();
      const overdueTasks = store.tasks.filter(task => 
        !task.completed && 
        task.due_date && 
        new Date(task.due_date) < now
      ).length;
      
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      const stats = {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate,
        period: 'all',
        chartData: []
      };
      
      console.log('Returning stats:', stats);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(stats));
      return;
    }

    // 404 for unknown endpoints
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: `Endpoint not found: ${req.method} ${url.pathname}` }));
  } catch (error) {
    console.error('Handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message }));
  }
}
