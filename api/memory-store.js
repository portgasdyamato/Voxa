// Simple persistent storage using edge runtime compatibility
// This provides a fallback when database is not available

let globalStore = {
  tasks: [],
  categories: [
    { id: 1, name: "Work", color: "#3B82F6", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, name: "Personal", color: "#10B981", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, name: "Shopping", color: "#F59E0B", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, name: "Health", color: "#EF4444", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 5, name: "Learning", color: "#8B5CF6", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  users: [
    {
      id: 1,
      email: 'demo@voxa.app',
      first_name: 'Demo',
      last_name: 'User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  nextTaskId: 1,
  nextCategoryId: 6,
  nextUserId: 2
};

// Initialize welcome task
if (globalStore.tasks.length === 0) {
  globalStore.tasks.push({
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
  });
  globalStore.nextTaskId = 2;
}

export const memoryStore = {
  // Task operations
  getTasks: (userId = 1, todayOnly = false) => {
    let tasks = globalStore.tasks.filter(task => task.user_id === userId);
    if (todayOnly) {
      const today = new Date().toISOString().split('T')[0];
      tasks = tasks.filter(task => task.created_at.startsWith(today));
    }
    return tasks;
  },

  createTask: (taskData, userId = 1) => {
    const category = globalStore.categories.find(c => c.id === taskData.categoryId);
    const newTask = {
      id: globalStore.nextTaskId++,
      title: taskData.title,
      description: taskData.description || null,
      completed: taskData.completed || false,
      priority: taskData.priority || 'medium',
      category_id: taskData.categoryId || null,
      category_name: category ? category.name : null,
      category_color: category ? category.color : null,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: taskData.dueDate || null
    };
    globalStore.tasks.push(newTask);
    return newTask;
  },

  updateTask: (taskId, updates, userId = 1) => {
    const taskIndex = globalStore.tasks.findIndex(t => t.id === parseInt(taskId) && t.user_id === userId);
    if (taskIndex === -1) return null;
    
    const task = globalStore.tasks[taskIndex];
    const updatedTask = {
      ...task,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Update category info if category changed
    if (updates.category_id) {
      const category = globalStore.categories.find(c => c.id === updates.category_id);
      if (category) {
        updatedTask.category_name = category.name;
        updatedTask.category_color = category.color;
      }
    }
    
    globalStore.tasks[taskIndex] = updatedTask;
    return updatedTask;
  },

  deleteTask: (taskId, userId = 1) => {
    const taskIndex = globalStore.tasks.findIndex(t => t.id === parseInt(taskId) && t.user_id === userId);
    if (taskIndex === -1) return false;
    
    globalStore.tasks.splice(taskIndex, 1);
    return true;
  },

  // Category operations
  getCategories: (userId = 1) => {
    return globalStore.categories.filter(cat => !cat.user_id || cat.user_id === userId);
  },

  createCategory: (categoryData, userId = 1) => {
    const newCategory = {
      id: globalStore.nextCategoryId++,
      name: categoryData.name,
      color: categoryData.color,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    globalStore.categories.push(newCategory);
    return newCategory;
  },

  updateCategory: (categoryId, updates, userId = 1) => {
    const categoryIndex = globalStore.categories.findIndex(c => c.id === parseInt(categoryId) && c.user_id === userId);
    if (categoryIndex === -1) return null;
    
    const updatedCategory = {
      ...globalStore.categories[categoryIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    globalStore.categories[categoryIndex] = updatedCategory;
    return updatedCategory;
  },

  deleteCategory: (categoryId, userId = 1) => {
    const categoryIndex = globalStore.categories.findIndex(c => c.id === parseInt(categoryId) && c.user_id === userId);
    if (categoryIndex === -1) return false;
    
    // Update tasks that use this category
    globalStore.tasks.forEach(task => {
      if (task.category_id === parseInt(categoryId)) {
        task.category_id = null;
        task.category_name = null;
        task.category_color = null;
      }
    });
    
    globalStore.categories.splice(categoryIndex, 1);
    return true;
  },

  // Stats operations
  getStats: (userId = 1) => {
    const userTasks = globalStore.tasks.filter(task => task.user_id === userId);
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    // Calculate overdue tasks
    const now = new Date();
    const overdueTasks = userTasks.filter(task => 
      !task.completed && 
      task.due_date && 
      new Date(task.due_date) < now
    ).length;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      period: 'all',
      chartData: []
    };
  },

  // Debug operations
  getStore: () => globalStore,
  resetStore: () => {
    globalStore = {
      tasks: [],
      categories: [
        { id: 1, name: "Work", color: "#3B82F6", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, name: "Personal", color: "#10B981", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, name: "Shopping", color: "#F59E0B", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 4, name: "Health", color: "#EF4444", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 5, name: "Learning", color: "#8B5CF6", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ],
      users: [
        {
          id: 1,
          email: 'demo@voxa.app',
          first_name: 'Demo',
          last_name: 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      nextTaskId: 1,
      nextCategoryId: 6,
      nextUserId: 2
    };
  }
};
