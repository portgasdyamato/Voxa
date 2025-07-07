import { Pool } from '@neondatabase/serverless';
import { memoryStore } from './memory-store.js';

// Initialize database connection
let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    console.log('Request URL:', url.pathname, 'Method:', req.method);

    const currentUser = {
      id: 1,
      email: 'demo@voxa.app',
      firstName: 'Demo',
      lastName: 'User'
    };

    // Use database if available, otherwise use memory store
    const useDatabase = !!process.env.DATABASE_URL;
    console.log('Using database:', useDatabase);

    // Health check endpoint
    if (url.pathname === '/api/health') {
      let dbStatus = 'not_configured';
      if (useDatabase) {
        try {
          const testClient = getPool();
          await testClient.query('SELECT 1');
          dbStatus = 'connected';
        } catch (error) {
          dbStatus = `connection_error: ${error.message}`;
        }
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        storage: useDatabase ? 'database' : 'memory',
        database: {
          status: dbStatus,
          url_configured: !!process.env.DATABASE_URL
        }
      }, null, 2));
      return;
    }

    // Tasks endpoints
    if (url.pathname === '/api/tasks') {
      if (req.method === 'GET') {
        const todayOnly = url.searchParams.get('today') === 'true';
        
        if (useDatabase) {
          try {
            const client = getPool();
            let query = `
              SELECT t.*, c.name as category_name, c.color as category_color 
              FROM tasks t 
              LEFT JOIN categories c ON t.category_id = c.id 
              WHERE t.user_id = $1
            `;
            
            if (todayOnly) {
              query += ` AND DATE(t.created_at) = CURRENT_DATE`;
            }
            
            query += ` ORDER BY t.created_at DESC`;
            
            const result = await client.query(query, [currentUser.id]);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result.rows));
            return;
          } catch (error) {
            console.error('Database error, falling back to memory store:', error);
          }
        }
        
        // Fallback to memory store
        const tasks = memoryStore.getTasks(currentUser.id, todayOnly);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(tasks));
        return;
      }
      
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const taskData = JSON.parse(body);
            console.log('Creating task:', taskData);
            
            if (useDatabase) {
              try {
                const client = getPool();
                const result = await client.query(
                  `INSERT INTO tasks (title, description, completed, priority, due_date, category_id, user_id) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                  [
                    taskData.title,
                    taskData.description || null,
                    taskData.completed || false,
                    taskData.priority || 'medium',
                    taskData.dueDate || null,
                    taskData.categoryId || null,
                    currentUser.id
                  ]
                );
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result.rows[0]));
                return;
              } catch (error) {
                console.error('Database error, falling back to memory store:', error);
              }
            }
            
            // Fallback to memory store
            const newTask = memoryStore.createTask(taskData, currentUser.id);
            console.log('Created task:', newTask);
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
    }

    // Task by ID endpoints
    if (url.pathname.startsWith('/api/tasks/') && url.pathname !== '/api/tasks/today') {
      const taskId = url.pathname.split('/')[3];
      
      if (req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const updates = JSON.parse(body);
            console.log('Updating task:', taskId, updates);
            
            if (useDatabase) {
              try {
                const client = getPool();
                const result = await client.query(
                  `UPDATE tasks SET 
                   title = COALESCE($1, title),
                   description = COALESCE($2, description),
                   completed = COALESCE($3, completed),
                   priority = COALESCE($4, priority),
                   due_date = COALESCE($5, due_date),
                   category_id = COALESCE($6, category_id),
                   updated_at = NOW()
                   WHERE id = $7 AND user_id = $8
                   RETURNING *`,
                  [
                    updates.title,
                    updates.description,
                    updates.completed,
                    updates.priority,
                    updates.dueDate,
                    updates.categoryId,
                    taskId,
                    currentUser.id
                  ]
                );
                
                if (result.rows.length === 0) {
                  res.statusCode = 404;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Task not found' }));
                  return;
                }
                
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result.rows[0]));
                return;
              } catch (error) {
                console.error('Database error, falling back to memory store:', error);
              }
            }
            
            // Fallback to memory store
            const updatedTask = memoryStore.updateTask(taskId, updates, currentUser.id);
            if (!updatedTask) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Task not found' }));
              return;
            }
            
            console.log('Updated task:', updatedTask);
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
      
      if (req.method === 'DELETE') {
        console.log('Deleting task:', taskId);
        
        if (useDatabase) {
          try {
            const client = getPool();
            const result = await client.query(
              'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
              [taskId, currentUser.id]
            );
            
            if (result.rows.length === 0) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Task not found' }));
              return;
            }
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          } catch (error) {
            console.error('Database error, falling back to memory store:', error);
          }
        }
        
        // Fallback to memory store
        const deleted = memoryStore.deleteTask(taskId, currentUser.id);
        if (!deleted) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Task not found' }));
          return;
        }
        
        console.log('Deleted task:', taskId);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
        return;
      }
    }

    // Categories endpoints
    if (url.pathname === '/api/categories') {
      if (req.method === 'GET') {
        if (useDatabase) {
          try {
            const client = getPool();
            const result = await client.query(
              'SELECT * FROM categories WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at ASC',
              [currentUser.id]
            );
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result.rows));
            return;
          } catch (error) {
            console.error('Database error, falling back to memory store:', error);
          }
        }
        
        // Fallback to memory store
        const categories = memoryStore.getCategories(currentUser.id);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(categories));
        return;
      }
      
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const categoryData = JSON.parse(body);
            console.log('Creating category:', categoryData);
            
            if (useDatabase) {
              try {
                const client = getPool();
                const result = await client.query(
                  'INSERT INTO categories (name, color, user_id) VALUES ($1, $2, $3) RETURNING *',
                  [categoryData.name, categoryData.color, currentUser.id]
                );
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result.rows[0]));
                return;
              } catch (error) {
                console.error('Database error, falling back to memory store:', error);
              }
            }
            
            // Fallback to memory store
            const newCategory = memoryStore.createCategory(categoryData, currentUser.id);
            console.log('Created category:', newCategory);
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
    }

    // Stats endpoints
    if (url.pathname === '/api/stats') {
      if (req.method === 'GET') {
        if (useDatabase) {
          try {
            const client = getPool();
            const totalTasks = await client.query(
              'SELECT COUNT(*) FROM tasks WHERE user_id = $1',
              [currentUser.id]
            );
            const completedTasks = await client.query(
              'SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND completed = true',
              [currentUser.id]
            );
            const pendingTasks = await client.query(
              'SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND completed = false',
              [currentUser.id]
            );
            const overdueTasks = await client.query(
              'SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND completed = false AND due_date < NOW()',
              [currentUser.id]
            );
            
            const total = parseInt(totalTasks.rows[0].count);
            const completed = parseInt(completedTasks.rows[0].count);
            const pending = parseInt(pendingTasks.rows[0].count);
            const overdue = parseInt(overdueTasks.rows[0].count);
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              totalTasks: total,
              completedTasks: completed,
              pendingTasks: pending,
              overdueTasks: overdue,
              completionRate,
              period: 'all',
              chartData: []
            }));
            return;
          } catch (error) {
            console.error('Database error, falling back to memory store:', error);
          }
        }
        
        // Fallback to memory store
        const stats = memoryStore.getStats(currentUser.id);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(stats));
        return;
      }
    }

    // Debug endpoint
    if (url.pathname === '/api/debug') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        storage: useDatabase ? 'database' : 'memory',
        memoryStore: memoryStore.getStore(),
        timestamp: new Date().toISOString()
      }, null, 2));
      return;
    }

    // 404 for unknown endpoints
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  } catch (error) {
    console.error('Handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message }));
  }
}
