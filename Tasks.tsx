import React, { useState } from 'react';
import { Task, LoadingState } from '../types';
import { Check, Circle, Trash2, Sparkles, Plus, Loader2 } from 'lucide-react';
import { organizeTasksWithAI } from '../services/geminiService';

interface TasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const Tasks: React.FC<TasksProps> = ({ tasks, setTasks }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');

  const addTask = (title: string, description?: string) => {
    if (!title.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      isCompleted: false,
      createdAt: Date.now(),
    };
    setTasks(prev => [task, ...prev]);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask(newTaskTitle);
    setNewTaskTitle('');
  };

  const handleAiSubmit = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(LoadingState.LOADING);
    try {
      const suggestedTasks = await organizeTasksWithAI(aiInput);
      suggestedTasks.forEach((t: any) => {
        addTask(t.title, t.description);
      });
      setAiInput('');
      setAiLoading(LoadingState.SUCCESS);
      setTimeout(() => setAiLoading(LoadingState.IDLE), 2000);
    } catch (error) {
      console.error(error);
      setAiLoading(LoadingState.ERROR);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Task Tracker</h2>
        <p className="text-slate-500">Don't let things pile up. Track your progress reliably.</p>
      </header>

      {/* Input Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'manual' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}
          >
            Quick Add
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}
          >
            <Sparkles className="w-4 h-4" />
            AI Organizer
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="submit"
                className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                Describe your mess or goals, and AI will break it down into a checklist for you.
              </p>
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="e.g., I need to plan a birthday party for my friend next week, get a gift, and invite people..."
                className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAiSubmit}
                  disabled={aiLoading === LoadingState.LOADING}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {aiLoading === LoadingState.LOADING ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Organize for Me
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-2">
        {tasks.length === 0 && (
            <div className="text-center py-12 text-slate-400">
                No tasks pending. You are all caught up!
            </div>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`group flex items-start gap-3 p-4 bg-white rounded-lg border transition-all ${
              task.isCompleted ? 'border-slate-100 bg-slate-50' : 'border-slate-200 shadow-sm hover:border-indigo-200'
            }`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-500 text-transparent'
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
            
            <div className="flex-1">
              <h4 className={`text-base font-medium ${task.isCompleted ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-800'}`}>
                {task.title}
              </h4>
              {task.description && (
                <p className={`text-sm mt-1 ${task.isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                  {task.description}
                </p>
              )}
            </div>

            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-2 transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};